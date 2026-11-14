export interface BookState {
  recipient: string;
  sender: string;
  bookTitle: string;
  dateBadge: string;
  finalQuestion: string;
  whatsappNumber: string;
  tiktokUsername: string;
  currentSpread: number;
  selectedMood: string;
  accepted: boolean;
}

export const defaultBookState: BookState = {
  recipient: 'Jasmine ramadhania syarif',
  sender: 'Aku yang Mengagumimu',
  bookTitle: 'Tentang Kamu, Jasmine',
  dateBadge: '11.11.2026',
  finalQuestion: 'Sebuah draf perasaan jujur untukmu.',
  whatsappNumber: '6281221995470',
  tiktokUsername: '',
  currentSpread: 0,
  selectedMood: 'Senyum-senyum sendiri',
  accepted: false,
};
