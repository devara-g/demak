'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { Copy, Check, Heart } from 'lucide-react';

interface Chapter3SpreadProps {
  state: BookState;
  onAccept: () => void;
  showToast: (msg: string) => void;
}

const shyButtonResponses = [
  'Eh, yakin gak mau klik tombol biru di sebelah? 🐾',
  'Snoopy udah rapi bawa buket bunga biru nih... 💙',
  'Jangan malu-malu, aku tunggu jawabanmu di tombol biru ya ✨',
  'Woodstock aja ikut dukung kita jalan bareng! 🐤💙',
];

export const Chapter3Spread: React.FC<Chapter3SpreadProps> = ({ state, onAccept, showToast }) => {
  const [mood, setMood] = useState(state.selectedMood);
  const [activity, setActivity] = useState('Ngopi santai & keliling toko buku 📚☕');
  const [replyText, setReplyText] = useState('Aku juga nyaman banget sama kamu, ayo jalan bareng! 💙');
  const [shyClickCount, setShyClickCount] = useState(0);
  const [shyPrompt, setShyPrompt] = useState('Snoopy menatap penuh harap... 🐶💙');
  const [copied, setCopied] = useState(false);

  const handleSayYes = () => {
    sound.playWaxSealStampSound();
    sound.playCelebrationChord();
    onAccept();

    // Trigger romantic confetti flourish
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#93c5fd', '#dbeafe', '#d4af37'],
    });

    setShyPrompt('Snoopy menari gembira! 🐶💙✨');
    showToast('Yeay! Tiket kencan resmi sudah tersimpan di buku ini 💙');
  };

  const handleShy = () => {
    sound.playPaperTurnSound();
    const msg = shyButtonResponses[shyClickCount % shyButtonResponses.length];
    setShyClickCount(shyClickCount + 1);
    setShyPrompt(msg);
    showToast(msg);
  };

  const ticketSummary = `PENUMPANG : ${state.recipient} & ${state.sender}
STATUS    : DISETUJUI & TERCATAT RESMI 💙 (${mood})
TUJUAN    : ${activity}
CATATAN   : "${replyText}"`;

  const handleCopyTicket = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticketSummary).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showToast('Tiket kencan berhasil disalin! Siap dikirimkan ke dia 💙');
      });
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden shadow-inner min-h-0">
      {/* Page 5 (Left): Snoopy Holding Forget-Me-Not Bouquet & Final Confession Question */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d5cbb8] page-scroll overflow-y-auto min-h-0">
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

          {/* The Main Question Box */}
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

      {/* Page 6 (Right): Official Reply Card & Boarding Pass */}
      <div className="paper-sheet p-4 sm:p-6 flex flex-col justify-between relative page-scroll overflow-y-auto min-h-0">
        <div>
          <div className="flex items-center justify-between text-[11px] font-typewriter text-[#547599] mb-2">
            <span>KARTU BALASAN RESMI</span>
            <span>HAL. 06</span>
          </div>

          {/* Official Stamp Seal (Hidden until Accepted) */}
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

          {/* Step 1: Select Reaction Mood */}
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
                  className={`px-2.5 py-1 rounded-full text-xs transition border ${
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

          {/* Step 2: Choose First Date Activity */}
          <div className="mb-2.5">
            <label htmlFor="dateSelect" className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1 font-bold">
              2. PILIH RENCANA JALAN BARENG PERTAMA KITA:
            </label>
            <select
              id="dateSelect"
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

          {/* Step 3: Optional Short Reply Note */}
          <div className="mb-3">
            <label htmlFor="replyInput" className="font-typewriter text-[10px] uppercase tracking-wider text-[#4a6382] block mb-1 font-bold">
              3. PESAN BALASAN SINGKAT UNTUKKU:
            </label>
            <input
              id="replyInput"
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan manismu di sini..."
              className="w-full px-2.5 py-1.5 rounded border border-[#b6cce2] bg-white text-xs text-[#1b324f] focus:outline-none focus:border-[#255489]"
            />
          </div>

          {/* Decision Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleSayYes}
              type="button"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Mau! Ayo Jalan Bareng</span>
            </button>
            <button
              onClick={handleShy}
              type="button"
              className="py-2 px-3 rounded-xl border border-[#b6cce2] bg-[#f5f8fc] hover:bg-[#e6f0fa] text-[#4a6382] text-xs transition"
            >
              Masih malu-malu 🐾
            </button>
          </div>

          {/* Boarding Pass / Date Ticket Box (Revealed when YES is clicked) */}
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
                  onClick={handleCopyTicket}
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-[11px] font-medium transition shadow-sm flex items-center gap-1"
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
    </div>
  );
};

