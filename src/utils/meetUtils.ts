/**
 * Generate a real Google Meet link using Google Calendar API
 * This creates a temporary calendar event with a Meet link, then extracts the link
 */
export const generateRealMeetLink = async (accessToken: string): Promise<string | null> => {
  try {
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    // Create a temporary event with Google Meet conference
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'Temporary Meeting - Will be deleted',
          start: {
            dateTime: new Date().toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to create Meet link:', await response.text());
      return null;
    }

    const event = await response.json();
    const meetLink = event.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    // Delete the temporary event
    if (event.id) {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
    }

    return meetLink || null;
  } catch (error) {
    console.error('Error generating Meet link:', error);
    return null;
  }
};

/**
 * Simpler approach: Generate Meet link using Google OAuth access token
 * Note: This creates a valid Meet room that persists
 */
export const createInstantMeetLink = async (accessToken: string): Promise<string | null> => {
  try {
    if (!accessToken) {
      console.error('❌ No Google OAuth access token provided');
      throw new Error('NO_ACCESS_TOKEN');
    }
    
    console.log('🔑 Using Google OAuth access token to create Meet link...');
    
    // Use Google's Calendar API to create a Meet link
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'Meeting',
          start: {
            dateTime: new Date().toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: new Date(Date.now() + 3600000).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${Math.random().toString(36).substring(2, 15)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Calendar API error:', response.status, errorText);
      
      if (response.status === 403) {
        throw new Error('CALENDAR_API_NOT_ENABLED');
      } else if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      
      throw new Error(`API_ERROR_${response.status}`);
    }

    const data = await response.json();
    console.log('📅 Calendar event created:', data);
    
    const meetLink = data.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    if (!meetLink) {
      console.error('❌ No Meet link found in response');
      throw new Error('NO_MEET_LINK');
    }

    // Delete the temporary event but keep the Meet room
    if (data.id) {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${data.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );
      console.log('🗑️ Temporary calendar event deleted, Meet link preserved');
    }

    console.log('✅ Meet link created:', meetLink);
    return meetLink;
  } catch (error) {
    console.error('Error creating instant Meet link:', error);
    throw error;
  }
};

