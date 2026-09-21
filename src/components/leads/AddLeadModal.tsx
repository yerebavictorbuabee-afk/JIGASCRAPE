import React, { useState } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Lead, Market, BusinessCategory } from '@/src/types/database.ts';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (leadData: Partial<Lead>) => Promise<{ lead: Lead; isDuplicate: boolean; duplicateReason?: string }>;
  availableMarkets: Market[];
  availableCategories: BusinessCategory[];
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  availableMarkets,
  availableCategories,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [city, setCity] = useState('Dubai');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [rating, setRating] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Business Name is required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    let parsedRating: number | null = null;
    if (rating.trim()) {
      const r = parseFloat(rating);
      if (isNaN(r) || r < 0 || r > 5) {
        setErrorMessage('Rating must be a number between 0.0 and 5.0');
        setIsLoading(false);
        return;
      }
      parsedRating = r;
    }

    let parsedReviews = 0;
    if (reviewCount.trim()) {
      const rc = parseInt(reviewCount, 10);
      if (isNaN(rc) || rc < 0) {
        setErrorMessage('Review count must be a non-negative number');
        setIsLoading(false);
        return;
      }
      parsedReviews = rc;
    }

    try {
      const result = await onAdd({
        business_name: businessName.trim(),
        category_name: categoryName.trim() || undefined,
        country: country.trim() || 'United Arab Emirates',
        city: city.trim() || 'Dubai',
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website_url: websiteUrl.trim() || null,
        google_maps_url: googleMapsUrl.trim() || null,
        google_rating: parsedRating,
        review_count: parsedReviews,
        business_description: description.trim() || null,
        source: 'manual',
      });

      if (result.isDuplicate) {
        setErrorMessage(`Duplicate detected: ${result.duplicateReason}`);
        setIsLoading(false);
        return;
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create lead.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#E8E9EC] shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#E8E9EC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">Add Lead Manually</h2>
            <p className="text-xs text-[#6B7280]">
              Create a single commercial business record in your workspace.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#171717] rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#374151] mb-1">
              Business Name <span className="text-[#E30613]">*</span>
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Detailing Studio"
              className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Business Category</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Car Detailing"
                list="add-categories"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
              <datalist id="add-categories">
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +971 4 123 4567"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United Arab Emirates"
                list="add-countries"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
              <datalist id="add-countries">
                {availableMarkets.map((m) => (
                  <option key={m.id} value={m.country} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dubai"
                list="add-cities"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
              <datalist id="add-cities">
                {availableMarkets.map((m) => (
                  <option key={m.id} value={m.city} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Al Quoz Industrial Area 3, Street 8"
              className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Website URL</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@example.com"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Google Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.8"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Review Count</label>
              <input
                type="number"
                min="0"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                placeholder="142"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Google Maps URL</label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Business Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Commercial business description or observations..."
              className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] bg-white focus:outline-none focus:ring-1 focus:ring-[#171717] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-[#171717] rounded-lg hover:bg-black disabled:opacity-60 transition-colors shadow-2xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
