import React, { useState } from 'react';
import {
  Search,
  X,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Building,
  CheckCircle2,
  Globe,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { SerperProvider } from '@/src/lib/services/mockServices.ts';
import { NormalizedLeadResult } from '@/src/lib/services/types.ts';
import { Lead, Market, BusinessCategory } from '@/src/types/database.ts';
import { checkDuplicateLead } from '@/src/lib/utils/deduplication.ts';

interface FindLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    leads: NormalizedLeadResult[],
    duplicateHandling: 'skip' | 'update_empty'
  ) => Promise<void>;
  existingLeads: Lead[];
  availableMarkets: Market[];
  availableCategories: BusinessCategory[];
}

export const FindLeadsModal: React.FC<FindLeadsModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingLeads,
  availableMarkets,
  availableCategories,
}) => {
  const [step, setStep] = useState<'search' | 'review'>('search');
  const [country, setCountry] = useState('United Arab Emirates');
  const [city, setCity] = useState('Dubai');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState<number>(25);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  // Review state
  const [results, setResults] = useState<NormalizedLeadResult[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update_empty'>('skip');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !city.trim() || !country.trim()) {
      setErrorMessage('Please fill in Country, City, and Business Category.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const provider = new SerperProvider();
    const response = await provider.searchLeads({
      country: country.trim(),
      city: city.trim(),
      category: category.trim(),
      limit,
    });

    setIsLoading(false);
    setIsConfigured(response.isConfigured);

    if (!response.success) {
      setErrorMessage(response.error || 'Failed to retrieve results from Serper.');
      return;
    }

    if (response.results.length === 0) {
      setErrorMessage(`No businesses found matching "${category}" in ${city}, ${country}. Try a broader category term.`);
      return;
    }

    setResults(response.results);
    // Select all non-duplicates by default
    const initialSelected = new Set<number>();
    response.results.forEach((item, idx) => {
      const dup = checkDuplicateLead(
        {
          source: 'serper',
          source_external_id: item.source_external_id,
          business_name: item.business_name,
          city: item.city,
          address: item.address,
          phone: item.phone,
          website_url: item.website_url,
        },
        existingLeads
      );
      if (!dup.isDuplicate) {
        initialSelected.add(idx);
      }
    });

    setSelectedIndices(initialSelected);
    setStep('review');
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === results.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(results.map((_, i) => i)));
    }
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const handleImportSubmit = async () => {
    const selectedLeads = results.filter((_, idx) => selectedIndices.has(idx));
    if (selectedLeads.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(selectedLeads, duplicateHandling);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to import leads.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#E8E9EC] shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E9EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {step === 'review' && (
              <button
                type="button"
                onClick={() => setStep('search')}
                className="p-1 -ml-1 text-[#6B7280] hover:text-[#171717] rounded hover:bg-[#F3F4F6]"
                title="Back to search"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-[#171717]">
                {step === 'search' ? 'Find Leads via Serper' : 'Review Serper Results'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {step === 'search'
                  ? 'Discover verified commercial business leads in Gulf markets.'
                  : `Reviewing ${results.length} discovered businesses before import.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#171717] rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'search' ? (
            <form onSubmit={handleSearch} className="space-y-5 max-w-xl mx-auto">
              {!isConfigured && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Serper API Key Notice</span>
                    <p className="leading-relaxed">
                      To run live Google Places searches, add your <code className="px-1 py-0.5 bg-amber-100/80 rounded font-mono">SERPER_API_KEY</code> to the project environment variables.
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    Country <span className="text-[#E30613]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United Arab Emirates"
                    list="market-countries"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
                  />
                  <datalist id="market-countries">
                    {availableMarkets.map((m) => (
                      <option key={m.id} value={m.country} />
                    ))}
                    <option value="United Arab Emirates" />
                    <option value="Saudi Arabia" />
                    <option value="Qatar" />
                    <option value="Kuwait" />
                    <option value="Bahrain" />
                    <option value="Oman" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">
                    City <span className="text-[#E30613]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dubai"
                    list="market-cities"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
                  />
                  <datalist id="market-cities">
                    {availableMarkets.map((m) => (
                      <option key={m.id} value={m.city} />
                    ))}
                    <option value="Dubai" />
                    <option value="Abu Dhabi" />
                    <option value="Sharjah" />
                    <option value="Riyadh" />
                    <option value="Jeddah" />
                    <option value="Doha" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Business Category <span className="text-[#E30613]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. car detailing, barber shop, dental clinic"
                  list="suggested-categories"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
                />
                <datalist id="suggested-categories">
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                  <option value="Car Detailing" />
                  <option value="Barbers" />
                  <option value="Beauty Salons" />
                  <option value="Clinics" />
                  <option value="Restaurants" />
                  <option value="Real Estate" />
                  <option value="Landscaping" />
                  <option value="Gyms" />
                </datalist>
                <span className="text-[11px] text-[#6B7280] mt-1 block">
                  Search query sent to Serper: <span className="font-mono text-[#171717]">{category ? `${category} in ${city}, ${country}` : 'Category + City + Country'}</span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Number of Leads Wanted
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLimit(num)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        limit === num
                          ? 'border-[#171717] bg-[#171717] text-white'
                          : 'border-[#E8E9EC] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {num} {num === 25 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] disabled:opacity-60 transition-colors shadow-2xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching Serper...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Find Leads</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC] text-xs">
                <div>
                  <span className="font-semibold text-[#171717]">
                    {results.length} valid business results found
                  </span>
                  <span className="text-[#6B7280] ml-2">
                    ({selectedIndices.size} selected for import)
                  </span>
                </div>
                <div className="flex items-center gap-3">
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

              {/* Review Table */}
              <div className="border border-[#E8E9EC] rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E8E9EC] text-[#6B7280] font-medium sticky top-0 z-10">
                        <th className="p-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedIndices.size === results.length && results.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-[#E8E9EC] text-[#E30613] focus:ring-[#E30613]"
                          />
                        </th>
                        <th className="p-3">Business Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Rating / Reviews</th>
                        <th className="p-3">Website Status</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Duplicate Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E9EC]">
                      {results.map((item, idx) => {
                        const isSelected = selectedIndices.has(idx);
                        const dup = checkDuplicateLead(
                          {
                            source: 'serper',
                            source_external_id: item.source_external_id,
                            business_name: item.business_name,
                            city: item.city,
                            address: item.address,
                            phone: item.phone,
                            website_url: item.website_url,
                          },
                          existingLeads
                        );

                        return (
                          <tr
                            key={idx}
                            onClick={() => toggleSelect(idx)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-red-50/20' : 'hover:bg-[#F9FAFB]'
                            }`}
                          >
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(idx)}
                                className="rounded border-[#E8E9EC] text-[#E30613] focus:ring-[#E30613]"
                              />
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-[#171717] block">
                                {item.business_name}
                              </span>
                              <span className="text-[#6B7280] text-[11px]">
                                {item.category_name || category}
                              </span>
                            </td>
                            <td className="p-3 text-[#374151]">
                              <span>{item.city}, {item.country}</span>
                              {item.address && (
                                <span className="block text-[11px] text-[#6B7280] truncate max-w-[180px]">
                                  {item.address}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {item.google_rating != null ? (
                                <span className="font-medium text-[#171717]">
                                  ★ {item.google_rating.toFixed(1)}{' '}
                                  <span className="text-[#6B7280] font-normal">
                                    ({item.review_count})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[#98A1B2]">No rating</span>
                              )}
                            </td>
                            <td className="p-3">
                              {item.website_url ? (
                                <a
                                  href={item.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[#2563EB] hover:underline max-w-[150px] truncate"
                                >
                                  <Globe className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{item.website_url.replace(/^https?:\/\//, '')}</span>
                                </a>
                              ) : (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                                  No website found
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#374151]">
                              {item.phone ? (
                                <span className="font-mono text-[11px]">{item.phone}</span>
                              ) : (
                                <span className="text-[#98A1B2]">None</span>
                              )}
                            </td>
                            <td className="p-3">
                              {dup.isDuplicate ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200"
                                  title={dup.reason}
                                >
                                  <AlertCircle className="w-3 h-3 shrink-0 text-amber-600" />
                                  Duplicate ({dup.matchType})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                                  New lead
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review Actions */}
              <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Back
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={selectedIndices.size === 0 || isImporting}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] disabled:opacity-60 transition-colors shadow-2xs"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing leads...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Import Selected ({selectedIndices.size})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
