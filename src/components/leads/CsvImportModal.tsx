import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { Lead } from '@/src/types/database.ts';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    leads: Partial<Lead>[],
    duplicateHandling: 'skip' | 'update_empty',
    fileName: string,
    mapping: Record<string, string>
  ) => Promise<{
    imported: Lead[];
    updated: Lead[];
    skipped: number;
    failed: number;
  }>;
  existingLeads: Lead[];
}

const TARGET_FIELDS: { key: keyof Lead | 'name'; label: string; required?: boolean }[] = [
  { key: 'business_name', label: 'Business Name', required: true },
  { key: 'category_name', label: 'Category' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'website_url', label: 'Website URL' },
  { key: 'address', label: 'Address' },
  { key: 'google_maps_url', label: 'Google Maps URL' },
  { key: 'google_rating', label: 'Rating (0 - 5)' },
  { key: 'review_count', label: 'Review Count' },
  { key: 'business_description', label: 'Description' },
];

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'summary'>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update_empty'>('skip');

  const [rowErrors, setRowErrors] = useState<{ row: number; error: string }[]>([]);
  const [validCandidates, setValidCandidates] = useState<Partial<Lead>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Summary state
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      alert('The uploaded CSV must contain at least a header row and one data row.');
      return;
    }

    // Split CSV respecting quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const parsedHeaders = parseLine(lines[0]);
    const parsedRows = lines.slice(1).map((l) => parseLine(l));

    setHeaders(parsedHeaders);
    setRawRows(parsedRows);

    // Auto-detect common headings
    const initialMapping: Record<string, string> = {};
    parsedHeaders.forEach((header) => {
      const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (h.includes('businessname') || h === 'name' || h === 'company' || h === 'title') {
        initialMapping['business_name'] = header;
      } else if (h.includes('phone') || h.includes('tel') || h.includes('mobile')) {
        initialMapping['phone'] = header;
      } else if (h.includes('email') || h.includes('mail')) {
        initialMapping['email'] = header;
      } else if (h.includes('web') || h.includes('url') || h.includes('site') || h.includes('domain')) {
        initialMapping['website_url'] = header;
      } else if (h.includes('city') || h.includes('town')) {
        initialMapping['city'] = header;
      } else if (h.includes('country') || h.includes('nation')) {
        initialMapping['country'] = header;
      } else if (h.includes('cat') || h.includes('industry') || h.includes('sector')) {
        initialMapping['category_name'] = header;
      } else if (h.includes('addr') || h.includes('street') || h.includes('location')) {
        initialMapping['address'] = header;
      } else if (h.includes('maps') || h.includes('googleurl')) {
        initialMapping['google_maps_url'] = header;
      } else if (h.includes('rating') || h.includes('score') || h.includes('stars')) {
        initialMapping['google_rating'] = header;
      } else if (h.includes('review') || h.includes('count')) {
        initialMapping['review_count'] = header;
      } else if (h.includes('desc') || h.includes('about') || h.includes('note')) {
        initialMapping['business_description'] = header;
      }
    });

    setFieldMapping(initialMapping);
    setStep('mapping');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        parseCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        parseCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const validateAndProceedToPreview = () => {
    if (!fieldMapping['business_name']) {
      alert('Business Name mapping is required to import leads.');
      return;
    }

    const errors: { row: number; error: string }[] = [];
    const candidates: Partial<Lead>[] = [];

    const getVal = (row: string[], fieldKey: string): string => {
      const colHeader = fieldMapping[fieldKey];
      if (!colHeader) return '';
      const idx = headers.indexOf(colHeader);
      return idx !== -1 && row[idx] ? row[idx].trim() : '';
    };

    rawRows.forEach((row, rowIdx) => {
      const rowNum = rowIdx + 2; // header is 1
      const bName = getVal(row, 'business_name');
      if (!bName) {
        errors.push({ row: rowNum, error: 'Missing Business Name' });
        return;
      }

      // Validate rating
      const ratingRaw = getVal(row, 'google_rating');
      let ratingNum: number | null = null;
      if (ratingRaw) {
        const parsed = parseFloat(ratingRaw);
        if (isNaN(parsed) || parsed < 0 || parsed > 5) {
          errors.push({ row: rowNum, error: `Invalid rating "${ratingRaw}" (must be between 0 and 5)` });
          return;
        }
        ratingNum = parsed;
      }

      // Validate review count
      const reviewRaw = getVal(row, 'review_count');
      let reviewCount = 0;
      if (reviewRaw) {
        const parsed = parseInt(reviewRaw, 10);
        if (isNaN(parsed) || parsed < 0) {
          errors.push({ row: rowNum, error: `Invalid review count "${reviewRaw}" (must be non-negative)` });
          return;
        }
        reviewCount = parsed;
      }

      // Validate email format if provided
      const emailRaw = getVal(row, 'email');
      if (emailRaw && !emailRaw.includes('@')) {
        errors.push({ row: rowNum, error: `Invalid email format "${emailRaw}"` });
        return;
      }

      // Validate website URL if provided
      const webRaw = getVal(row, 'website_url');
      let websiteUrl: string | null = null;
      if (webRaw) {
        if (!webRaw.includes('.') || webRaw.length < 4) {
          errors.push({ row: rowNum, error: `Invalid website URL format "${webRaw}"` });
          return;
        }
        websiteUrl = webRaw.startsWith('http://') || webRaw.startsWith('https://') ? webRaw : `https://${webRaw}`;
      }

      candidates.push({
        business_name: bName,
        category_name: getVal(row, 'category_name') || 'General Business',
        city: getVal(row, 'city') || 'Dubai',
        country: getVal(row, 'country') || 'United Arab Emirates',
        phone: getVal(row, 'phone') || null,
        email: emailRaw || null,
        website_url: websiteUrl,
        address: getVal(row, 'address') || null,
        google_maps_url: getVal(row, 'google_maps_url') || null,
        google_rating: ratingNum,
        review_count: reviewCount,
        business_description: getVal(row, 'business_description') || null,
        source: 'csv_import',
      });
    });

    setRowErrors(errors);
    setValidCandidates(candidates);
    setStep('preview');
  };

  const handleExecuteImport = async () => {
    if (validCandidates.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await onImport(validCandidates, duplicateHandling, fileName, fieldMapping);
      setImportSummary({
        imported: res.imported.length,
        updated: res.updated.length,
        skipped: res.skipped,
        failed: res.failed + rowErrors.length,
      });
      setStep('summary');
    } catch (err: any) {
      alert(err?.message || 'CSV Import failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#E8E9EC] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E9EC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">
              {step === 'upload' && 'Import Leads from CSV'}
              {step === 'mapping' && 'Map CSV Columns'}
              {step === 'preview' && 'Review & Validate Leads'}
              {step === 'summary' && 'Import Complete'}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {step === 'upload' && 'Upload a spreadsheet containing business leads.'}
              {step === 'mapping' && 'Match your CSV column headers to Jigaway fields.'}
              {step === 'preview' && `${validCandidates.length} valid rows ready to import.`}
              {step === 'summary' && 'Summary of imported, updated, and deduplicated records.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#171717] rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E8E9EC] hover:border-[#171717] rounded-xl p-10 text-center cursor-pointer transition-colors bg-[#F9FAFB]/50 hover:bg-[#F9FAFB]"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E9EC] text-[#171717] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#171717]">
                Click to upload or drag and drop CSV
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Standard columns supported: Business Name, City, Country, Phone, Email, Website, Category, Address, Rating.
              </p>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <span className="font-medium text-[#171717]">{fileName}</span>
                  <span className="text-[#6B7280]">({rawRows.length} rows detected)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {TARGET_FIELDS.map((target) => (
                  <div key={target.key} className="p-2.5 rounded-lg border border-[#E8E9EC] bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-[#171717]">
                        {target.label} {target.required && <span className="text-[#E30613]">*</span>}
                      </span>
                      {fieldMapping[target.key] && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Mapped
                        </span>
                      )}
                    </div>
                    <select
                      value={fieldMapping[target.key] || ''}
                      onChange={(e) =>
                        setFieldMapping({
                          ...fieldMapping,
                          [target.key]: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs rounded border border-[#E8E9EC] bg-white text-[#374151]"
                    >
                      <option value="">-- Do not import --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={validateAndProceedToPreview}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#171717] rounded-lg hover:bg-black transition-colors"
                >
                  <span>Preview & Validate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC] text-xs">
                <div>
                  <span className="font-semibold text-emerald-700">
                    {validCandidates.length} rows valid
                  </span>
                  {rowErrors.length > 0 && (
                    <span className="text-red-600 ml-2">
                      ({rowErrors.length} invalid rows will be skipped)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6B7280]">Duplicate policy:</span>
                  <select
                    value={duplicateHandling}
                    onChange={(e) => setDuplicateHandling(e.target.value as any)}
                    className="px-2 py-1 text-xs rounded border border-[#E8E9EC] bg-white text-[#374151]"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="update_empty">Update empty fields</option>
                  </select>
                </div>
              </div>

              {rowErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1 max-h-28 overflow-y-auto">
                  <div className="font-semibold text-red-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Row Validation Errors:</span>
                  </div>
                  {rowErrors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-red-700 text-[11px]">
                      Row {err.row}: {err.error}
                    </p>
                  ))}
                  {rowErrors.length > 5 && (
                    <p className="text-red-500 text-[10px]">
                      ...and {rowErrors.length - 5} more validation errors.
                    </p>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-[#E8E9EC] rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E8E9EC] text-[#6B7280] font-medium sticky top-0">
                        <th className="p-2.5">Business Name</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Website</th>
                        <th className="p-2.5">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E9EC]">
                      {validCandidates.slice(0, 5).map((cand, idx) => (
                        <tr key={idx} className="hover:bg-[#F9FAFB]">
                          <td className="p-2.5 font-medium text-[#171717]">{cand.business_name}</td>
                          <td className="p-2.5 text-[#374151]">{cand.city}, {cand.country}</td>
                          <td className="p-2.5 text-[#6B7280]">{cand.category_name}</td>
                          <td className="p-2.5 text-[#374151] font-mono text-[11px]">{cand.phone || '—'}</td>
                          <td className="p-2.5 text-[#374151] truncate max-w-[140px]">{cand.website_url || '—'}</td>
                          <td className="p-2.5 text-[#374151]">
                            {cand.google_rating != null ? `★ ${cand.google_rating.toFixed(1)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[11px] text-[#6B7280] italic">Showing first 5 rows preview.</p>

              <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={validCandidates.length === 0 || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] disabled:opacity-60 transition-colors shadow-2xs"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Import {validCandidates.length} Leads</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'summary' && importSummary && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Leads Imported Successfully</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Batch import processed and recorded in your organization audit log.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto pt-2 text-xs">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                  <span className="text-[#6B7280] block text-[11px]">Imported</span>
                  <span className="text-base font-semibold text-emerald-600">{importSummary.imported}</span>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                  <span className="text-[#6B7280] block text-[11px]">Updated</span>
                  <span className="text-base font-semibold text-blue-600">{importSummary.updated}</span>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                  <span className="text-[#6B7280] block text-[11px]">Skipped Dupes</span>
                  <span className="text-base font-semibold text-amber-600">{importSummary.skipped}</span>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                  <span className="text-[#6B7280] block text-[11px]">Failed</span>
                  <span className="text-base font-semibold text-red-600">{importSummary.failed}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#171717] rounded-lg hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
