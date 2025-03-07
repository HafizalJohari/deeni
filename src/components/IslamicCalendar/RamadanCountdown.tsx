"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHijriDate } from '@/hooks/useHijriDate';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const RamadanCountdown = () => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { toHijri } = useHijriDate();

  useEffect(() => {
    const calculateRamadanStart = () => {
      const now = new Date();
      const hijriDate = toHijri(now);
      
      // Calculate next Ramadan start
      let ramadanYear = hijriDate.year;
      if (hijriDate.month > 9 || (hijriDate.month === 9 && hijriDate.date > 1)) {
        ramadanYear += 1;
      }
      
      // Approximate Gregorian date for next Ramadan
      // Note: This is a simplified calculation. For production, use a proper Hijri calendar library
      const approxDaysToRamadan = (9 - hijriDate.month) * 29.5 + (1 - hijriDate.date);
      const ramadanStart = new Date(now.getTime() + approxDaysToRamadan * 24 * 60 * 60 * 1000);
      
      return ramadanStart;
    };

    const calculateTimeLeft = () => {
      const ramadanStart = calculateRamadanStart();
      const now = new Date().getTime();
      const difference = ramadanStart.getTime() - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [toHijri]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ramadan Countdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{countdown.days}</span>
            <span className="text-sm text-muted-foreground">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{countdown.hours}</span>
            <span className="text-sm text-muted-foreground">Hours</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{countdown.minutes}</span>
            <span className="text-sm text-muted-foreground">Minutes</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{countdown.seconds}</span>
            <span className="text-sm text-muted-foreground">Seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 