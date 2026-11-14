'use client';

import React from 'react';
import Image from 'next/image';
import { BookState } from '@/types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CoverSpreadProps {
  state: BookState;
  onOpenBook: () => void;
}

export const CoverSpread: React.FC<CoverSpreadProps> = ({ state, onOpenBook }) => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden shadow-inner min-h-0">
      {/* Left Inside Flap: Library Checkout Card & Listening Note */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d5cbb8] page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between border-b border-[#c5d4e3] pb-2 mb-3">
            <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#3b6ea5]">
              KARTU ARSIP PERPUSTAKAAN HATI
            </span>
            <span className="font-typewriter text-[11px] text-[#5e7c9e]">
              {state.dateBadge}
            </span>
          </div>

          {/* Library Stamp Card */}
          <div className="bg-[#f4efe2] border border-[#c8bfae] rounded-lg p-3.5 shadow-sm relative">
            <div className="washi-tape w-24 h-5 -top-2.5 left-8 absolute rotate-[-2deg]" />
            <p className="font-typewriter text-[11px] text-[#4a6382] mb-2 font-semibold">
              DATA PENGIRIMAN BUKU:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-typewriter border-t border-dashed border-[#b8c4d0] pt-2">
              <div>
                <span className="text-[10px] text-[#6a829c] block font-bold">UNTUK:</span>
                <strong className="text-[#1b324f] text-sm">{state.recipient}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#6a829c] block font-bold">DARI:</span>
                <strong className="text-[#1b324f] text-sm">{state.sender}</strong>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-dashed border-[#b8c4d0] flex items-center justify-between text-[11px] font-typewriter text-[#355c87]">
              <span>STATUS: SIAP DIBUKA</span>
              <span>TEMA: SNOOPY & BIRU TEDUH</span>
            </div>
          </div>

          {/* Poetic Intro Note */}
          <div className="mt-4 space-y-2">
            <p className="font-handwriting text-2xl text-[#255489] leading-tight">
              &quot;Ada beberapa hal yang terlalu berisik kalau diucapkan lewat chat biasa...&quot;
            </p>
            <p className="text-xs sm:text-[13px] text-[#3a526e] leading-relaxed">
              Jadi kubuatkan buku kecil berwarna biru ini—ditemani Snoopy, langit berbintang, dan beberapa lembar jujur yang selama ini cuma tersimpan di kepala.
            </p>
          </div>
        </div>

        {/* Bottom Tip Box */}
        <div className="mt-3 pt-3 border-t border-[#d8d0c0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-[#4a6382]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#3b6ea5] animate-pulse" />
            <span>
              Tips: Nyalakan <strong>Kotak Musik</strong> atau klik <strong>Bacakan</strong> di atas.
            </span>
          </div>
          <span className="font-typewriter text-[10px] text-[#6c85a3]">HAL. 00</span>
        </div>
      </div>

      {/* Right Cover Face: Snoopy Doghouse Starry Night Illustration */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto min-h-0">
        <div className="w-full flex items-center justify-between text-[10px] font-typewriter text-[#547599] uppercase tracking-widest">
          <span>PEANUTS INSPIRED · BLUE SERIES</span>
          <span>NO. 01 / 01</span>
        </div>

        {/* Taped Illustration Frame */}
        <div className="relative my-2 max-w-[270px] sm:max-w-[300px] w-full bg-white p-2.5 rounded shadow-md border border-[#d6e2ef] rotate-[0.5deg]">
          <div className="washi-tape w-20 h-4 -top-2 left-1/2 -translate-x-1/2 absolute" />
          <div className="relative w-full h-36 sm:h-44 overflow-hidden rounded-sm">
            <Image
              src="/assets/snoopy_starry_night.jpg"
              alt="Snoopy di atas rumah anjing biru menatap langit malam berbintang"
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="font-handwriting text-lg text-[#2c527a] mt-1.5">
            Di bawah langit biru yang sama, pikiranku selalu pulang ke kamu.
          </p>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#172d47]">
            {state.bookTitle}
          </h2>
          <p className="text-xs text-[#4a6382] max-w-xs mx-auto">
            Sebuah pengakuan kecil dalam tiga bab singkat.
          </p>
        </div>

        <button
          onClick={onOpenBook}
          type="button"
          className="my-2 px-5 py-2.5 rounded-full bg-[#1b3d64] hover:bg-[#255285] text-white text-xs sm:text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition flex items-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Buka Lembaran Pertama</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

