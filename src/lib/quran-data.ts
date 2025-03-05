// Quran surah data from the CSV file
export interface QuranSurah {
  number: number;
  name: string;
  totalVerses: number;
}

// Parse the CSV data into a structured format
export const quranSurahs: QuranSurah[] = [
  { number: 1, name: "Al-Fatihah", totalVerses: 7 },
  { number: 2, name: "Al-Baqarah", totalVerses: 286 },
  { number: 3, name: "Ali 'Imran", totalVerses: 200 },
  { number: 4, name: "An-Nisa'", totalVerses: 176 },
  { number: 5, name: "Al-Ma'idah", totalVerses: 120 },
  { number: 6, name: "Al-An'am", totalVerses: 165 },
  { number: 7, name: "Al-A'raf", totalVerses: 206 },
  { number: 8, name: "Al-Anfal", totalVerses: 75 },
  { number: 9, name: "At-Taubah", totalVerses: 129 },
  { number: 10, name: "Yunus", totalVerses: 109 },
  { number: 11, name: "Hud", totalVerses: 123 },
  { number: 12, name: "Yusuf", totalVerses: 111 },
  { number: 13, name: "Ar-Ra'd", totalVerses: 43 },
  { number: 14, name: "Ibrahim", totalVerses: 52 },
  { number: 15, name: "Al-Hijr", totalVerses: 99 },
  { number: 16, name: "An-Nahl", totalVerses: 128 },
  { number: 17, name: "Al-Isra'", totalVerses: 111 },
  { number: 18, name: "Al-Kahfi", totalVerses: 110 },
  { number: 19, name: "Maryam", totalVerses: 98 },
  { number: 20, name: "Ta-Ha", totalVerses: 135 },
  { number: 21, name: "Al-Anbiya'", totalVerses: 112 },
  { number: 22, name: "Al-Hajj", totalVerses: 78 },
  { number: 23, name: "Al-Mu'minun", totalVerses: 118 },
  { number: 24, name: "An-Nur", totalVerses: 64 },
  { number: 25, name: "Al-Furqan", totalVerses: 77 },
  { number: 26, name: "Ash-Shu'ara'", totalVerses: 227 },
  { number: 27, name: "An-Naml", totalVerses: 93 },
  { number: 28, name: "Al-Qasas", totalVerses: 88 },
  { number: 29, name: "Al-Ankabut", totalVerses: 69 },
  { number: 30, name: "Ar-Rum", totalVerses: 60 },
  { number: 31, name: "Luqman", totalVerses: 34 },
  { number: 32, name: "As-Sajdah", totalVerses: 30 },
  { number: 33, name: "Al-Ahzab", totalVerses: 73 },
  { number: 34, name: "Saba'", totalVerses: 54 },
  { number: 35, name: "Fatir", totalVerses: 45 },
  { number: 36, name: "Ya-Sin", totalVerses: 83 },
  { number: 37, name: "As-Saffat", totalVerses: 182 },
  { number: 38, name: "Sad", totalVerses: 88 },
  { number: 39, name: "Az-Zumar", totalVerses: 75 },
  { number: 40, name: "Ghafir", totalVerses: 85 },
  { number: 41, name: "Fussilat", totalVerses: 54 },
  { number: 42, name: "Ash-Shura", totalVerses: 53 },
  { number: 43, name: "Az-Zukhruf", totalVerses: 89 },
  { number: 44, name: "Ad-Dukhan", totalVerses: 59 },
  { number: 45, name: "Al-Jathiyah", totalVerses: 37 },
  { number: 46, name: "Al-Ahqaf", totalVerses: 35 },
  { number: 47, name: "Muhammad", totalVerses: 38 },
  { number: 48, name: "Al-Fath", totalVerses: 29 },
  { number: 49, name: "Al-Hujurat", totalVerses: 18 },
  { number: 50, name: "Qaf", totalVerses: 45 },
  { number: 51, name: "Adh-Dhariyat", totalVerses: 60 },
  { number: 52, name: "At-Tur", totalVerses: 49 },
  { number: 53, name: "An-Najm", totalVerses: 62 },
  { number: 54, name: "Al-Qamar", totalVerses: 55 },
  { number: 55, name: "Ar-Rahman", totalVerses: 78 },
  { number: 56, name: "Al-Waqi'ah", totalVerses: 96 },
  { number: 57, name: "Al-Hadid", totalVerses: 29 },
  { number: 58, name: "Al-Mujadilah", totalVerses: 22 },
  { number: 59, name: "Al-Hashr", totalVerses: 24 },
  { number: 60, name: "Al-Mumtahanah", totalVerses: 13 },
  { number: 61, name: "As-Saff", totalVerses: 14 },
  { number: 62, name: "Al-Jumu'ah", totalVerses: 11 },
  { number: 63, name: "Al-Munafiqun", totalVerses: 11 },
  { number: 64, name: "At-Taghabun", totalVerses: 18 },
  { number: 65, name: "At-Talaq", totalVerses: 12 },
  { number: 66, name: "At-Tahrim", totalVerses: 12 },
  { number: 67, name: "Al-Mulk", totalVerses: 30 },
  { number: 68, name: "Al-Qalam", totalVerses: 52 },
  { number: 69, name: "Al-Haqqah", totalVerses: 52 },
  { number: 70, name: "Al-Ma'arij", totalVerses: 44 },
  { number: 71, name: "Nuh", totalVerses: 28 },
  { number: 72, name: "Al-Jinn", totalVerses: 28 },
  { number: 73, name: "Al-Muzzammil", totalVerses: 20 },
  { number: 74, name: "Al-Muddaththir", totalVerses: 56 },
  { number: 75, name: "Al-Qiyamah", totalVerses: 40 },
  { number: 76, name: "Al-Insan", totalVerses: 31 },
  { number: 77, name: "Al-Mursalat", totalVerses: 50 },
  { number: 78, name: "An-Naba'", totalVerses: 40 },
  { number: 79, name: "An-Nazi'at", totalVerses: 46 },
  { number: 80, name: "Abasa", totalVerses: 42 },
  { number: 81, name: "At-Takwir", totalVerses: 29 },
  { number: 82, name: "Al-Infitar", totalVerses: 19 },
  { number: 83, name: "Al-Mutaffifin", totalVerses: 36 },
  { number: 84, name: "Al-Inshiqaq", totalVerses: 25 },
  { number: 85, name: "Al-Buruj", totalVerses: 22 },
  { number: 86, name: "At-Tariq", totalVerses: 17 },
  { number: 87, name: "Al-A'la", totalVerses: 19 },
  { number: 88, name: "Al-Ghashiyah", totalVerses: 26 },
  { number: 89, name: "Al-Fajr", totalVerses: 30 },
  { number: 90, name: "Al-Balad", totalVerses: 20 },
  { number: 91, name: "Ash-Shams", totalVerses: 15 },
  { number: 92, name: "Al-Lail", totalVerses: 21 },
  { number: 93, name: "Ad-Duha", totalVerses: 11 },
  { number: 94, name: "Ash-Sharh", totalVerses: 8 },
  { number: 95, name: "At-Tin", totalVerses: 8 },
  { number: 96, name: "Al-Alaq", totalVerses: 19 },
  { number: 97, name: "Al-Qadr", totalVerses: 5 },
  { number: 98, name: "Al-Bayyinah", totalVerses: 8 },
  { number: 99, name: "Az-Zalzalah", totalVerses: 8 },
  { number: 100, name: "Al-Adiyat", totalVerses: 11 },
  { number: 101, name: "Al-Qari'ah", totalVerses: 11 },
  { number: 102, name: "At-Takathur", totalVerses: 8 },
  { number: 103, name: "Al-Asr", totalVerses: 3 },
  { number: 104, name: "Al-Humazah", totalVerses: 9 },
  { number: 105, name: "Al-Fil", totalVerses: 5 },
  { number: 106, name: "Quraysh", totalVerses: 4 },
  { number: 107, name: "Al-Ma'un", totalVerses: 7 },
  { number: 108, name: "Al-Kawthar", totalVerses: 3 },
  { number: 109, name: "Al-Kafirun", totalVerses: 6 },
  { number: 110, name: "An-Nasr", totalVerses: 3 },
  { number: 111, name: "Al-Masad", totalVerses: 5 },
  { number: 112, name: "Al-Ikhlas", totalVerses: 4 },
  { number: 113, name: "Al-Falaq", totalVerses: 5 },
  { number: 114, name: "An-Nas", totalVerses: 6 }
];

// Helper function to get a surah by number
export const getSurahByNumber = (number: number): QuranSurah | undefined => {
  return quranSurahs.find(surah => surah.number === number);
};

// Helper function to get the maximum number of verses for a given surah
export const getMaxVersesForSurah = (surahNumber: number): number => {
  const surah = getSurahByNumber(surahNumber);
  return surah ? surah.totalVerses : 0;
};

// Helper function to get a random verse number from a surah
export const getRandomVerseFromSurah = (surahNumber: number): number => {
  const maxVerses = getMaxVersesForSurah(surahNumber);
  if (maxVerses === 0) return 0;
  
  // Generate a random verse number between 1 and maxVerses
  return Math.floor(Math.random() * maxVerses) + 1;
};

// Helper function to get a random surah
export const getRandomSurah = (): QuranSurah => {
  const randomIndex = Math.floor(Math.random() * quranSurahs.length);
  return quranSurahs[randomIndex];
};

// Popular and meaningful verses that are often recommended for reflection
export const recommendedVerses = [
  { surah: 2, verse: 255, name: "Ayatul Kursi" }, // Al-Baqarah, 255 (Ayatul Kursi)
  { surah: 36, verse: 1, name: "Surah Ya-Sin (beginning)" }, // Ya-Sin
  { surah: 55, verse: 1, name: "Surah Ar-Rahman (beginning)" }, // Ar-Rahman
  { surah: 112, verse: 1, name: "Surah Al-Ikhlas" }, // Al-Ikhlas
  { surah: 1, verse: 1, name: "Surah Al-Fatihah (beginning)" }, // Al-Fatihah
  { surah: 2, verse: 286, name: "Last verse of Al-Baqarah" }, // Last verse of Al-Baqarah
  { surah: 18, verse: 1, name: "Surah Al-Kahf (beginning)" }, // Al-Kahf
  { surah: 67, verse: 1, name: "Surah Al-Mulk (beginning)" }, // Al-Mulk
]; 