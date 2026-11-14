'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FooterNavProps {
  currentSpread: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({
  currentSpread,
  onPrev,
  onNext,
  onSelect,
}) => {
  const tabs = [
    { idx: 0, label: 'Sampul Depan', short: 'Sampul' },
    { idx: 1, label: 'Pembuka', short: 'Awal' },
    { idx: 2, label: 'Bab I', short: 'Bab I' },
    { idx: 3, label: 'Bab II', short: 'Bab II' },
    { idx: 4, label: 'Bab III 💖', short: 'Bab III' },
  ];

  const getPrevText = () => {
    if (currentSpread === 0) return 'Awal';
    if (currentSpread === 1) return 'Sampul';
    if (currentSpread === 2) return 'Pembuka';
    if (currentSpread === 3) return 'Bab I';
    return 'Bab II';
  };

  const getNextText = () => {
    if (currentSpread === 0) return 'Buka';
    if (currentSpread === 1) return 'Bab I';
    if (currentSpread === 2) return 'Bab II';
    if (currentSpread === 3) return 'Bab III';
    return 'Akhir';
  };

  return (
    <footer className="relative z-30 w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
      <button
        onClick={onPrev}
        disabled={currentSpread === 0}
        type="button"
        className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#3b1223]/90 hover:bg-[#be123c] disabled:opacity-25 disabled:pointer-events-none text-[#fce7f3] hover:text-white text-[11px] sm:text-xs font-medium border border-[#f472b6]/40 flex items-center gap-1 sm:gap-1.5 transition shadow cursor-pointer shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden xs:inline sm:inline">{getPrevText()}</span>
      </button>

      {/* Chapter Indicator Dots */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-[#240a17]/90 px-2 sm:px-3 py-1 rounded-full border border-[#f472b6]/40 shadow-inner overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.idx}
            type="button"
            onClick={() => onSelect(tab.idx)}
            className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-typewriter transition cursor-pointer whitespace-nowrap ${
              currentSpread === tab.idx
                ? 'bg-[#be123c] text-white font-semibold shadow-sm'
                : 'text-[#fbcfe8] hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="inline sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentSpread === 4}
        type="button"
        className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#be123c] hover:bg-[#e11d48] disabled:opacity-25 disabled:pointer-events-none text-white text-[11px] sm:text-xs font-medium border border-[#fbcfe8] flex items-center gap-1 sm:gap-1.5 transition shadow cursor-pointer shrink-0"
      >
        <span className="hidden xs:inline sm:inline">{getNextText()}</span>
        {currentSpread < 4 && <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </footer>
  );
};
