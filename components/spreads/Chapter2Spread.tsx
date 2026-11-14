'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import { Keyboard } from 'lucide-react';

interface Chapter2SpreadProps {
  state: BookState;
}

const typewriterLines = [
  '"Sebenarnya tiap kali notifikasi chat darimu masuk, jantungku selalu salah tingkah sendiri..."',
  '"Kadang aku sengaja balas chat agak cepat, karena emang sesenang itu ngobrol sama kamu."',
  '"Waktu lihat Snoopy natap langit berbintang, yang kepikiran di kepalaku justru senyummu."',
  '"Kalau ada seribu draf surat di meja ini, semuanya tetap bermuara ke satu nama: kamu."',
];

export const Chapter2Spread: React.FC<Chapter2SpreadProps> = ({ state }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState(typewriterLines[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [wishlistChecked, setWishlistChecked] = useState([true, true, true]);

  const handleNextLine = () => {
    if (isTyping) return;
    setIsTyping(true);
    const nextIdx = (lineIndex + 1) % typewriterLines.length;
    setLineIndex(nextIdx);
    const target = typewriterLines[nextIdx];
    setTypedText('');

    let cur = 0;
    const interval = setInterval(() => {
      if (cur < target.length) {
        setTypedText(target.slice(0, cur + 1));
        sound.playTypewriterKeySound();
        cur++;
      } else {
        clearInterval(interval);
        sound.playTypewriterBellSound();
        setIsTyping(false);
      }
    }, 38);
  };

  const handleToggleWishlist = (idx: number) => {
    sound.playTypewriterKeySound();
    const updated = [...wishlistChecked];
    updated[idx] = !updated[idx];
    setWishlistChecked(updated);
  };

  const countChecked = wishlistChecked.filter(Boolean).length;

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden shadow-inner min-h-0">
      {/* Page 3 (Left): Snoopy Typewriter Illustration + Animated Typewriter */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d5cbb8] page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-2">
            <span>BAB II · DRAF KE-108</span>
            <span>HAL. 03</span>
          </div>

          <div className="relative bg-white p-2.5 rounded shadow-sm border border-[#d6e2ef] max-w-[285px] mx-auto">
            <div className="washi-tape w-20 h-4 -top-2 left-1/2 -translate-x-1/2 absolute" />
            <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-sm">
              <Image
                src="/assets/snoopy_typewriter.jpg"
                alt="Snoopy mengetik surat cinta di mesin ketik biru"
                fill
                className="object-cover"
              />
            </div>
            <p className="font-handwriting text-center text-sm sm:text-base text-[#385e87] mt-1.5">
              &quot;Mengetik ribuan kalimat, menghapus ratusan keraguan...&quot;
            </p>
          </div>

          {/* Interactive Typewriter Paper Output */}
          <div className="mt-3 bg-[#f5f1e8] border border-[#c7bfae] rounded p-3 relative shadow-inner">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-dashed border-[#b8af9c] text-[10px] font-typewriter text-[#5e7794]">
              <span>PITA MESIN KETIK BIRU</span>
              <span>DRAF #{108 + lineIndex}</span>
            </div>
            <p className="font-typewriter text-xs sm:text-[12.5px] text-[#1b324f] leading-relaxed min-h-[46px]">
              {typedText}
              <span className="typewriter-cursor" />
            </p>
            <div className="mt-2 pt-2 border-t border-dashed border-[#b8af9c] flex items-center justify-between">
              <button
                onClick={handleNextLine}
                disabled={isTyping}
                type="button"
                className="px-2.5 py-1 rounded bg-[#2b5585] hover:bg-[#386a9f] disabled:opacity-50 text-white text-[11px] font-typewriter transition flex items-center gap-1.5 shadow-sm"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Ketik Draf Berikutnya</span>
              </button>
              <span className="text-[10px] font-typewriter text-[#6984a3]">Tekan untuk baris baru</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#d8d0c0] flex items-center justify-between text-[10px] font-typewriter text-[#6c85a3]">
          <span>ROYAL BLUE TYPEWRITER</span>
          <span>108 DRAF SURAT</span>
        </div>
      </div>

      {/* Page 4 (Right): Heartfelt Letter Part 2 + Interactive Wishlist */}
      <div className="paper-sheet paper-ruled p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-3">
            <span>SURAT BAGIAN KEDUA</span>
            <span>HAL. 04</span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#172d47] mb-2">
            Kenapa Akhirnya Aku Berani Bilang Sekarang?
          </h3>

          <div className="space-y-2.5 text-xs sm:text-[13.5px] text-[#243b56] leading-relaxed">
            <p>
              Jujur, aku sempat ragu waktu mau bikin halaman ini. Ada rasa takut kalau pengakuanku bikin suasana jadi canggung, tapi aku jauh lebih takut kalau kamu gak pernah tahu betapa berharganya kamu di mataku.
            </p>
            <p>
              Aku gak janjiin hal-hal klise yang muluk-muluk. Aku cuma ingin jadi orang yang selalu siap dengerin ceritamu, nemenin kamu cari makanan enak waktu lagi suntuk, dan jadi tempat paling aman buat kamu pulang.
            </p>
          </div>

          {/* Interactive Wishlist Checklist */}
          <div className="mt-3 p-3 bg-[#f3ecdc] rounded-lg border border-[#c4baa7] shadow-sm">
            <span className="font-typewriter text-[10px] uppercase tracking-wider text-[#3c5d82] block mb-1.5 font-bold">
              WISHLIST KECIL BARENG KAMU:
            </span>
            <div className="space-y-1.5 text-xs">
              {[
                'Keliling cari es krim sore-sore sambil cerita apa aja 🍦',
                'Nge-teh atau ngopi santai di tempat yang tenang ☕',
                'Jadi orang pertama yang kamu hubungi waktu harimu melelahkan 💙',
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer text-[#1e3a5f]">
                  <input
                    type="checkbox"
                    checked={wishlistChecked[idx]}
                    onChange={() => handleToggleWishlist(idx)}
                    className="accent-[#255489] rounded cursor-pointer"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#d8d0c0] flex items-center justify-between text-xs">
          <span className="font-typewriter text-[10px] text-[#255489] font-bold">
            {countChecked} / 3 harapan dipilih 💙
          </span>
          <span className="font-handwriting text-base text-[#3b6ea5]">Satu halaman lagi... ➔</span>
        </div>
      </div>
    </div>
  );
};

