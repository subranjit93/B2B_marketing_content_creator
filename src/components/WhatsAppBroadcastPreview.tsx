import React, { useState } from 'react';
import { AudioProduct } from '../types';
import { generateWhatsAppMessage } from '../utils/canvasRenderer';
import { Send, Copy, Check, ExternalLink, Users } from 'lucide-react';

interface WhatsAppBroadcastPreviewProps {
  catalog: AudioProduct[];
  selectedProduct: AudioProduct;
  onSelectProduct: (p: AudioProduct) => void;
  onOpenStudio: (p: AudioProduct) => void;
  companyName?: string;
}

const SI_REGIONAL_GROUPS = [
  { name: 'Bhubaneswar & Cuttack SIs' },
  { name: 'Puri & Coastal Audio Contractors' },
  { name: 'Western Odisha (Rourkela / Sambalpur)' },
  { name: 'Southern Odisha (Berhampur)' },
];

export const WhatsAppBroadcastPreview: React.FC<WhatsAppBroadcastPreviewProps> = ({
  catalog,
  selectedProduct,
  onSelectProduct,
  onOpenStudio,
  companyName,
}) => {
  const [copied, setCopied] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState('');

  const discountAmount = Math.round((selectedProduct.siB2BPrice || 0) * 0.05);
  const netDiscounted = (selectedProduct.siB2BPrice || 0) - discountAmount;

  const sampleConfig = {
    aspectRatio: '9:16' as const,
    theme: 'electric-blue' as const,
    showPrice: true,
    priceType: 'si-net' as const,
    customBadge: 'SPECIAL 5% DISTRIBUTOR REBATE',
    customHeadline: '',
    contactPerson: 'Pro Audio Distribution',
    contactNumber: '+91 94370 12345',
    contactEmail: 'sales@peaveyodisha.com',
    cityLocation: 'Bhubaneswar Depot',
    partnerInfo: 'Authorized Peavey Regional Partner',
    customOfferText: `Special 5% Distributor Rebate: ₹${netDiscounted.toLocaleString('en-IN')} + GST (Save ₹${discountAmount.toLocaleString('en-IN')})`,
    highlightApplications: true,
    distributorCompanyName: companyName,
  };

  const messageText = generateWhatsAppMessage(selectedProduct, sampleConfig);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendDirect = () => {
    const cleanNum = recipientNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageText);
    const url = cleanNum ? `https://wa.me/${cleanNum}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header in Blue / Yellow Theme */}
      <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <h2 className="text-base font-extrabold text-white font-display">
            WhatsApp Broadcast Simulator
          </h2>
        </div>

        <button
          onClick={() => onOpenStudio(selectedProduct)}
          className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-md"
        >
          Open in Studio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mobile WhatsApp Simulation Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-[330px] sm:w-[360px] rounded-[32px] bg-[#1F2C34] border-[6px] border-[#2E3B43] shadow-2xl overflow-hidden flex flex-col h-[640px]">
            {/* Top Phone Bar */}
            <div className="bg-[#0B141A] px-5 py-2 flex items-center justify-between text-slate-300 text-[11px] font-mono">
              <span>9:41</span>
              <span>100%</span>
            </div>

            {/* Chat Header */}
            <div className="bg-[#1F2C34] px-4 py-2.5 border-b border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                PV
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate font-display">
                  Peavey Audio · {companyName || 'Odisha Depot'}
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-[#0B141A] p-3 overflow-y-auto space-y-2 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="max-w-[92%] ml-auto bg-[#005C4B] rounded-2xl rounded-tr-xs p-2 shadow-md space-y-2">
                <div className="aspect-16/10 rounded-lg overflow-hidden bg-black/60 relative">
                  <img
                    src={selectedProduct.imagePath}
                    alt={selectedProduct.model}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] text-yellow-300 font-mono font-bold">
                    Peavey {selectedProduct.model}
                  </div>
                </div>

                <div className="text-[11px] text-white whitespace-pre-wrap font-sans leading-relaxed px-1">
                  {messageText}
                </div>

                <div className="text-right text-[10px] text-emerald-200/70 font-mono">
                  10:02 AM · ✓✓
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#1F2C34] p-2.5 flex items-center gap-2 border-t border-white/10">
              <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-xs text-slate-400">
                Message...
              </div>
              <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Broadcast Controls in Blue/Yellow/White */}
        <div className="lg:col-span-6 space-y-4">
          {/* Select Product */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2 shadow-xl">
            <span className="text-[11px] font-mono font-bold text-blue-300 uppercase block">
              Active Peavey Hardware
            </span>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const found = catalog.find((p) => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-yellow-400"
            >
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model}
                </option>
              ))}
            </select>
          </div>

          {/* Send Direct */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2 shadow-xl">
            <span className="text-[11px] font-mono font-bold text-blue-300 uppercase block">
              Direct Recipient Phone
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipientNumber}
                onChange={(e) => setRecipientNumber(e.target.value)}
                placeholder="+91 94370 00000"
                className="flex-1 bg-[#080E1C] text-white border border-blue-900/50 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={handleSendDirect}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md shadow-yellow-950/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Regional Groups */}
          <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl p-4 space-y-2.5 shadow-xl">
            <span className="text-[11px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-yellow-400" />
              <span>Odisha Regional SI Groups</span>
            </span>

            <div className="space-y-1.5">
              {SI_REGIONAL_GROUPS.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-[#080E1C] border border-blue-900/30 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white font-display">{group.name}</span>
                  <button
                    onClick={handleSendDirect}
                    className="px-3 py-1 bg-blue-600/40 hover:bg-yellow-400 hover:text-slate-950 text-white rounded-lg transition-colors text-[11px] font-bold"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Copy */}
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-[#080E1C] hover:bg-[#122246] text-white font-bold rounded-2xl border border-blue-900/50 text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-400" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Formatted Pitch Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
