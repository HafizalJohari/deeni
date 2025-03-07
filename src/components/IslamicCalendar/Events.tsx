"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IslamicCalendar } from './Calendar';
import { useHijriDate } from '@/hooks/useHijriDate';

interface Event {
  id: string;
  title: string;
  description: string;
  hijriDate: Date;
  eventType: 'religious' | 'personal';
}

export const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { formatHijriDate, toHijri } = useHijriDate();

  const handleAddEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    setEvents([...events, newEvent]);
    setIsAddingEvent(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Islamic Events</CardTitle>
        <CardDescription>
          View and manage religious and personal events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="religious" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="religious">Religious Events</TabsTrigger>
            <TabsTrigger value="personal">Personal Events</TabsTrigger>
          </TabsList>
          <TabsContent value="religious" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="font-medium">Upcoming Religious Events</h3>
              {/* Religious events will be populated from the database */}
            </div>
          </TabsContent>
          <TabsContent value="personal" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Create a new personal event in your Islamic calendar
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" placeholder="Enter event title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Enter event description" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <IslamicCalendar />
                    </div>
                    <Button type="submit" className="w-full">
                      Add Event
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="font-medium">Your Personal Events</h3>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="mt-4 rounded-lg border p-4 hover:bg-accent"
                >
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-2 text-sm">
                    {formatHijriDate(toHijri(event.hijriDate))}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 