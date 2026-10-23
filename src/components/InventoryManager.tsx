import React, { useState } from 'react';
import { AudioProduct, BrandType } from '../types';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  Sliders,
  Check,
  X,
  CheckCircle2,
  Camera,
  RotateCcw,
} from 'lucide-react';

interface InventoryManagerProps {
  catalog: AudioProduct[];
  onUpdateCatalog: (newCatalog: AudioProduct[]) => void;
  onOpenStudioWithProduct: (product: AudioProduct) => void;
  onUpdateProductImage: (productId: string, newImagePath: string) => void;
  onResetProductImage: (productId: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  catalog,
  onUpdateCatalog,
  onOpenStudioWithProduct,
  onUpdateProductImage,
  onResetProductImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMrp, setEditMrp] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>('In Stock');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState<AudioProduct['category']>('Power Amplifiers');
  const [newTagline, setNewTagline] = useState('');
  const [newStatus, setNewStatus] = useState('In Stock');
  const [newSiPrice, setNewSiPrice] = useState(75000);
  const [newMrp, setNewMrp] = useState(105000);
  const [newApplications, setNewApplications] = useState('Auditoriums, Banquet Halls');

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortTagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetApplications.some((app) => app.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleStartEdit = (product: AudioProduct) => {
    setEditingId(product.id);
    setEditPrice(product.siB2BPrice);
    setEditMrp(product.mrp);
    setEditStatus(product.stockStatus || 'In Stock');
  };

  const handleSaveEdit = (productId: string) => {
    const updated = catalog.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          siB2BPrice: editPrice,
          mrp: editMrp,
          stockStatus: editStatus,
        };
      }
      return p;
    });
    onUpdateCatalog(updated);
    setEditingId(null);
  };

  const handleDeleteItem = (productId: string) => {
    if (confirm('Delete this product from catalog?')) {
      onUpdateCatalog(catalog.filter((p) => p.id !== productId));
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID,Brand,Model,Category,Availability,SI Net Price (INR),MRP (INR),Warranty Years,Tagline,Applications'];
    const rows = catalog.map((p) =>
      `"${p.id}","${p.brand}","${p.model}","${p.category}","${p.stockStatus}",${p.siB2BPrice},${p.mrp},${p.warrantyYears},"${p.shortTagline}","${p.targetApplications.join('; ')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peavey_odisha_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) return;

        const newProducts: AudioProduct[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 6) {
            newProducts.push({
              id: cols[0] || `item-${Date.now()}-${i}`,
              brand: 'Peavey',
              model: cols[2] || 'Peavey Model',
              category: (cols[3] || 'Power Amplifiers') as any,
              stockStatus: cols[4] || 'In Stock',
              siB2BPrice: parseFloat(cols[5]) || 50000,
              mrp: parseFloat(cols[6]) || 70000,
              warrantyYears: parseInt(cols[7], 10) || 3,
              shortTagline: cols[8] || 'Commercial Audio System',
              keySpecs: [
                { label: 'RMS Output', value: 'High Efficiency' },
                { label: 'Protection', value: 'DDT Limiting' },
              ],
              targetApplications: cols[9] ? cols[9].split(';').map((s) => s.trim()) : ['Auditoriums'],
              imagePath: '/src/assets/images/peavey_cs_4000_1792722718118.jpg',
              factoryImagePath: '/src/assets/images/peavey_cs_4000_1792722718118.jpg',
            });
          }
        }

        if (newProducts.length > 0) {
          onUpdateCatalog(newProducts);
        }
      } catch (err) {
        console.error('Failed to parse CSV:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim()) return;

    const newProd: AudioProduct = {
      id: `peavey-${Date.now()}`,
      brand: 'Peavey',
      model: newModel,
      category: newCategory,
      shortTagline: newTagline || 'Peavey Commercial Audio System',
      keySpecs: [
        { label: 'Power', value: 'Commercial Grade' },
        { label: 'Protection', value: 'Patented DDT' },
      ],
      targetApplications: newApplications.split(',').map((s) => s.trim()),
      stockStatus: newStatus,
      mrp: newMrp,
      siB2BPrice: newSiPrice,
      warrantyYears: 3,
      imagePath:
        newCategory === 'Digital Mixers'
          ? '/src/assets/images/peavey_mixer_1792429236232.jpg'
          : newCategory === 'Architectural Audio'
          ? '/src/assets/images/architectural_speaker_1792429235558.jpg'
          : newCategory === 'Power Amplifiers'
          ? '/src/assets/images/peavey_cs_4000_1792722718118.jpg'
          : '/src/assets/images/peavey_line_array_1792429235105.jpg',
      factoryImagePath:
        newCategory === 'Digital Mixers'
          ? '/src/assets/images/peavey_mixer_1792429236232.jpg'
          : newCategory === 'Architectural Audio'
          ? '/src/assets/images/architectural_speaker_1792429235558.jpg'
          : newCategory === 'Power Amplifiers'
          ? '/src/assets/images/peavey_cs_4000_1792722718118.jpg'
          : '/src/assets/images/peavey_line_array_1792429235105.jpg',
    };

    onUpdateCatalog([newProd, ...catalog]);
    setIsAddModalOpen(false);
    setNewModel('');
    setNewTagline('');
  };

  const handleRowImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) onUpdateProductImage(productId, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Bar in Blue / Yellow Theme */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0D1832] border border-blue-900/40 rounded-2xl px-5 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <h2 className="text-base font-extrabold text-white font-display">
            Peavey Pro Audio Catalog & SI Rates
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-[#080E1C] hover:bg-[#122246] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-blue-900/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <label className="px-3.5 py-1.5 rounded-xl bg-[#080E1C] hover:bg-[#122246] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-blue-900/40 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md shadow-yellow-950/30"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>Add Peavey SKU</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1832] border border-blue-900/40 rounded-2xl p-3.5 shadow-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Peavey model, category, application..."
            className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-yellow-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-yellow-400"
          >
            <option value="All">All Categories</option>
            <option value="Power Amplifiers">Power Amplifiers (CS & IPR2)</option>
            <option value="Line Arrays & Speakers">Line Arrays & Speakers</option>
            <option value="Digital Mixers">Digital Mixers</option>
            <option value="Architectural Audio">Architectural Audio</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-900/40 bg-[#0A1226] text-blue-300 font-mono uppercase text-[11px]">
                <th className="py-3 px-4 font-bold">Peavey Model</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Availability</th>
                <th className="py-3 px-4 font-bold">SI Net (₹)</th>
                <th className="py-3 px-4 font-bold">MRP (₹)</th>
                <th className="py-3 px-4 font-bold">Margin</th>
                <th className="py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {filteredCatalog.map((product) => {
                const isEditing = editingId === product.id;
                const marginPercent = Math.round(((product.mrp - product.siB2BPrice) / product.mrp) * 100);
                const hasCustomPhoto = product.factoryImagePath && product.imagePath !== product.factoryImagePath;

                return (
                  <tr key={product.id} className="hover:bg-blue-950/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group/photo shrink-0">
                          <img
                            src={product.imagePath}
                            alt={product.model}
                            className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-blue-900/40"
                            referrerPolicy="no-referrer"
                          />
                          <label
                            className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center opacity-0 group-hover/photo:opacity-100 cursor-pointer transition-opacity"
                            title="Upload custom catalog/depot photo"
                          >
                            <Camera className="w-3.5 h-3.5 text-yellow-400" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleRowImageUpload(product.id, e)}
                              className="hidden"
                            />
                          </label>
                          {hasCustomPhoto && (
                            <button
                              onClick={() => onResetProductImage(product.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100"
                              title="Restore factory catalog image"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <div className="font-extrabold text-white text-xs font-display">
                            {product.model}
                          </div>
                          <div className="text-[10px] text-yellow-400 font-semibold font-mono">
                            PEAVEY
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {product.category}
                    </td>

                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="bg-[#080E1C] border border-yellow-400 rounded-lg px-2 py-1 text-white text-xs font-medium"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Available for Project">Available for Project</option>
                          <option value="Arriving Soon">Arriving Soon</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{product.stockStatus || 'In Stock'}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-24 bg-[#080E1C] border border-yellow-400 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      ) : (
                        `₹${product.siB2BPrice.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMrp}
                          onChange={(e) => setEditMrp(parseFloat(e.target.value) || 0)}
                          className="w-24 bg-[#080E1C] border border-yellow-400 rounded-lg px-2 py-1 text-white font-mono"
                        />
                      ) : (
                        `₹${product.mrp.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-yellow-400">
                      +{marginPercent}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(product.id)}
                            className="p-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenStudioWithProduct(product)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Poster</span>
                          </button>

                          <button
                            onClick={() => handleStartEdit(product)}
                            className="p-1 text-slate-300 hover:text-white rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(product.id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredCatalog.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No products matched filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SKU Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1832] border border-blue-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
              <h3 className="font-extrabold text-white uppercase font-display text-base tracking-wide">
                Add Peavey SKU
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="space-y-3.5">
              <div>
                <label className="text-blue-300 block mb-1 font-semibold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2 font-medium"
                >
                  <option value="Power Amplifiers">Power Amplifiers (CS & IPR2)</option>
                  <option value="Line Arrays & Speakers">Line Arrays & Speakers</option>
                  <option value="Digital Mixers">Digital Mixers</option>
                  <option value="Architectural Audio">Architectural Audio</option>
                </select>
              </div>

              <div>
                <label className="text-blue-300 block mb-1 font-semibold">Peavey Model Name</label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. CS 4000 or IPR2 7500"
                  className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-blue-300 block mb-1 font-semibold">Availability</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2 text-xs"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Available for Project">Project Order</option>
                    <option value="Arriving Soon">Arriving Soon</option>
                  </select>
                </div>

                <div>
                  <label className="text-blue-300 block mb-1 font-semibold">SI Net (₹)</label>
                  <input
                    type="number"
                    value={newSiPrice}
                    onChange={(e) => setNewSiPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="text-blue-300 block mb-1 font-semibold">MRP (₹)</label>
                  <input
                    type="number"
                    value={newMrp}
                    onChange={(e) => setNewMrp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-extrabold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
