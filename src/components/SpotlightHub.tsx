import React, { useState } from 'react';
import { AudioProduct } from '../types';
import {
  Calendar as CalendarIcon,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Dices,
  Percent,
} from 'lucide-react';

interface SpotlightHubProps {
  catalog: AudioProduct[];
  selectedProduct: AudioProduct;
  onSelectProduct: (product: AudioProduct) => void;
  onOpenStudio: (product: AudioProduct) => void;
  onOpenPitchAssistant: (product: AudioProduct, autoMode?: boolean) => void;
  companyName?: string;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SpotlightHub: React.FC<SpotlightHubProps> = ({
  catalog,
  selectedProduct,
  onSelectProduct,
  onOpenStudio,
  onOpenPitchAssistant,
  companyName,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const currentDayIndex = new Date().getDay();
  const todayProduct = catalog.find((p) => p.featuredDayOfWeek === currentDayIndex) || catalog[0];
  const activeSpotlight = selectedProduct || todayProduct;

  // Calculate dates for current selected week (Monday to Sunday)
  const baseNow = new Date();
  const currentDay = baseNow.getDay();
  const mondayDiff = baseNow.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + weekOffset * 7;
  const startOfWeek = new Date(baseNow.setDate(mondayDiff));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dayOfWeek = d.getDay();
    const product = catalog.find((p) => p.featuredDayOfWeek === dayOfWeek) || catalog[i % catalog.length];
    const isToday = d.toDateString() === new Date().toDateString();

    return {
      date: d,
      dayNumber: d.getDate(),
      monthName: d.toLocaleString('default', { month: 'short' }),
      weekday: WEEKDAY_NAMES[i],
      dayOfWeek,
      product,
      isToday,
    };
  });

  // Calculate days for the month view
  const currentYear = baseNow.getFullYear();
  const currentMonth = baseNow.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const monthStartDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const monthCells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(currentYear, currentMonth, i + 1);
    const dayOfWeek = d.getDay();
    const product = catalog.find((p) => p.featuredDayOfWeek === dayOfWeek) || catalog[i % catalog.length];
    const isToday = d.toDateString() === new Date().toDateString();

    return {
      date: d,
      dayNumber: i + 1,
      dayOfWeek,
      product,
      isToday,
    };
  });

  const monthYearLabel = startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Spotlight Section in Pro Blue / Yellow Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0D1832] border border-blue-900/40 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Product Data & Direct Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-yellow-400 uppercase mb-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>PEAVEY</span>
                <span>·</span>
                <span className="text-blue-300">{activeSpotlight.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                {activeSpotlight.model}
              </h1>

              <p className="mt-1.5 text-base text-slate-300 font-normal leading-relaxed">
                {activeSpotlight.shortTagline}
              </p>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeSpotlight.keySpecs.slice(0, 4).map((spec, idx) => (
                <div key={idx} className="bg-[#122246] border border-blue-800/30 rounded-xl p-3">
                  <div className="text-[11px] font-mono text-slate-400 uppercase leading-none">
                    {spec.label}
                  </div>
                  <div className="text-base font-extrabold text-white mt-1 tabular-nums font-display">
                    {spec.value}
                  </div>
                  {spec.unit && (
                    <div className="text-[11px] text-yellow-300 font-semibold">
                      {spec.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Applications List */}
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="font-bold text-yellow-400 uppercase tracking-wider text-[11px] font-mono">
                Applications:
              </span>
              <span className="text-white">{activeSpotlight.targetApplications.join(' · ')}</span>
            </div>

            {/* Pricing & Commercial Highlights with Guaranteed 5% Distributor Rebate */}
            <div className="flex flex-wrap items-center gap-5 bg-[#0B142B] p-4 rounded-xl border border-blue-900/50">
              <div>
                <div className="text-[11px] font-mono text-blue-300 uppercase font-semibold">
                  Dealer Net Rate
                </div>
                <div className="text-2xl font-extrabold text-white font-display">
                  ₹{activeSpotlight.siB2BPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-sans text-slate-400 ml-1.5">+ GST</span>
                </div>
              </div>

              {/* 5% Distributor Rebate Pill */}
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-1.5">
                <div className="text-[10px] font-mono text-yellow-400 uppercase font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3 text-yellow-400" />
                  <span>5% Distributor Rebate</span>
                </div>
                <div className="text-base font-extrabold text-yellow-300 font-display">
                  ₹{Math.round(activeSpotlight.siB2BPrice * 0.95).toLocaleString('en-IN')}
                  <span className="text-[10px] font-mono text-yellow-400/90 ml-1 font-semibold">
                    (Save ₹{Math.round(activeSpotlight.siB2BPrice * 0.05).toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase">MRP</div>
                <div className="text-base font-semibold text-slate-500 line-through font-display">
                  ₹{activeSpotlight.mrp.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-blue-200">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>{activeSpotlight.warrantyYears}-Year Peavey Warranty</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onOpenPitchAssistant(activeSpotlight, true)}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-lg shadow-lg shadow-yellow-950/30 transition-all flex items-center gap-2 text-sm"
                title="Randomly pick target venue & angle with 5% rebate locked"
              >
                <Dices className="w-4 h-4 text-slate-950" />
                <span>🎲 Auto Mode Pitch</span>
              </button>

              <button
                onClick={() => onOpenStudio(activeSpotlight)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg shadow-lg shadow-blue-950/30 transition-all flex items-center gap-2 text-sm"
              >
                <span>Create Poster</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenPitchAssistant(activeSpotlight, false)}
                className="px-4 py-2.5 bg-blue-950/60 hover:bg-blue-900/60 text-slate-200 hover:text-white font-semibold rounded-lg border border-blue-500/40 transition-colors flex items-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4 text-yellow-400" />
                <span>Custom Pitch</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Equipment Visual */}
          <div className="lg:col-span-5">
            <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/60 border border-blue-900/50 shadow-2xl relative">
              <img
                src={activeSpotlight.imagePath}
                alt={activeSpotlight.model}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-mono">
                <span className="font-bold text-yellow-400">{activeSpotlight.brand.toUpperCase()}</span>
                <span className="text-white font-semibold bg-blue-600/60 px-2 py-0.5 rounded text-[10px]">
                  BHUBANESWAR DEPOT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Daily Marketing Calendar View */}
      <div className="bg-[#0D1832] border border-blue-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {/* Calendar Navigation Bar */}
        <div className="p-4 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-4 bg-[#0A1226]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CalendarIcon className="w-4 h-4 text-yellow-400" />
              <span className="font-display font-bold uppercase tracking-wider text-base">
                {monthYearLabel}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#122246] p-1 rounded-lg border border-blue-900/50">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-1 text-slate-300 hover:text-white rounded"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2.5 py-0.5 text-xs text-yellow-300 hover:text-yellow-200 font-bold"
              >
                Today
              </button>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-1 text-slate-300 hover:text-white rounded"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week vs Month Switcher */}
          <div className="flex items-center gap-1 bg-[#122246] p-1 rounded-lg border border-blue-900/50">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-yellow-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              7-Day Calendar
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-yellow-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Month View
            </button>
          </div>
        </div>

        {/* 1. 7-Day Calendar View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-blue-900/40">
            {weekDays.map((item, idx) => {
              const isSelected = activeSpotlight.id === item.product.id;

              return (
                <div
                  key={idx}
                  onClick={() => onSelectProduct(item.product)}
                  className={`group relative flex flex-col justify-between p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#162954] ring-2 ring-yellow-400/80 inset-0'
                      : item.isToday
                      ? 'bg-[#0E1C3D] hover:bg-[#132550]'
                      : 'bg-[#0D1832] hover:bg-[#112042]'
                  }`}
                >
                  {/* Calendar Cell Date Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-blue-900/40">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold text-white font-display leading-none">
                          {item.dayNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase">
                          {item.weekday}
                        </span>
                      </div>

                      {item.isToday && (
                        <span className="text-[10px] font-mono font-bold bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded shadow">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Product Inside Calendar Slot */}
                    <div className="mt-3 space-y-2">
                      <div className="aspect-16/10 w-full rounded-lg overflow-hidden bg-black/50 border border-blue-900/40 relative">
                        <img
                          src={item.product.imagePath}
                          alt={item.product.model}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 bg-blue-950/90 border border-blue-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-yellow-300">
                          {item.product.brand}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1 font-display">
                          {item.product.model}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.product.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cell Footer */}
                  <div className="mt-4 pt-2.5 border-t border-blue-900/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white font-display">
                        ₹{(item.product.siB2BPrice / 1000).toFixed(0)}k <span className="text-[10px] text-yellow-400 font-sans">+GST</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Ready Stock
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPitchAssistant(item.product, true);
                        }}
                        className="p-1.5 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 transition-colors border border-yellow-400/30"
                        title="Auto Pitch (5% Rebate)"
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudio(item.product);
                        }}
                        className="p-1.5 rounded-lg bg-blue-600/40 hover:bg-yellow-400 text-white hover:text-slate-950 transition-colors"
                        title="Open in Studio"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Monthly Calendar Grid View */}
        {viewMode === 'month' && (
          <div>
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 border-b border-blue-900/40 bg-[#0A1226] text-center text-xs font-mono font-bold text-blue-300 py-2.5">
              {WEEKDAY_NAMES.map((w, idx) => (
                <div key={idx}>{w}</div>
              ))}
            </div>

            {/* Monthly Day Grid */}
            <div className="grid grid-cols-7 border-collapse">
              {/* Padding empty cells before 1st of month */}
              {Array.from({ length: monthStartDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-28 bg-[#070D1E]/60 border-r border-b border-blue-900/30" />
              ))}

              {monthCells.map((cell) => {
                const isSelected = activeSpotlight.id === cell.product.id;

                return (
                  <div
                    key={cell.dayNumber}
                    onClick={() => onSelectProduct(cell.product)}
                    className={`h-28 p-2 border-r border-b border-blue-900/30 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#162954]'
                        : cell.isToday
                        ? 'bg-[#0E1C3D] hover:bg-[#132550]'
                        : 'bg-[#0D1832] hover:bg-[#112042]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          cell.isToday
                            ? 'w-5 h-5 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-extrabold'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      <span className="text-[10px] font-mono text-yellow-400 font-bold">
                        ₹{(cell.product.siB2BPrice / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 my-1">
                      <img
                        src={cell.product.imagePath}
                        alt=""
                        className="w-7 h-7 rounded object-cover shrink-0 bg-black/40 border border-blue-900/40"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-white truncate font-display">
                          {cell.product.model}
                        </div>
                        <div className="text-[9px] text-blue-300 truncate">
                          {cell.product.brand}
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-emerald-400 font-semibold truncate">
                      Ready Stock
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
