import { CalendarEvent } from '@/types';

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

// Google Calendar API configuration
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// TODO: Replace with actual Google API key and client ID
const API_KEY = 'your-google-api-key';
const CLIENT_ID = 'your-google-client-id';

let gapi: any;
let tokenClient: any;

/**
 * Initialize Google Calendar API
 */
export const initializeGoogleAuth = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Load Google API script dynamically
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => initGapi();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    } else {
      initGapi();
    }

    function initGapi() {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: CLIENT_ID,
        }).then(() => {
          gapi = window.gapi;
          loadCalendarAPI();
        }).catch(reject);
      });
    }

    function loadCalendarAPI() {
      if (!gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      gapi.load('client', () => {
        gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        }).then(() => {
          resolve();
        }).catch(reject);
      });
    }
  });
};

/**
 * Sign in to Google and request calendar permissions
 */
export const signInToGoogle = async (): Promise<void> => {
  if (!gapi || !gapi.auth2) {
    throw new Error('Google API not initialized');
  }

  const authInstance = gapi.auth2.getAuthInstance();
  
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn({
      scope: SCOPES
    });
  }
};

/**
 * Fetch today's calendar events
 */
export const fetchTodaysEvents = async (): Promise<CalendarEvent[]> => {
  try {
    // For now, return mock data since we need actual API credentials
    // TODO: Replace with actual Google Calendar API call when credentials are provided
    
    await signInToGoogle();
    
    // Mock implementation - replace with actual API call:
    /*
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.result.items || [];
    return events.map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      description: event.description,
    }));
    */

    // Return mock data for now
    return getMockCalendarEvents();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    // Return mock data as fallback
    return getMockCalendarEvents();
  }
};

/**
 * Get mock calendar events for testing
 */
const getMockCalendarEvents = (): CalendarEvent[] => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return [
    {
      id: 'mock-1',
      title: 'Team Standup',
      start: new Date(`${todayStr}T09:00:00`),
      end: new Date(`${todayStr}T09:30:00`),
      description: 'Daily team sync meeting',
    },
    {
      id: 'mock-2',
      title: 'Client Call',
      start: new Date(`${todayStr}T14:00:00`),
      end: new Date(`${todayStr}T15:00:00`),
      description: 'Project review with client',
    },
    {
      id: 'mock-3',
      title: 'Code Review',
      start: new Date(`${todayStr}T16:30:00`),
      end: new Date(`${todayStr}T17:00:00`),
      description: 'Review pending PRs',
    },
  ];
};

/**
 * Check if user is signed in to Google
 */
export const isSignedIn = (): boolean => {
  if (!gapi || !gapi.auth2) return false;
  const authInstance = gapi.auth2.getAuthInstance();
  return authInstance.isSignedIn.get();
};

/**
 * Sign out from Google
 */
export const signOut = async (): Promise<void> => {
  if (!gapi || !gapi.auth2) return;
  const authInstance = gapi.auth2.getAuthInstance();
  await authInstance.signOut();
};