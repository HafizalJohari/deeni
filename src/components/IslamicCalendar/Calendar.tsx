"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useHijriDate } from '@/hooks/useHijriDate';

interface IslamicCalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export const IslamicCalendar = ({ className, onDateSelect }: IslamicCalendarProps) => {
  const [date, setDate] = useState<Date>();
  const { toHijri, formatHijriDate } = useHijriDate();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              <span>
                {format(date, "PPP")} ({formatHijriDate(toHijri(date))})
              </span>
            ) : (
              <span>Select date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            footer={
              date && (
                <div className="px-4 py-2 border-t text-sm text-center">
                  Hijri: {formatHijriDate(toHijri(date))}
                </div>
              )
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}; 