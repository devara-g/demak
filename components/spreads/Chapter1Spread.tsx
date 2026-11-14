'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';

interface Chapter1SpreadProps {
  state: BookState;
}

const stampMemories = [
  'Aku selalu suka gimana mata kamu langsung berbinar tiap nyeritain hal-hal kecil yang kamu suka. Rasanya aku bisa dengerin kamu seharian tanpa bosan.',
  'Tawa kecilmu itu menular banget. Sekalipun hariku lagi berantakan, dengar kamu ketawa sebentar aja langsung bikin semuanya terasa ringan.',
  'Bersama kamu, hening pun gak pernah terasa canggung. Rasanya tenang, aman, dan gak perlu pura-pura jadi orang lain.',
];

export const Chapter1Spread: React.FC<Chapter1SpreadProps> = ({ state }) => {
  const [activeStamp, setActiveStamp] = useState(0);

  const handleStampClick = (idx: number) => {
    sound.playPaperTurnSound();
    setActiveStamp(idx);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden shadow-inner min-h-0">
      {/* Page 1 (Left): Rain & Blue Umbrella Illustration + Interactive Postage Stamps */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d5cbb8] page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-2">
            <span>BAB I · TEDUH SEPERTI BIRU</span>
            <span>HAL. 01</span>
          </div>

          {/* Scrapbook Photo Frame */}
          <div className="relative bg-white p-2.5 rounded shadow-sm border border-[#d6e2ef] max-w-[285px] mx-auto">
            <div className="washi-tape w-16 h-4 -top-2 left-6 absolute -rotate-3" />
            <div className="washi-tape w-16 h-4 -top-2 right-6 absolute rotate-3" />
            <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-sm">
              <Image
                src="/assets/snoopy_blue_umbrella.jpg"
                alt="Snoopy dan burung kuning berjalan di bawah payung biru"
                fill
                className="object-cover"
              />
            </div>
            <p className="font-handwriting text-center text-sm sm:text-base text-[#385e87] mt-1.5">
              &quot;Payung biru ini cukup buat kita berdua berteduh...&quot;
            </p>
          </div>

          {/* Interactive Postage Stamp Collection */}
          <div className="mt-3.5">
            <span className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1.5 font-bold">
              KETUK PERANGKO KENANGAN KECIL INI:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { title: 'POS 01', label: 'Mata Berbinar' },
                { title: 'POS 02', label: 'Tawa Menular' },
                { title: 'POS 03', label: 'Hening Tenang' },
              ].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStampClick(idx)}
                  className={`stamp-btn postage-stamp p-2 text-left transition ${
                    activeStamp === idx ? 'active-stamp' : ''
                  }`}
                >
                  <span className="text-[10px] font-typewriter text-[#3b6ea5] block font-bold">
                    {s.title}
                  </span>
                  <strong className="text-[11px] block text-[#1b324f] leading-tight mt-0.5">
                    {s.label}
                  </strong>
                </button>
              ))}
            </div>

            {/* Stamp Narrative Detail Box */}
            <div className="mt-2.5 p-2.5 rounded bg-[#edf5fc] border border-[#bcd6ee] text-xs text-[#2c4d72] leading-relaxed italic font-serif">
              {stampMemories[activeStamp]}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#d8d0c0] flex items-center justify-between text-[10px] font-typewriter text-[#6c85a3]">
          <span>KERTAS ARSIP NO. 14</span>
          <span>CATATAN BIRU</span>
        </div>
      </div>

      {/* Page 2 (Right): Heartfelt Letter Part 1 */}
      <div className="paper-sheet paper-ruled p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-3">
            <span>SURAT BAGIAN PERTAMA</span>
            <span>HAL. 02</span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#172d47] mb-2">
            Awalnya Cuma Kagum Biasa, Tapi Kok Makin Dalam?
          </h3>

          <div className="space-y-3 text-xs sm:text-[13.5px] text-[#243b56] leading-relaxed">
            <p>
              Hai <strong className="text-[#1e40af]">{state.recipient}</strong>, kalau dipikir-pikir lucu juga ya. Awalnya aku kira perasaanku ke kamu cuma sekadar senang ngobrol atau kagum sama pembawaanmu yang hangat.
            </p>
            <p>
              Tapi lama-lama, setiap kali ada hal menarik di tengah hari, orang pertama yang ingin kuberi tahu selalu kamu. Setiap kali hari terasa panjang dan melelahkan, satu pesan singkat darimu rasanya seperti payung biru di tengah hujan—bikin semuanya terasa teduh lagi.
            </p>
            <p className="font-handwriting text-xl text-[#204975] pt-1">
              Kamu punya cara tersendiri buat bikin dunia yang berisik ini jadi jauh lebih tenang.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#d8d0c0] flex items-center justify-between text-xs">
          <span className="font-typewriter text-[10px] text-[#547599]">KETUK HALAMAN BERIKUTNYA ➔</span>
          <span className="font-handwriting text-base text-[#3b6ea5]">— Dengan tulus, {state.sender}</span>
        </div>
      </div>
    </div>
  );
};

