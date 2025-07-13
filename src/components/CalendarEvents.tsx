import React, { useState } from 'react';
import { gapi } from 'gapi-script';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent } from '@/types';
import { format } from 'date-fns';

interface CalendarEventsProps {
  events: CalendarEvent[];
  onEventsUpdate: (events: CalendarEvent[]) => void;
}

export const CalendarEvents: React.FC<CalendarEventsProps> = ({
  events,
  onEventsUpdate,
}) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize OAuth and fetch events when user clicks connect
  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      // --- OAuth initialization ---
      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', {
          callback: async () => {
            try {
              await gapi.client.init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                discoveryDocs: [
                  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
                ],
                scope:
                  'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly',
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          onerror: () => reject(new Error('gapi failed to load')),
        });
      });

      await gapi.auth2.getAuthInstance().signIn();
      setConnected(true);
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setError('Failed to connect to Google');
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's events from Google Calendar
  const fetchEvents = async () => {
    setError(null);
    setLoading(true);
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      // --- Event fetch ---
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const items = response.result.items || [];
      const parsed = items.map((ev: any) => ({
        id: ev.id,
        title: ev.summary || 'Untitled',
        start: new Date(ev.start.dateTime || ev.start.date),
        end: new Date(ev.end.dateTime || ev.end.date),
      }));
      onEventsUpdate(parsed);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!connected) {
      return (
        <div className="text-center py-4">
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
        </div>
      );
    }

    if (loading) {
      return <p className="text-center py-4">Loading...</p>;
    }

    if (error) {
      return (
        <p className="text-center text-destructive py-4">
          {error}
        </p>
      );
    }

    if (events.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-4">
          No events today
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {events.map((ev) => (
          <li key={ev.id} className="flex justify-between">
            <span>{format(ev.start, 'HH:mm')}</span>
            <span className="ml-2 truncate">{ev.title}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Today's Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

