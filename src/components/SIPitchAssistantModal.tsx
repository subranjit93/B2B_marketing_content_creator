import React, { useState, useEffect } from 'react';
import { AudioProduct, SIPitchResponse } from '../types';
import {
  Sparkles,
  X,
  Check,
  Copy,
  RefreshCw,
  Dices,
  Lock,
  Percent,
  CheckCircle2,
  TrendingDown,
  Building2,
  Sliders,
} from 'lucide-react';

interface SIPitchAssistantModalProps {
  product: AudioProduct;
  isOpen: boolean;
  onClose: () => void;
  onApplyPitch: (headline: string, message: string, offerText?: string) => void;
  autoModeInitial?: boolean;
}

const VENUE_OPTIONS = [
  'Auditoriums & Convention Halls in Bhubaneswar',
  'Wedding Mandaps & High-End Banquet Sound across Odisha',
  'Houses of Worship & Jagannath Temple Audio Installations',
  'Coastal Luxury Resorts & Hotels (Puri, Paradeep, Gopalpur)',
  'University Lecture Halls & Government Council Chambers',
  'Touring Sound Contractors & Live Stage Rigs',
  'Multiplex Cinemas & Cultural Auditoriums in Cuttack & Rourkela',
  'Smart City Public Address & Outdoor Sports Stadiums',
];

const TONE_OPTIONS = [
  'Technical Engineering & High-Power Headroom Reliability',
  'High-Margin SI Advantage & Project Price Protection',
  'Immediate Stock Clearance & Urgent Bhubaneswar Depot Dispatch',
  'Tender Specification & Strict BOQ Compliance',
  'Acoustic Clarity & Severe Climate / Humidity Resistance',
];

export const SIPitchAssistantModal: React.FC<SIPitchAssistantModalProps> = ({
  product,
  isOpen,
  onClose,
  onApplyPitch,
  autoModeInitial = false,
}) => {
  // 5% Distributor discount calculation - strictly calculated off dealer price
  const dealerPrice = product.siB2BPrice || 0;
  const discountRate = 0.05; // 5% always
  const discountAmount = Math.round(dealerPrice * discountRate);
  const netDiscountedPrice = dealerPrice - discountAmount;

  const defaultOfferString = `Special 5% Distributor Rebate: ₹${netDiscountedPrice.toLocaleString(
    'en-IN'
  )} + GST (Save ₹${discountAmount.toLocaleString(
    'en-IN'
  )} off Dealer Net) · Immediate Bhubaneswar Central Depot Dispatch`;

  const [isAutoMode, setIsAutoMode] = useState(autoModeInitial);
  const [targetProject, setTargetProject] = useState(VENUE_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [pitchResult, setPitchResult] = useState<SIPitchResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [autoRandomCount, setAutoRandomCount] = useState(0);

  // Pick random elements from an array excluding the current one if possible
  const getRandomItem = (arr: string[], current: string) => {
    const filtered = arr.filter((item) => item !== current);
    const pool = filtered.length > 0 ? filtered : arr;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Helper to generate pitch with explicit params
  const executePitchGeneration = async (
    proj: string,
    t: string,
    offer: string
  ) => {
    setLoading(true);
    setPitchResult(null);
    try {
      const response = await fetch('/api/generate-si-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          targetProject: proj,
          tone: t,
          customOffer: offer,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setPitchResult(data.data);
      }
    } catch (err) {
      console.error('Error generating SI pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-shuffle: randomly picks venue and sales angle, locks offer to 5%, and triggers generation
  const handleAutoPickAndGenerate = () => {
    const randomVenue = getRandomItem(VENUE_OPTIONS, targetProject);
    const randomTone = getRandomItem(TONE_OPTIONS, tone);

    setTargetProject(randomVenue);
    setTone(randomTone);
    setAutoRandomCount((prev) => prev + 1);
    setIsAutoMode(true);

    executePitchGeneration(randomVenue, randomTone, defaultOfferString);
  };

  // Standard generate handler
  const handleManualGeneratePitch = () => {
    executePitchGeneration(targetProject, tone, defaultOfferString);
  };

  // Auto-trigger on initial opening if autoModeInitial is requested or first time open in auto
  useEffect(() => {
    if (isOpen && autoModeInitial) {
      handleAutoPickAndGenerate();
    }
  }, [isOpen, autoModeInitial]);

  // Reset results when product changes
  useEffect(() => {
    setPitchResult(null);
  }, [product.id]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!pitchResult) return;
    navigator.clipboard.writeText(pitchResult.whatsappBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!pitchResult) return;
    onApplyPitch(pitchResult.headline, pitchResult.whatsappBody, defaultOfferString);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0D1832] border border-blue-900/60 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-yellow-950/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white uppercase font-display tracking-tight">
                  SI Pitch Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  PEAVEY
                </span>
              </div>
              <p className="text-xs text-blue-300 font-mono">
                {product.model} · Dealer Net: ₹{dealerPrice.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-blue-950/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distributor Offer Guarantee Card (5% Discount Always Locked) */}
        <div className="bg-gradient-to-r from-[#0B1530] via-[#102047] to-[#0B1530] border-2 border-yellow-400/40 rounded-xl p-3.5 sm:p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-yellow-400 text-slate-950 font-bold">
                <Percent className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                Distributor Commercial Offer (Always 5% Off Dealer Net)
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
              <Lock className="w-2.5 h-2.5" />
              <span>5% LOCKED</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-[#080E1C] p-2 rounded-lg border border-blue-900/40">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Dealer Base Price</div>
              <div className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 font-display">
                ₹{dealerPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-[#080E1C] p-2 rounded-lg border border-yellow-400/30">
              <div className="text-[10px] font-mono text-yellow-400 uppercase font-semibold">
                5% Distributor Rebate
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-yellow-400 mt-0.5 font-display flex items-center justify-center gap-0.5">
                <TrendingDown className="w-3 h-3 text-yellow-400" />
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-[#122246] p-2 rounded-lg border border-blue-500/40">
              <div className="text-[10px] font-mono text-blue-300 uppercase font-semibold">
                Effective SI Net
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5 font-display">
                ₹{netDiscountedPrice.toLocaleString('en-IN')}
                <span className="text-[9px] text-yellow-400 font-sans ml-1">+GST</span>
              </div>
            </div>

            <div className="bg-[#080E1C] p-2 rounded-lg border border-blue-900/40">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Fulfillment</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 font-display truncate">
                Bhubaneswar Depot
              </div>
            </div>
          </div>
        </div>

        {/* Auto Mode Control Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080E1C] p-3 rounded-xl border border-blue-900/50">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                isAutoMode
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-950/40'
                  : 'bg-blue-950/60 text-slate-300 hover:text-white border border-blue-900/60'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Auto Mode: {isAutoMode ? 'ON' : 'OFF'}</span>
            </button>
            <span className="text-xs text-blue-200">
              {isAutoMode
                ? 'Randomizing target project venue & sales angle on each roll'
                : 'Manual target selection active'}
            </span>
          </div>

          <button
            onClick={handleAutoPickAndGenerate}
            disabled={loading}
            className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-yellow-950/30 transition-all disabled:opacity-50"
            title="Randomly pick target venue, angle, lock 5% discount and craft pitch"
          >
            <Dices className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>🎲 Auto-Pick & Generate</span>
          </button>
        </div>

        {/* Selected Parameters & Inputs */}
        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-blue-200 font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>Target Project Venue (Odisha Region)</span>
              </label>
              {isAutoMode && (
                <span className="text-[10px] font-mono text-yellow-400 font-semibold">
                  🎲 Auto-Selected
                </span>
              )}
            </div>
            <select
              value={targetProject}
              onChange={(e) => {
                setTargetProject(e.target.value);
                setIsAutoMode(false);
              }}
              className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2.5 font-medium focus:outline-none focus:border-yellow-400 transition-colors"
            >
              {VENUE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-blue-200 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Sales Angle & Pitch Tone</span>
                </label>
                {isAutoMode && (
                  <span className="text-[10px] font-mono text-yellow-400 font-semibold">
                    🎲 Auto-Selected
                  </span>
                )}
              </div>
              <select
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value);
                  setIsAutoMode(false);
                }}
                className="w-full bg-[#080E1C] text-white border border-blue-900/50 rounded-xl p-2.5 font-medium focus:outline-none focus:border-yellow-400 transition-colors"
              >
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-blue-200 font-semibold flex items-center justify-between mb-1">
                <span>Distributor Offer</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 5% Off Always
                </span>
              </label>
              <div className="w-full bg-[#080E1C]/80 text-yellow-300 border border-blue-900/50 rounded-xl p-2.5 font-mono text-[11px] truncate select-none">
                Special 5% Distributor Rebate (₹{netDiscountedPrice.toLocaleString('en-IN')} + GST)
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleAutoPickAndGenerate}
              disabled={loading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-yellow-950/30 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Generating Random SI Pitch...</span>
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4 text-slate-950" />
                  <span>Auto-Randomize & Generate</span>
                </>
              )}
            </button>

            <button
              onClick={handleManualGeneratePitch}
              disabled={loading}
              className="w-full py-2.5 bg-blue-950/60 hover:bg-blue-900/70 text-white font-bold rounded-xl border border-blue-500/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Generate with Selected Venue</span>
            </button>
          </div>
        </div>

        {/* Results Display */}
        {pitchResult && (
          <div className="space-y-4 pt-3 border-t border-blue-900/50">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-bold text-yellow-400 uppercase">
                  Broadcast Status Headline
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Includes 5% Rebate
                </span>
              </div>
              <div className="p-3 bg-[#080E1C] rounded-xl text-white font-bold text-xs border border-blue-900/40">
                {pitchResult.headline}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold text-blue-300 uppercase block mb-1">
                WhatsApp Pitch Text (Ready to Send to Odisha SIs)
              </span>
              <div className="p-3.5 bg-[#080E1C] rounded-xl text-slate-200 font-mono text-xs border border-blue-900/40 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                {pitchResult.whatsappBody}
              </div>
            </div>

            {pitchResult.siKeyBenefits && pitchResult.siKeyBenefits.length > 0 && (
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Key Technical & Commercial Advantages
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-[#080E1C] p-3 rounded-xl border border-blue-900/40">
                  {pitchResult.siKeyBenefits.map((b, idx) => (
                    <li key={idx} className="leading-snug">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-[#080E1C] hover:bg-[#122246] text-white text-xs font-semibold rounded-xl border border-blue-900/40 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleApply}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-yellow-950/30 transition-colors"
              >
                {applied ? (
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{applied ? 'Applied!' : 'Apply to Studio'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
