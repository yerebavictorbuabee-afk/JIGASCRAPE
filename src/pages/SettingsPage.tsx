import React, { useState, useEffect } from 'react';
import {
  Globe,
  Tag,
  Key,
  History,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { Market, BusinessCategory, LeadImport } from '@/src/types/database.ts';
import { leadRepository } from '@/src/lib/services/leadRepository.ts';

type SettingsTab = 'markets' | 'categories' | 'api_status' | 'imports' | 'organization';

export const SettingsPage: React.FC = () => {
  const { session } = useAuth();
  const orgId = session?.user?.organization_id || 'org_default';

  const [activeTab, setActiveTab] = useState<SettingsTab>('markets');

  // Markets state
  const [markets, setMarkets] = useState<Market[]>([]);
  const [newCountry, setNewCountry] = useState('United Arab Emirates');
  const [newCity, setNewCity] = useState('');

  // Categories state
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Imports history state
  const [imports, setImports] = useState<LeadImport[]>([]);

  // API Status state
  const [apiHealth, setApiHealth] = useState<{
    checked: boolean;
    serverOk: boolean;
    serperConfigured: boolean;
    timestamp?: string;
  }>({
    checked: false,
    serverOk: false,
    serperConfigured: false,
  });
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  useEffect(() => {
    loadSettingsData();
    checkApiStatus();
  }, [orgId]);

  const loadSettingsData = async () => {
    const [m, c, imp] = await Promise.all([
      leadRepository.getMarkets(orgId),
      leadRepository.getCategories(orgId),
      leadRepository.getImports(orgId),
    ]);
    setMarkets(m);
    setCategories(c);
    setImports(imp);
  };

  const checkApiStatus = async () => {
    setIsCheckingApi(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiHealth({
          checked: true,
          serverOk: true,
          serperConfigured: Boolean(data.serperConfigured),
          timestamp: data.timestamp,
        });
      } else {
        setApiHealth({
          checked: true,
          serverOk: false,
          serperConfigured: false,
        });
      }
    } catch {
      setApiHealth({
        checked: true,
        serverOk: false,
        serperConfigured: false,
      });
    } finally {
      setIsCheckingApi(false);
    }
  };

  // Market handlers
  const handleAddMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    await leadRepository.addMarket(orgId, newCountry, newCity.trim());
    setNewCity('');
    const updated = await leadRepository.getMarkets(orgId);
    setMarkets(updated);
  };

  const handleToggleMarket = async (marketId: string) => {
    await leadRepository.toggleMarketActive(orgId, marketId);
    const updated = await leadRepository.getMarkets(orgId);
    setMarkets(updated);
  };

  const handleDeleteMarket = async (marketId: string) => {
    await leadRepository.deleteMarket(orgId, marketId);
    const updated = await leadRepository.getMarkets(orgId);
    setMarkets(updated);
  };

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await leadRepository.addCategory(orgId, newCatName.trim(), newCatDesc.trim() || undefined);
    setNewCatName('');
    setNewCatDesc('');
    const updated = await leadRepository.getCategories(orgId);
    setCategories(updated);
  };

  const handleToggleCategory = async (categoryId: string) => {
    await leadRepository.toggleCategoryActive(orgId, categoryId);
    const updated = await leadRepository.getCategories(orgId);
    setCategories(updated);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await leadRepository.deleteCategory(orgId, categoryId);
    const updated = await leadRepository.getCategories(orgId);
    setCategories(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E9EC]">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">Settings</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure Gulf target markets, business categories, service API connections, and import provenance.
          </p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center border-b border-[#E8E9EC] bg-white rounded-t-xl px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('markets')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'markets'
              ? 'border-[#E30613] text-[#E30613]'
              : 'border-transparent text-[#6B7280] hover:text-[#171717]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Gulf Markets ({markets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'categories'
              ? 'border-[#E30613] text-[#E30613]'
              : 'border-transparent text-[#6B7280] hover:text-[#171717]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api_status')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'api_status'
              ? 'border-[#E30613] text-[#E30613]'
              : 'border-transparent text-[#6B7280] hover:text-[#171717]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API & Service Status</span>
        </button>

        <button
          onClick={() => setActiveTab('imports')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'imports'
              ? 'border-[#E30613] text-[#E30613]'
              : 'border-transparent text-[#6B7280] hover:text-[#171717]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Import History ({imports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'organization'
              ? 'border-[#E30613] text-[#E30613]'
              : 'border-transparent text-[#6B7280] hover:text-[#171717]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization Scope</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-4 border-b border-[#E8E9EC]">
                Active Gulf Markets
              </h3>
              <div className="divide-y divide-[#F3F4F6] text-xs">
                {markets.map((market) => (
                  <div key={market.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-[#98A1B2]" />
                      <div>
                        <span className="font-semibold text-[#171717]">{market.city}</span>
                        <span className="text-[#6B7280] ml-2">({market.country})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleMarket(market.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          market.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}
                      >
                        {market.is_active ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDeleteMarket(market.id)}
                        className="p-1 text-[#98A1B2] hover:text-red-600 rounded"
                        title="Remove market"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Market Form */}
            <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs h-fit">
              <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-4 border-b border-[#E8E9EC]">
                Add Target Market
              </h3>
              <form onSubmit={handleAddMarket} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Country</label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB]"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Oman">Oman</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#374151] mb-1">City Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharjah, Dammam, Lusail"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#171717] text-white font-medium rounded-lg hover:bg-black transition-colors"
                >
                  Add Market
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-4 border-b border-[#E8E9EC]">
                Configured Commercial Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E8E9EC] space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[#171717]">
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Off'}
                      </button>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-[#6B7280] line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Category Form */}
            <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs h-fit">
              <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-4 border-b border-[#E8E9EC]">
                Add Business Category
              </h3>
              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Specialty Coffee, Veterinary Clinics"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#374151] mb-1">Description / Hook</label>
                  <textarea
                    rows={2}
                    placeholder="Acquisition angle or opportunity notes"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E8E9EC] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#171717] text-white font-medium rounded-lg hover:bg-black transition-colors"
                >
                  Add Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* API & Service Status Tab */}
        {activeTab === 'api_status' && (
          <div className="bg-white rounded-xl border border-[#E8E9EC] p-6 shadow-2xs max-w-3xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9EC]">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Service API Connections</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Live connection health for backend search and discovery proxies.
                </p>
              </div>
              <button
                onClick={checkApiStatus}
                disabled={isCheckingApi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E9EC] text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingApi ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Serper API Status */}
              <div className="p-4 rounded-xl border border-[#E8E9EC] bg-[#F9FAFB] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#171717]">Serper Google Places Search API</span>
                    {apiHealth.serperConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Configured
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Missing Key
                      </span>
                    )}
                  </div>
                  <p className="text-[#6B7280] leading-relaxed">
                    Used to discover real commercial businesses across Gulf cities. The API key is securely proxied server-side through <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E8E9EC]">/api/leads/search-serper</code> and never exposed to client browsers.
                  </p>
                </div>
              </div>

              {/* Express Server Health */}
              <div className="p-4 rounded-xl border border-[#E8E9EC] bg-[#F9FAFB] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#171717]">Express Full-Stack Server Proxy</span>
                    {apiHealth.serverOk ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Operational
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Unreachable
                      </span>
                    )}
                  </div>
                  <p className="text-[#6B7280]">
                    Port 3000 container ingress proxy handling search routes, deduplication, and production asset distribution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import History Tab */}
        {activeTab === 'imports' && (
          <div className="bg-white rounded-xl border border-[#E8E9EC] overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E8E9EC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Batch Import Provenance</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Audit log of all completed imports from Serper discovery and CSV files.
                </p>
              </div>
              <span className="text-xs font-mono text-[#98A1B2]">{imports.length} batches</span>
            </div>

            {imports.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#98A1B2]">
                <History className="w-6 h-6 mx-auto mb-2 text-[#98A1B2]" />
                <p>No import batches executed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] border-b border-[#E8E9EC] text-[#6B7280]">
                    <tr>
                      <th className="p-3">Source & Identifier</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Total Rows</th>
                      <th className="p-3 text-emerald-700">Imported</th>
                      <th className="p-3 text-amber-700">Duplicates</th>
                      <th className="p-3 text-red-700">Failed</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E9EC]">
                    {imports.map((imp) => (
                      <tr key={imp.id} className="hover:bg-[#F9FAFB]">
                        <td className="p-3 font-semibold text-[#171717]">
                          <div className="capitalize">{imp.source_type}</div>
                          <div className="text-[11px] text-[#6B7280] font-normal truncate max-w-xs">
                            {imp.file_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                            {imp.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{imp.total_rows}</td>
                        <td className="p-3 font-mono font-semibold text-emerald-700">{imp.imported_rows}</td>
                        <td className="p-3 font-mono text-amber-700">{imp.duplicate_rows}</td>
                        <td className="p-3 font-mono text-red-700">{imp.failed_rows}</td>
                        <td className="p-3 text-[#6B7280]">
                          {new Date(imp.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Organization Scope Tab */}
        {activeTab === 'organization' && (
          <div className="bg-white rounded-xl border border-[#E8E9EC] p-6 shadow-2xs max-w-2xl space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-[#171717] pb-3 border-b border-[#E8E9EC]">
              Organization Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[#6B7280] block mb-1 font-medium">Organization ID</span>
                <input
                  type="text"
                  disabled
                  value={orgId}
                  className="w-full p-2 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] font-mono text-[#171717]"
                />
              </div>
              <div>
                <span className="text-[#6B7280] block mb-1 font-medium">Active User</span>
                <input
                  type="text"
                  disabled
                  value={session?.user?.email || 'admin@jigaway.com'}
                  className="w-full p-2 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#171717]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed pt-2">
              All leads, score signals, team notes, and audit activities are scoped to this organization ID to ensure strict data partitioning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
