import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/types';
import { fetchTodaysEvents, initializeGoogleAuth } from '@/utils/calendar';
import { format } from 'date-fns';

interface CalendarEventsProps {
  events: CalendarEvent[];
  onEventsUpdate: (events: CalendarEvent[]) => void;
}

export const CalendarEvents: React.FC<CalendarEventsProps> = ({ events, onEventsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize Google Auth on component mount
    initializeGoogleAuth().then(() => {
      setAuthInitialized(true);
    }).catch((error) => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }, []);

  const handleFetchEvents = async () => {
    setLoading(true);
    try {
      const todaysEvents = await fetchTodaysEvents();
      onEventsUpdate(todaysEvents);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      // TODO: Show error toast to user
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (start: Date, end: Date) => {
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const getEventDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return `${diffMinutes} min`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Calendar ({events.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchEvents}
            disabled={loading || !authInitialized}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Sync'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!authInitialized ? (
          <p className="text-center text-muted-foreground py-4">
            Initializing Google Calendar connection...
          </p>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-3">
              No calendar events found for today.
            </p>
            <Button variant="outline" onClick={handleFetchEvents} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Fetch Events
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">{event.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventTime(event.start, event.end)}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getEventDuration(event.start, event.end)}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};