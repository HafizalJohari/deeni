import { useCallback } from 'react';

interface HijriDate {
  year: number;
  month: number;
  date: number;
}

const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

export const useHijriDate = () => {
  const toHijri = useCallback((gregorianDate: Date): HijriDate => {
    // Using a simplified conversion algorithm
    // For production, use a proper Hijri calendar library like moment-hijri
    const jd = gregorianToJulian(gregorianDate);
    return julianToHijri(jd);
  }, []);

  const formatHijriDate = useCallback((hijriDate: HijriDate): string => {
    return `${hijriDate.date} ${ISLAMIC_MONTHS[hijriDate.month - 1]} ${hijriDate.year}`;
  }, []);

  return {
    toHijri,
    formatHijriDate,
    ISLAMIC_MONTHS,
  };
};

// Helper functions for date conversion
function gregorianToJulian(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
    day -
    32075
  );
}

function julianToHijri(jd: number): HijriDate {
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const date = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month, date };
} 