// Collection of Islamic guidance from Quran and Hadith for app tooltips

interface IslamicGuidance {
  title: string;
  content: string;
  source: string;
}

// Guidance for different sections of the app
export const habitGuidance: IslamicGuidance[] = [
  {
    title: "Consistency in Good Deeds",
    content: "The most beloved of deeds to Allah are those that are done consistently, even if they are small.",
    source: "Hadith: Sahih Bukhari"
  },
  {
    title: "Gradual Improvement",
    content: "Indeed, Allah will not change the condition of a people until they change what is in themselves.",
    source: "Quran: Surah Ar-Ra'd 13:11"
  },
  {
    title: "Setting Intentions",
    content: "Actions are judged by intentions, so each person will have what they intended.",
    source: "Hadith: Sahih Bukhari and Muslim"
  },
  {
    title: "Persistence",
    content: "And whoever is patient and forgives - indeed, that is of the matters [requiring] determination.",
    source: "Quran: Surah Ash-Shuraa 42:43"
  }
];

export const quranGuidance: IslamicGuidance[] = [
  {
    title: "Healing and Mercy",
    content: "And We send down of the Quran that which is healing and mercy for the believers.",
    source: "Quran: Surah Al-Isra 17:82"
  },
  {
    title: "Reflection",
    content: "Then do they not reflect upon the Quran, or are there locks upon [their] hearts?",
    source: "Quran: Surah Muhammad 47:24"
  },
  {
    title: "Daily Recitation",
    content: "The one who is proficient in the recitation of the Quran will be with the honorable and obedient scribes (angels).",
    source: "Hadith: Sahih Bukhari and Muslim"
  },
  {
    title: "Understanding",
    content: "[This is] a blessed Book which We have revealed to you, [O Muhammad], that they might reflect upon its verses.",
    source: "Quran: Surah Sad 38:29"
  }
];

export const hadithGuidance: IslamicGuidance[] = [
  {
    title: "Seeking Knowledge",
    content: "Whoever takes a path to seek knowledge, Allah makes the path to Paradise easy for him.",
    source: "Hadith: Sahih Muslim"
  },
  {
    title: "Acting Upon Knowledge",
    content: "Knowledge is of no benefit if it's not accompanied by action.",
    source: "Hadith: Abu Nu'aym"
  },
  {
    title: "Verifying Information",
    content: "O you who have believed, if there comes to you a disobedient one with information, investigate.",
    source: "Quran: Surah Al-Hujurat 49:6"
  },
  {
    title: "Teaching Others",
    content: "The best of you are those who learn the Quran and teach it to others.",
    source: "Hadith: Sahih Bukhari"
  }
];

export const dairyGuidance: IslamicGuidance[] = [
  {
    title: "Self-Reflection",
    content: "Take account of yourselves before you are taken to account.",
    source: "Hadith: Tirmidhi"
  },
  {
    title: "Recording Good Deeds",
    content: "Whoever does an atom's weight of good will see it, and whoever does an atom's weight of evil will see it.",
    source: "Quran: Surah Az-Zalzalah 99:7-8"
  },
  {
    title: "Gratitude",
    content: "If you are grateful, I will surely increase you [in favor].",
    source: "Quran: Surah Ibrahim 14:7"
  }
];

export const prayerGuidance: IslamicGuidance[] = [
  {
    title: "Importance of Prayer",
    content: "Indeed, prayer prohibits immorality and wrongdoing.",
    source: "Quran: Surah Al-Ankabut 29:45"
  },
  {
    title: "Seeking Help Through Prayer",
    content: "O you who have believed, seek help through patience and prayer.",
    source: "Quran: Surah Al-Baqarah 2:153"
  },
  {
    title: "Punctuality",
    content: "The most beloved deed to Allah is to establish prayer at its stated time.",
    source: "Hadith: Sahih Bukhari"
  }
];

export const generalGuidance: IslamicGuidance[] = [
  {
    title: "Spiritual Growth",
    content: "Truly he succeeds who purifies it [his soul], and he fails who corrupts it.",
    source: "Quran: Surah Ash-Shams 91:9-10"
  },
  {
    title: "Community Support",
    content: "The believers in their mutual kindness, compassion and sympathy are just like one body.",
    source: "Hadith: Sahih Bukhari and Muslim"
  },
  {
    title: "Continuous Learning",
    content: "Seek knowledge from the cradle to the grave.",
    source: "Hadith"
  },
  {
    title: "Mindfulness",
    content: "Remember Me, I will remember you.",
    source: "Quran: Surah Al-Baqarah 2:152"
  }
];

// Function to get random guidance from a category
export const getRandomGuidance = (category: IslamicGuidance[]): IslamicGuidance => {
  const randomIndex = Math.floor(Math.random() * category.length);
  return category[randomIndex];
};

export default {
  habitGuidance,
  quranGuidance,
  hadithGuidance,
  dairyGuidance,
  prayerGuidance,
  generalGuidance,
  getRandomGuidance
}; 