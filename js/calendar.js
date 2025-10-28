// Trail Life Northern Tier - Calendar Integration
// Using Google Calendar API (same approach as PA-1997 site)

// ========================================
// Configuration
// ========================================
const API_KEY = 'AIzaSyAO1G7TptJAuy9UhBl7J5IzZHlr-XNgRn8';

const CALENDAR_FEEDS = {
    troopEvents: {
        name: 'Troop Events',
        calendarId: '4rmk9e2v6c5ngo39n7g9i679b737h7gm@import.calendar.google.com',
        color: '#876237' // Gold
    },
    northernTier: {
        name: 'Northern Tier Area Events',
        calendarId: 'vd66q5sembl1l479m829q8mgnqgu2sm8@import.calendar.google.com',
        color: '#ba262d' // Primary red
    },
    northeast: {
        name: 'Northeast Region Events',
        calendarId: 'ul0fcc6vnih5c2sicq2l1j6trtkc5vjj@import.calendar.google.com',
        color: '#1e5a8e' // Blue
    },
    national: {
        name: 'Trail Life USA National Events',
        calendarId: 'luhdkcig271vbof0khlesai309va3bpu@import.calendar.google.com',
        color: '#2e7d32' // Green
    }
};

// ========================================
// Calendar Functions
// ========================================

/**
 * Fetch events from a Google Calendar using the API
 */
async function fetchCalendarEvents(calendarId, sourceName, color) {
    const now = new Date();
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${API_KEY}&timeMin=${now.toISOString()}&timeMax=${sixMonthsLater.toISOString()}&orderBy=startTime&singleEvents=true&maxResults=50`;
    
    try {
        console.log(`Fetching events from: ${sourceName}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Successfully loaded ${data.items?.length || 0} events from ${sourceName}`);
        
        // Convert to our event format
        const events = (data.items || []).map(event => ({
            title: event.summary,
            date: new Date(event.start.dateTime || event.start.date),
            description: event.description || '',
            location: event.location || '',
            source: sourceName,
            color: color
        }));
        
        return events;
    } catch (error) {
        console.error(`Error fetching ${sourceName}:`, error);
        return [];
    }
}

/**
 * Load all calendar feeds
 */
async function loadAllCalendars() {
    const allEvents = [];
    
    for (const [key, feed] of Object.entries(CALENDAR_FEEDS)) {
        const events = await fetchCalendarEvents(feed.calendarId, feed.name, feed.color);
        allEvents.push(...events);
    }
    
    // Sort by date
    allEvents.sort((a, b) => a.date - b.date);
    
    console.log(`Total events loaded: ${allEvents.length}`);
    return allEvents;
}

/**
 * Display upcoming events
 */
function displayUpcomingEvents(events, limit = 6) {
    const container = document.getElementById('upcoming-events-list');
    if (!container) return;
    
    const upcomingEvents = events
        .filter(event => event.date >= new Date())
        .slice(0, limit);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">No upcoming events. Check back soon!</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <div class="event-date">
                <span class="event-month">${getMonthAbbr(event.date)}</span>
                <span class="event-day">${event.date.getDate()}</span>
            </div>
            <div class="event-info">
                <h3>${event.title}</h3>
                ${event.location ? `<p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                <span class="event-source" style="background: ${event.color};">${event.source}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Get month abbreviation
 */
function getMonthAbbr(date) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()];
}

/**
 * Initialize calendar
 */
function initializeCalendar(events) {
    console.log('Calendar initialized with events:', events);
}

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the events page
    if (!document.getElementById('calendar')) return;
    
    console.log('Loading Northern Tier calendar feeds...');
    
    try {
        // Load all calendar feeds
        const events = await loadAllCalendars();
        
        // Display upcoming events
        displayUpcomingEvents(events);
        
        // Initialize calendar view
        initializeCalendar(events);
        
        console.log('✅ Calendar loaded successfully!');
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
});

// ========================================
// Export
// ========================================
window.CalendarIntegration = {
    loadAllCalendars,
    displayUpcomingEvents,
    CALENDAR_FEEDS
};
