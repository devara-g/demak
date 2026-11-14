'use client';

import React, { useState, useEffect } from 'react';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Music, CloudRain, Flower2, Edit3 } from 'lucide-react';

interface HeaderProps {
  state: BookState;
  onOpenCustomize: () => void;
  showToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onOpenCustomize, showToast }) => {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isRainOn, setIsRainOn] = useState(false);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const unsub = sound.onMusicChange((playing) => {
      setIsMusicOn(playing);
    });
    return () => unsub();
  }, []);

  const handleToggleMusic = () => {
    const active = sound.toggleBGM('/assets/adu_rayu.mp3', 0.55);
    setIsMusicOn(active);
  };

  const handleToggleRain = () => {
    const active = sound.toggleRain((playing) => setIsRainOn(playing));
    setIsRainOn(active);
  };

  const handlePetalShower = () => {
    sound.playPaperTurnSound();
    confetti({
      particleCount: 38,
      spread: 65,
      origin: { y: 0.1 },
      colors: ['#f472b6', '#fda4af', '#f43f5e', '#fecdd3', '#fb7185', '#ffe4e6'],
    });
  };

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Browser ini belum mendukung pembaca suara.');
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    window.speechSynthesis.cancel();
    let text = '';
    if (state.currentSpread === 0) {
      text = `${state.bookTitle}. Buku kecil untuk ${state.recipient}, dari ${state.sender}. Ada beberapa hal yang terlalu berharga kalau cuma diucapkan lewat chat singkat.`;
    } else if (state.currentSpread === 1) {
      text = `Pembuka. Lagu Adu Rayu menyala lembut untukmu, ${state.recipient}.`;
    } else if (state.currentSpread === 2) {
      text = `Bab Satu: Tentang Senyummu. Kalau pada akhir aku hanya bisa mengagumimu dari jauh setidaknya terima kasih kepada semesta karena pernah mengizinkanku mengenal seseorang seistimewa kamu.`;
    } else {
      text = `Bab Dua: Draf Sebelum Confess. Hai ${state.recipient}, sejujurnya aku suka banget sama kamu. Aku sudah memperhatikanmu dari lama, dan aku ingin jujur dari hati yang paling tulus.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <header className="relative z-30 w-full px-2.5 sm:px-6 pt-2 pb-1 flex items-center justify-between gap-1.5 sm:gap-2 max-w-6xl mx-auto shrink-0">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fce7f3] border border-[#f472b6] flex items-center justify-center shadow-sm shrink-0">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9d174d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5V20h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 20v-5.5a2.5 2.5 0 0 1 5 0V20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-typewriter text-[8.5px] sm:text-[10px] tracking-widest uppercase text-[#edd382] truncate">
              EDISI KHUSUS JASMINE
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.2 rounded-full bg-[#4c162b] text-[#fce7f3] font-medium border border-[#edd382]/30">
              Buku Kenangan Jasmine ❀
            </span>
          </div>
          <h1 className="text-[11px] sm:text-sm font-serif text-[#fff1f2] tracking-wide truncate">
            Buku Kecil Untuk{' '}
            <span className="underline decoration-[#f43f5e] decoration-wavy underline-offset-4 font-semibold">
              {state.recipient}
            </span>
          </h1>
        </div>
      </div>

      {/* Audio & Action Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Read Aloud */}
        <button
          onClick={handleReadAloud}
          type="button"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium bg-[#3b1223]/90 hover:bg-[#501930] text-[#fce7f3] border border-[#831843]/50 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Bacakan halaman ini dengan suara lembut"
        >
          {isReading ? <VolumeX className="w-3.5 h-3.5 text-yellow-300" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isReading ? 'Berhenti' : 'Bacakan'}</span>
        </button>

        {/* Music Player Button (Adu Rayu) */}
        <button
          onClick={handleToggleMusic}
          type="button"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium border transition shadow-sm flex items-center gap-1.5 cursor-pointer ${isMusicOn
            ? 'bg-[#e11d48] border-[#fda4af] text-white shadow-rose-500/40 ring-2 ring-rose-400/50'
            : 'bg-[#3b1223]/90 hover:bg-[#501930] text-[#fce7f3] border-[#831843]/50'
            }`}
          title="Putar atau jeda lagu tema: Adu Rayu — Yovie, Tulus, Glenn"
        >
          <Music className={`w-3.5 h-3.5 ${isMusicOn ? 'animate-bounce text-yellow-300' : ''}`} />
          <span className="hidden sm:inline">{isMusicOn ? 'Adu Rayu 🎵' : 'Putar Lagu'}</span>
        </button>

        {/* Rain Sound */}
        <button
          onClick={handleToggleRain}
          type="button"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium border transition shadow-sm flex items-center gap-1.5 cursor-pointer ${isRainOn
            ? 'bg-[#be185d] border-[#fbcfe8] text-white shadow-pink-500/30'
            : 'bg-[#3b1223]/90 hover:bg-[#501930] text-[#fce7f3] border-[#831843]/50'
            }`}
          title="Suara hujan lembut di jendela"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isRainOn ? 'Hujan Nyala' : 'Suara Hujan'}</span>
        </button>

        {/* Petal Shower */}
        <button
          onClick={handlePetalShower}
          type="button"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium bg-[#831843] hover:bg-[#9d174d] text-[#fff1f2] border border-[#f43f5e]/50 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Taburkan kelopak bunga pink"
        >
          <Flower2 className="w-3.5 h-3.5 text-[#fda4af]" />
          <span className="hidden lg:inline">Bunga Pink 🌸</span>
        </button>

        {/* Customize */}
        <button
          onClick={onOpenCustomize}
          type="button"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-medium bg-[#fce7f3] hover:bg-white text-[#831843] border border-[#f472b6] flex items-center gap-1.5 transition shadow-sm font-semibold cursor-pointer"
          title="Ubah nama penerima, pengirim, dan pesan"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sesuaikan</span>
        </button>
      </div>
    </header>
  );
};

