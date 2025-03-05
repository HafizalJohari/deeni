"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Container } from "@/components/ui/container";
import { format } from "date-fns";

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [multiDates, setMultiDates] = useState<Date[]>([]);
  const [rangeDates, setRangeDates] = useState<Date[]>([]);

  const handleDateSelect = (date: Date) => {
    setDate(date);
  };

  const handleMultiDateSelect = (date: Date) => {
    // Check if date already exists in the array
    const exists = multiDates.some(
      (d) => 
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );

    if (exists) {
      setMultiDates(multiDates.filter(
        (d) => 
          !(d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear())
      ));
    } else {
      setMultiDates([...multiDates, date]);
    }
  };

  const handleRangeDateSelect = (date: Date) => {
    if (rangeDates.length === 0 || rangeDates.length === 2) {
      setRangeDates([date]);
    } else {
      setRangeDates([...rangeDates, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold mb-8">Calendar Component Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Single Date Selection</h2>
          <Calendar 
            selected={date} 
            onSelect={handleDateSelect}
            mode="single"
          />
          {date && (
            <p className="mt-4 text-center">
              Selected date: <span className="font-medium">{format(date, 'PPP')}</span>
            </p>
          )}
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Multiple Date Selection</h2>
          <Calendar 
            selected={multiDates} 
            onSelect={handleMultiDateSelect}
            mode="multiple"
          />
          {multiDates.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Selected dates:</p>
              <ul className="list-disc pl-5">
                {multiDates.map((date, index) => (
                  <li key={index}>{format(date, 'PPP')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Date Range Selection</h2>
          <Calendar 
            selected={rangeDates} 
            onSelect={handleRangeDateSelect}
            mode="range"
          />
          {rangeDates.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Selected range:</p>
              {rangeDates.length === 1 ? (
                <p>Start: {format(rangeDates[0], 'PPP')}</p>
              ) : (
                <>
                  <p>Start: {format(rangeDates[0], 'PPP')}</p>
                  <p>End: {format(rangeDates[1], 'PPP')}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
} 