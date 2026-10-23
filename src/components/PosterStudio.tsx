import React, { useState, useEffect, useRef } from 'react';
import { AudioProduct, PosterConfig } from '../types';
import { renderPosterToCanvas, generateWhatsAppMessage } from '../utils/canvasRenderer';
import {
  Download,
  Copy,
  Check,
  Smartphone,
  Square,
  Sparkles,
  Palette,
  Tag,
  DollarSign,
  Phone,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ExternalLink,
  Upload,
  X,
  Image as ImageIcon,
  RotateCcw,
  Dices,
  Percent,
} from 'lucide-react';

interface PosterStudioProps {
  catalog: AudioProduct[];
  selectedProduct: AudioProduct;
  onSelectProduct: (p: AudioProduct) => void;
  onOpenPitchModal: (p: AudioProduct, autoMode?: boolean) => void;
  brandLogo: string | null;
  onUploadLogo: (logo: string | null) => void;
  companyName: string;
  onUpdateProductImage: (productId: string, newImagePath: string) => void;
  onResetProductImage: (productId: string) => void;
  appliedPitch?: { headline: string; message: string; offerText?: string } | null;
}

const BADGE_PRESETS = [
  'SPECIAL 5% DISTRIBUTOR REBATE',
  '5% OFF DEALER NET RATE',
  'READY STOCK IN BHUBANESWAR',
  'EXCLUSIVE SI PROJECT NET RATE',
  'GENUINE PEAVEY 3-YR WARRANTY',
  'TENDER & BOQ APPROVED SPEC',
  'COASTAL ALL-WEATHER CERTIFIED',
  'SAME-DAY ODISHA DISPATCH',
];

export const PosterStudio: React.FC<PosterStudioProps> = ({
  catalog,
  selectedProduct,
  onSelectProduct,
  onOpenPitchModal,
  brandLogo,
  onUploadLogo,
  companyName,
  onUpdateProductImage,
  onResetProductImage,
  appliedPitch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fivePercentDiscount = Math.round((selectedProduct.siB2BPrice || 0) * 0.05);
  const discountedPrice = (selectedProduct.siB2BPrice || 0) - fivePercentDiscount;
  const initialOfferText = `Special 5% Distributor Rebate: ₹${discountedPrice.toLocaleString('en-IN')} + GST (Save ₹${fivePercentDiscount.toLocaleString('en-IN')})`;

  const [config, setConfig] = useState<PosterConfig>({
    aspectRatio: '9:16',
    theme: 'electric-blue',
    showPrice: true,
    priceType: 'si-net',
    customBadge: 'SPECIAL 5% DISTRIBUTOR REBATE',
    customHeadline: '',
    contactPerson: 'Sainath Electrocare Distribution Desk',
    contactNumber: '+91 94370 12345',
    contactEmail: 'sales@sainathelectrocare.com',
    cityLocation: 'Bhubaneswar Central Depot',
    partnerInfo: 'Authorized Peavey Regional Partner',
    customOfferText: initialOfferText,
    highlightApplications: true,
    distributorLogo: brandLogo || undefined,
    distributorCompanyName: companyName,
    showBrandLogoPlaceholder: true,
  });

  // Apply pitch text if passed from pitch assistant
  useEffect(() => {
    if (appliedPitch) {
      setConfig((prev) => ({
        ...prev,
        customHeadline: appliedPitch.headline || prev.customHeadline,
        customOfferText: appliedPitch.offerText || prev.customOfferText,
        customBadge: 'SPECIAL 5% DISTRIBUTOR REBATE',
      }));
    }
  }, [appliedPitch]);

  const [isRendering, setIsRendering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '100%'>('fit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep logo and company name in sync
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      distributorLogo: brandLogo || undefined,
      distributorCompanyName: companyName,
    }));
  }, [brandLogo, companyName]);

  useEffect(() => {
    let isMounted = true;

    async function triggerRender() {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderPosterToCanvas(canvasRef.current, selectedProduct, config);
      } catch (err) {
        console.error('Error rendering poster:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    }

    triggerRender();

    return () => {
      isMounted = false;
    };
  }, [selectedProduct, config]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    const filename = `peavey_${selectedProduct.model}_${config.aspectRatio.replace(':', 'x')}_poster.png`
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '_');
    link.download = filename;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();

    setToastMessage('Poster downloaded successfully');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyWhatsAppText = () => {
    const text = generateWhatsAppMessage(selectedProduct, config);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToastMessage('WhatsApp text copied');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2000);
  };

  const handleOpenWhatsAppWeb = () => {
    const text = generateWhatsAppMessage(selectedProduct, config);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleUploadCustomProductPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          onUpdateProductImage(selectedProduct.id, result);
          setToastMessage('Catalog photo updated for SKU');
          setTimeout(() => setToastMessage(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isCustomImage =
    selectedProduct.factoryImagePath && selectedProduct.imagePath !== selectedProduct.factoryImagePath;

  const whatsappMessagePreview = generateWhatsAppMessage(selectedProduct, config);

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-slate-950 px-4 py-2 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-yellow-300">
          <Check className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Aspect Ratio Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0D1832] border border-blue-900/40 rounded-2xl px-5 py-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="font-extrabold text-white text-base font-display">
            Peavey {selectedProduct.model}
          </span>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1.5 bg-[#080E1C] p-1 rounded-xl border border-blue-900/40">
          <button
            onClick={() => setConfig({ ...config, aspectRatio: '9:16' })}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              config.aspectRatio === '9:16'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 Status</span>
          </button>

          <button
            onClick={() => setConfig({ ...config, aspectRatio: '1:1' })}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              config.aspectRatio === '1:1'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1 Square</span>
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls in Blue/Yellow/White */}
        <div className="lg:col-span-5 space-y-4">
          {/* Brand Logo Placeholder & Upload Card */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-yellow-400 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Distributor Brand Logo</span>
              </label>

              <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showBrandLogoPlaceholder !== false}
                  onChange={(e) =>
                    setConfig({ ...config, showBrandLogoPlaceholder: e.target.checked })
                  }
                  className="rounded text-yellow-400 bg-blue-950 border-blue-800"
                />
                <span>Show on poster</span>
              </label>
            </div>

            {brandLogo ? (
              <div className="flex items-center justify-between bg-[#080E1C] p-2.5 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2.5">
                  <img
                    src={brandLogo}
                    alt="Brand Logo"
                    className="h-9 max-w-[140px] object-contain rounded bg-black/40 p-1 border border-blue-500/20"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Logo Active</span>
                    <span className="text-[10px] text-yellow-400 font-mono">{companyName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <label className="p-1.5 text-xs text-blue-300 hover:text-white cursor-pointer" title="Change Logo">
                    <Upload className="w-3.5 h-3.5" />
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
                  <button
                    onClick={() => onUploadLogo(null)}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                    title="Remove logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-yellow-400/50 hover:border-yellow-300 bg-yellow-400/5 hover:bg-yellow-400/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center transition-all">
                <Upload className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white">Upload Your Brand Logo</span>
                <span className="text-[10px] text-yellow-300/80 font-mono">
                  Displays alongside {companyName} on exported posters
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

          {/* Product Image Consistency Engine Card */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                <span>Product Image Consistency</span>
              </label>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-500/30">
                {isCustomImage ? 'Depot Photo' : 'Factory Catalog Spec'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#080E1C] p-2.5 rounded-xl border border-blue-900/40">
              <img
                src={selectedProduct.imagePath}
                alt={selectedProduct.model}
                className="w-14 h-12 object-cover rounded-lg bg-black/50 border border-blue-900/50 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate font-display">
                  {selectedProduct.model}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {isCustomImage ? 'Custom uploaded image active' : 'Verified canonical factory visual'}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <label
                  className="p-1.5 bg-[#122246] hover:bg-yellow-400 hover:text-slate-950 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Upload official catalog cutout or warehouse photo"
                >
                  <Upload className="w-3 h-3" />
                  <span className="text-[10px] font-mono font-bold">Replace</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCustomProductPhoto}
                    className="hidden"
                  />
                </label>

                {isCustomImage && (
                  <button
                    onClick={() => {
                      onResetProductImage(selectedProduct.id);
                      setToastMessage('Restored official factory catalog visual');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="p-1.5 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs transition-colors"
                    title="Restore Factory Catalog Image"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product SKU Selector */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2">
            <label className="text-[11px] font-mono font-bold text-blue-300 uppercase block">
              Featured Peavey Product
            </label>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const found = catalog.find((p) => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-yellow-400"
            >
              {catalog.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.brand} - {prod.model}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Palette */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2.5">
            <label className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-yellow-400" />
              <span>Theme Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setConfig({ ...config, theme: 'electric-blue' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  config.theme === 'electric-blue'
                    ? 'bg-[#152B5C] border-yellow-400 shadow-md'
                    : 'bg-[#080E1C] border-blue-900/40 hover:border-blue-500/50'
                }`}
              >
                <div className="text-xs font-bold text-white font-display">Cobalt Blue</div>
                <div className="text-[10px] text-yellow-400 font-semibold font-mono">Electric</div>
              </button>

              <button
                onClick={() => setConfig({ ...config, theme: 'yellow-volt' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  config.theme === 'yellow-volt'
                    ? 'bg-[#152B5C] border-yellow-400 shadow-md'
                    : 'bg-[#080E1C] border-blue-900/40 hover:border-blue-500/50'
                }`}
              >
                <div className="text-xs font-bold text-white font-display">Volt Yellow</div>
                <div className="text-[10px] text-yellow-300 font-semibold font-mono">Highlight</div>
              </button>

              <button
                onClick={() => setConfig({ ...config, theme: 'deep-navy' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  config.theme === 'deep-navy'
                    ? 'bg-[#152B5C] border-yellow-400 shadow-md'
                    : 'bg-[#080E1C] border-blue-900/40 hover:border-blue-500/50'
                }`}
              >
                <div className="text-xs font-bold text-white font-display">Deep Navy</div>
                <div className="text-[10px] text-blue-300 font-semibold font-mono">Midnight</div>
              </button>
            </div>
          </div>

          {/* Badge Callout */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2">
            <label className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-yellow-400" />
              <span>Marketing Badge</span>
            </label>
            <input
              type="text"
              value={config.customBadge}
              onChange={(e) => setConfig({ ...config, customBadge: e.target.value })}
              placeholder="Badge text"
              className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {BADGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConfig({ ...config, customBadge: preset })}
                  className="text-[10px] font-mono font-semibold px-2.5 py-1 bg-[#122246] hover:bg-yellow-400 hover:text-slate-950 text-slate-300 rounded-lg border border-blue-900/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Toggle */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                <span>Price Display</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPrice}
                  onChange={(e) => setConfig({ ...config, showPrice: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            {config.showPrice && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, priceType: 'si-net' })}
                  className={`p-2.5 rounded-xl text-xs text-left border ${
                    config.priceType === 'si-net'
                      ? 'bg-[#152B5C] border-yellow-400 font-bold text-white'
                      : 'bg-[#080E1C] border-blue-900/40 text-slate-400'
                  }`}
                >
                  SI Net Rate (+GST)
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, priceType: 'mrp-and-net' })}
                  className={`p-2.5 rounded-xl text-xs text-left border ${
                    config.priceType === 'mrp-and-net'
                      ? 'bg-[#152B5C] border-yellow-400 font-bold text-white'
                      : 'bg-[#080E1C] border-blue-900/40 text-slate-400'
                  }`}
                >
                  MRP + SI Net
                </button>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2">
            <label className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-yellow-400" />
              <span>Contact Desk</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={config.contactNumber}
                onChange={(e) => setConfig({ ...config, contactNumber: e.target.value })}
                placeholder="Phone / WhatsApp"
                className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-yellow-400"
              />
              <input
                type="text"
                value={config.contactPerson}
                onChange={(e) => setConfig({ ...config, contactPerson: e.target.value })}
                placeholder="Contact Name"
                className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* AI Pitch Assistant Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onOpenPitchModal(selectedProduct, true)}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-yellow-950/30 transition-all"
            >
              <Dices className="w-4 h-4 text-slate-950" />
              <span>🎲 Auto Pitch (5% Off)</span>
            </button>

            <button
              onClick={() => onOpenPitchModal(selectedProduct, false)}
              className="w-full py-2.5 bg-blue-950/60 hover:bg-blue-900/60 text-yellow-300 font-bold border border-yellow-400/40 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Custom Pitch</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Poster Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          {/* Action Toolbar */}
          <div className="w-full flex items-center justify-between gap-3 bg-[#0D1832] border border-blue-900/40 rounded-2xl px-5 py-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-300">
                {config.aspectRatio === '9:16' ? '1080×1920 (WhatsApp Status)' : '1080×1080 (Square)'}
              </span>
              {isRendering && (
                <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewZoom(previewZoom === 'fit' ? '100%' : 'fit')}
                className="px-3 py-1.5 rounded-lg bg-[#080E1C] hover:bg-[#122246] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-blue-900/40 transition-colors"
              >
                {previewZoom === 'fit' ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
                <span>{previewZoom === 'fit' ? 'Fit' : '100%'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-yellow-950/30"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handleOpenWhatsAppWeb}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div
            className={`w-full flex items-center justify-center p-4 bg-[#050A14] border border-blue-900/40 rounded-2xl overflow-auto ${
              previewZoom === 'fit' ? 'max-h-[640px]' : 'max-h-[850px]'
            }`}
          >
            <div
              className={`transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-blue-800/40 bg-black ${
                config.aspectRatio === '9:16'
                  ? previewZoom === 'fit'
                    ? 'w-[320px] sm:w-[350px] aspect-9/16'
                    : 'w-[540px] aspect-9/16'
                  : previewZoom === 'fit'
                  ? 'w-[380px] sm:w-[460px] aspect-square'
                  : 'w-[640px] aspect-square'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
              />
            </div>
          </div>

          {/* WhatsApp Text Pitch Tray */}
          <div className="w-full bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase">
                WhatsApp Ready Pitch Copy
              </span>

              <button
                onClick={handleCopyWhatsAppText}
                className="px-3 py-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 text-xs font-bold rounded-lg border border-yellow-400/40 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-400" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-[#080E1C] border border-blue-900/30 rounded-xl p-3.5 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
              {whatsappMessagePreview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
