import React, { useState } from 'react';
import { Volume2, Sparkles, Layers, Sliders, Smartphone, Upload, X, Edit3, Check } from 'lucide-react';

interface HeaderProps {
  activeTab: 'spotlight' | 'studio' | 'inventory' | 'broadcast';
  setActiveTab: (tab: 'spotlight' | 'studio' | 'inventory' | 'broadcast') => void;
  onQuickGenerate: () => void;
  brandLogo: string | null;
  onUploadLogo: (logo: string | null) => void;
  companyName: string;
  onUpdateCompanyName: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickGenerate,
  brandLogo,
  onUploadLogo,
  companyName,
  onUpdateCompanyName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(companyName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateCompanyName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A1224]/95 backdrop-blur-md border-b border-blue-900/30 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Distributor Custom Brand Logo & Company Title */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo Placeholder / Upload */}
          <div className="relative group">
            {brandLogo ? (
              <div className="relative flex items-center">
                <img
                  src={brandLogo}
                  alt="Brand Logo"
                  className="h-8 max-w-[130px] object-contain rounded bg-blue-950/40 p-1 border border-blue-500/30"
                />
                <button
                  onClick={() => onUploadLogo(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove logo"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <label
                className="cursor-pointer h-8 px-2.5 rounded-md border border-dashed border-yellow-400/60 hover:border-yellow-300 bg-yellow-400/5 hover:bg-yellow-400/10 flex items-center gap-1.5 text-xs text-yellow-300 transition-colors"
                title="Click to upload your Brand Logo"
              >
                <Upload className="w-3 h-3 text-yellow-400" />
                <span className="font-mono text-[10px] font-bold text-yellow-300 tracking-wider">
                  + YOUR LOGO
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onUploadLogo(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Editable Distributor Company Name */}
          {isEditingName ? (
            <div className="flex items-center gap-1 bg-[#080E1C] border border-yellow-400 rounded-lg p-0.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-transparent text-white px-2 py-0.5 text-sm font-bold font-display focus:outline-none w-48"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button
                onClick={handleSaveName}
                className="p-1 bg-yellow-400 text-slate-950 rounded hover:bg-yellow-300"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/name">
              <button
                onClick={() => setActiveTab('spotlight')}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-400 group-hover/name:scale-125 transition-transform" />
                <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap font-display">
                  {companyName}
                </span>
              </button>

              <button
                onClick={() => {
                  setTempName(companyName);
                  setIsEditingName(true);
                }}
                className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-400 hover:text-yellow-400 transition-opacity"
                title="Edit Company Name"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('spotlight')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 border-b-2 ${
              activeTab === 'spotlight'
                ? 'text-white border-yellow-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Daily Spotlight</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 border-b-2 ${
              activeTab === 'studio'
                ? 'text-white border-yellow-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Poster Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 border-b-2 ${
              activeTab === 'inventory'
                ? 'text-white border-yellow-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Peavey Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 border-b-2 ${
              activeTab === 'broadcast'
                ? 'text-white border-yellow-400 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onQuickGenerate}
            className="px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-lg shadow-lg shadow-yellow-950/30 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Volume2 className="w-4 h-4 text-slate-950" />
            <span>Create Daily Poster</span>
          </button>
        </div>
      </div>
    </header>
  );
};
