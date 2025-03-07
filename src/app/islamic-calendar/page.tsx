import { Metadata } from 'next';
import { IslamicCalendar } from '@/components/IslamicCalendar/Calendar';
import { Events } from '@/components/IslamicCalendar/Events';
import { RamadanCountdown } from '@/components/IslamicCalendar/RamadanCountdown';

export const metadata: Metadata = {
  title: 'Islamic Calendar & Events',
  description: 'View and manage Islamic calendar, events, and Ramadan countdown',
};

export default function IslamicCalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Islamic Calendar & Events</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <IslamicCalendar className="w-full" />
          <RamadanCountdown />
        </div>
        
        <div>
          <Events />
        </div>
      </div>
    </div>
  );
} 