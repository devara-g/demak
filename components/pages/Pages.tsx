'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Keyboard, Copy, Check, Heart } from 'lucide-react';

/* =========================================================================
   SPREAD 0: COVER SPREAD
   ========================================================================= */

export const CoverLeft: React.FC<{ state: BookState }> = ({ state }) => (
  <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between border-r border-[#d5cbb8] page-scroll overflow-y-auto">
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
        <span>Tips: Nyalakan <strong>Kotak Musik</strong> atau klik <strong>Bacakan</strong> di atas.</span>
      </div>
      <span className="font-typewriter text-[10px] text-[#6c85a3]">HAL. 00</span>
    </div>
  </div>
);

export const CoverRight: React.FC<{ state: BookState; onOpenBook: () => void }> = ({ state, onOpenBook }) => (
  <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto">
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
      className="my-2 px-5 py-2.5 rounded-full bg-[#1b3d64] hover:bg-[#255285] text-white text-xs sm:text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition flex items-center gap-2 group cursor-pointer"
    >
      <Sparkles className="w-4 h-4 text-yellow-300" />
      <span>Buka Lembaran Pertama</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

/* =========================================================================
   SPREAD 1: BAB I (TEDUH SEPERTI BIRU)
   ========================================================================= */

const stampMemories = [
  'Aku selalu suka gimana mata kamu langsung berbinar tiap nyeritain hal-hal kecil yang kamu suka. Rasanya aku bisa dengerin kamu seharian tanpa bosan.',
  'Tawa kecilmu itu menular banget. Sekalipun hariku lagi berantakan, dengar kamu ketawa sebentar aja langsung bikin semuanya terasa ringan.',
  'Bersama kamu, hening pun gak pernah terasa canggung. Rasanya tenang, aman, dan gak perlu pura-pura jadi orang lain.',
];

export const Chapter1Left: React.FC<{ state: BookState }> = () => {
  const [activeStamp, setActiveStamp] = useState(0);

  const handleStamp = (idx: number) => {
    sound.playPaperTurnSound();
    setActiveStamp(idx);
  };

  return (
    <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between border-r border-[#d5cbb8] page-scroll overflow-y-auto">
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

        {/* Interactive Stamps */}
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
                onClick={() => handleStamp(idx)}
                className={`stamp-btn postage-stamp p-2 text-left transition cursor-pointer ${
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
  );
};

export const Chapter1Right: React.FC<{ state: BookState }> = ({ state }) => (
  <div className="paper-sheet paper-ruled h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto">
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
);

/* =========================================================================
   SPREAD 2: BAB II (DRAF KE-108)
   ========================================================================= */

const typewriterLines = [
  '"Sebenarnya setiap kali kita berpapasan, jantungku masih suka salah tingkah sendiri..."',
  '"Kadang aku sengaja balas chat agak cepat, karena emang sesenang itu ngobrol sama kamu."',
  '"Waktu lihat Snoopy natap langit berbintang, yang kepikiran di kepalaku justru senyummu."',
  '"Kalau ada seribu draf surat di meja ini, semuanya tetap bermuara ke satu nama: kamu."',
];

export const Chapter2Left: React.FC<{ state: BookState }> = () => {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState(typewriterLines[0]);
  const [isTyping, setIsTyping] = useState(false);

  const handleNextLine = () => {
    if (isTyping) return;
    setIsTyping(true);
    const next = (lineIdx + 1) % typewriterLines.length;
    setLineIdx(next);
    const target = typewriterLines[next];
    setTyped('');

    let c = 0;
    const interval = setInterval(() => {
      if (c < target.length) {
        setTyped(target.slice(0, c + 1));
        sound.playTypewriterKeySound();
        c++;
      } else {
        clearInterval(interval);
        sound.playTypewriterBellSound();
        setIsTyping(false);
      }
    }, 38);
  };

  return (
    <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between border-r border-[#d5cbb8] page-scroll overflow-y-auto">
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

        {/* Typewriter Output */}
        <div className="mt-3 bg-[#f5f1e8] border border-[#c7bfae] rounded p-3 relative shadow-inner">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-dashed border-[#b8af9c] text-[10px] font-typewriter text-[#5e7794]">
            <span>PITA MESIN KETIK BIRU</span>
            <span>DRAF #{108 + lineIdx}</span>
          </div>
          <p className="font-typewriter text-xs sm:text-[12.5px] text-[#1b324f] leading-relaxed min-h-[46px]">
            {typed}
            <span className="typewriter-cursor" />
          </p>
          <div className="mt-2 pt-2 border-t border-dashed border-[#b8af9c] flex items-center justify-between">
            <button
              onClick={handleNextLine}
              disabled={isTyping}
              type="button"
              className="px-2.5 py-1 rounded bg-[#2b5585] hover:bg-[#386a9f] disabled:opacity-50 text-white text-[11px] font-typewriter transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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
  );
};

export const Chapter2Right: React.FC<{ state: BookState }> = () => {
  const [checked, setChecked] = useState([true, true, true]);

  const toggleCheck = (idx: number) => {
    sound.playPencilSound();
    const updated = [...checked];
    updated[idx] = !updated[idx];
    setChecked(updated);
  };

  const count = checked.filter(Boolean).length;

  return (
    <div className="paper-sheet paper-ruled h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto">
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

        {/* Wishlist Box */}
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
                  checked={checked[idx]}
                  onChange={() => toggleCheck(idx)}
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
          {count} / 3 harapan dipilih 💙
        </span>
        <span className="font-handwriting text-base text-[#3b6ea5]">Satu halaman lagi... ➔</span>
      </div>
    </div>
  );
};

/* =========================================================================
   SPREAD 3: BAB III (CONFESSION & TIKET KENCAN)
   ========================================================================= */

export const Chapter3Left: React.FC<{ state: BookState }> = ({ state }) => (
  <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between border-r border-[#d5cbb8] page-scroll overflow-y-auto">
    <div>
      <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-2">
        <span>BAB III · SATU PERTANYAAN JUJUR</span>
        <span>HAL. 05</span>
      </div>

      <div className="relative bg-white p-2.5 rounded shadow-sm border border-[#d6e2ef] max-w-[275px] mx-auto">
        <div className="washi-tape w-20 h-4 -top-2 left-1/2 -translate-x-1/2 absolute" />
        <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-sm">
          <Image
            src="/assets/snoopy_flower_bouquet.jpg"
            alt="Snoopy memegang buket bunga biru forget-me-not dan amplop surat cinta"
            fill
            className="object-cover"
          />
        </div>
        <p className="font-handwriting text-center text-sm sm:text-base text-[#385e87] mt-1.5">
          &quot;Bunga biru forget-me-not ini buat kamu...&quot;
        </p>
      </div>

      {/* Main Question */}
      <div className="mt-3.5 space-y-2">
        <h4 className="font-serif text-lg sm:text-xl font-bold text-[#142840] leading-snug">
          Jadi, <span className="text-[#1d4ed8]">{state.recipient}</span>...
        </h4>
        <p className="font-handwriting text-xl sm:text-2xl text-[#1e40af] leading-tight">
          {state.finalQuestion}
        </p>
      </div>
    </div>

    <div className="pt-2 border-t border-[#d8d0c0] flex items-center justify-between text-[10px] font-typewriter text-[#6c85a3]">
      <span>FORGET-ME-NOT BLUE</span>
      <span>JAWAB DI HALAMAN SEBELAH ➔</span>
    </div>
  </div>
);

export const Chapter3Right: React.FC<{
  state: BookState;
  onAccept: () => void;
  showToast: (msg: string) => void;
}> = ({ state, onAccept, showToast }) => {
  const [mood, setMood] = useState(state.selectedMood);
  const [activity, setActivity] = useState('Ngopi santai & keliling toko buku 📚☕');
  const [reply, setReply] = useState('Aku juga nyaman banget sama kamu, ayo jalan bareng! 💙');
  const [shyIdx, setShyIdx] = useState(0);
  const [shyPrompt, setShyPrompt] = useState('Snoopy menatap penuh harap... 🐶💙');
  const [copied, setCopied] = useState(false);

  const shyResponses = [
    'Eh, yakin gak mau klik tombol biru di sebelah? 🐾',
    'Snoopy udah rapi bawa buket bunga biru nih... 💙',
    'Jangan malu-malu, aku tunggu jawabanmu di tombol biru ya ✨',
    'Woodstock aja ikut dukung kita jalan bareng! 🐤💙',
  ];

  const handleSayYes = () => {
    sound.playWaxSealStampSound();
    sound.playCelebrationChord();
    onAccept();

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#93c5fd', '#dbeafe', '#d4af37'],
    });

    setShyPrompt('Snoopy menari gembira! 🐶💙✨');
    showToast('Yeay! Tiket kencan resmi sudah tersimpan di buku ini 💙');
  };

  const handleShy = () => {
    sound.playPaperTurnSound();
    const msg = shyResponses[shyIdx % shyResponses.length];
    setShyIdx(shyIdx + 1);
    setShyPrompt(msg);
    showToast(msg);
  };

  const ticketSummary = `PENUMPANG : ${state.recipient} & ${state.sender}
STATUS    : DISETUJUI & TERCATAT RESMI 💙 (${mood})
TUJUAN    : ${activity}
CATATAN   : "${reply}"`;

  const copyTicket = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticketSummary).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showToast('Tiket kencan berhasil disalin! Siap dikirimkan ke dia 💙');
      });
    }
  };

  return (
    <div className="paper-sheet h-full p-4 sm:p-6 flex flex-col justify-between relative page-scroll overflow-y-auto">
      <div>
        <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-2">
          <span>KARTU BALASAN RESMI</span>
          <span>HAL. 06</span>
        </div>

        {/* Official Stamp Seal */}
        {state.accepted && (
          <div className="mb-2.5 p-2 rounded-lg border-2 border-[#1d4ed8] bg-[#dbeafe]/95 text-center shadow-md animate-fade-in">
            <div className="flex items-center justify-center gap-2.5">
              <div className="wax-seal">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="font-typewriter text-xs font-bold text-[#1e3a8a] tracking-widest uppercase">
                  RESMI DITERIMA · BAB BARU DIMULAI
                </p>
                <p className="text-[11px] font-handwriting text-[#255489]">
                  &quot;Langit biru kita baru saja dimulai!&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Mood */}
        <div className="mb-2.5">
          <label className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1 font-bold">
            1. PERASAANMU WAKTU BACA BUKU INI:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Senyum-senyum sendiri 😊',
              'Ikut deg-degan 💙',
              'Terharu banget ✨',
            ].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  sound.playPaperTurnSound();
                  setMood(m);
                }}
                className={`px-2.5 py-1 rounded-full text-xs transition border cursor-pointer ${
                  mood === m
                    ? 'border-[#3b6ea5] bg-[#dbeafe] text-[#1b324f] font-semibold'
                    : 'border-[#b6cce2] bg-white text-[#3a526e] hover:bg-[#edf5fc]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Date Activity */}
        <div className="mb-2.5">
          <label htmlFor="dateAct" className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1 font-bold">
            2. PILIH RENCANA JALAN BARENG PERTAMA KITA:
          </label>
          <select
            id="dateAct"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#b6cce2] bg-white text-xs text-[#1b324f] focus:outline-none focus:border-[#255489]"
          >
            <option value="Ngopi santai & keliling toko buku 📚☕">Ngopi santai & keliling toko buku 📚☕</option>
            <option value="Jalan sore beli es krim & ngobrol panjang 🍦🌇">Jalan sore beli es krim & ngobrol panjang 🍦🌇</option>
            <option value="Nonton film & makan malam favoritmu 🎟️🍜">Nonton film & makan malam favoritmu 🎟️🍜</option>
            <option value="Piknik santai di bawah langit biru 🧺🌤️">Piknik santai di bawah langit biru 🧺🌤️</option>
          </select>
        </div>

        {/* Step 3: Reply Message */}
        <div className="mb-3">
          <label htmlFor="replyText" className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1 font-bold">
            3. PESAN BALASAN SINGKAT UNTUKKU:
          </label>
          <input
            id="replyText"
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis balasan manismu di sini..."
            className="w-full px-2.5 py-1.5 rounded border border-[#b6cce2] bg-white text-xs text-[#1b324f] focus:outline-none focus:border-[#255489]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleSayYes}
            type="button"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Mau! Ayo Jalan Bareng</span>
          </button>
          <button
            onClick={handleShy}
            type="button"
            className="py-2 px-3 rounded-xl border border-[#b6cce2] bg-[#f5f8fc] hover:bg-[#e6f0fa] text-[#4a6382] text-xs transition cursor-pointer"
          >
            Masih malu-malu 🐾
          </button>
        </div>

        {/* Boarding Pass Date Ticket */}
        {state.accepted && (
          <div className="mt-3 p-3 boarding-pass-card space-y-2">
            <div className="flex items-center justify-between border-b border-dashed border-[#7eb3e8] pb-1.5">
              <div>
                <span className="font-typewriter text-[9px] uppercase tracking-widest text-[#3b6ea5] block font-bold">
                  PEANUTS LOVEWAYS · TIKET RESMI
                </span>
                <strong className="font-serif text-xs text-[#142840]">
                  TIKET KENCAN BIRU
                </strong>
              </div>
              <button
                onClick={copyTicket}
                type="button"
                className="px-2.5 py-1 rounded-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-[11px] font-medium transition shadow-sm flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tiket'}</span>
              </button>
            </div>

            <p className="text-xs text-[#1b324f] font-typewriter leading-snug whitespace-pre-line">
              {ticketSummary}
            </p>

            <div className="pt-1.5 border-t border-dashed border-[#b8cfe8] flex items-center justify-between text-[10px] font-typewriter text-[#547599]">
              <span>SEAT: 01A (DI SAMPINGMU)</span>
              <span>GATE: TERBUKA UNTUK KITA 💙</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#e2dacb] flex items-center justify-between text-[10px] font-typewriter text-[#547599]">
        <span>{shyPrompt}</span>
        <span>AKHIR BUKU · 06</span>
      </div>
    </div>
  );
};

