// Trail Life Northern Tier - Calendar Integration
// This file handles pulling events from multiple calendar feeds

// ========================================
// Calendar Feed Configuration
// ========================================
const CALENDAR_FEEDS = {
    // Regional/Area calendar from Trail Life Connect
    regional: {
        name: 'Northern Tier Area Events',
        url: 'https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/area',
        color: '#ba262d' // Primary red
    },
    
    // Troop events from Trail Life Connect
    troopEvents: {
        name: 'Troop Events',
        url: 'https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/troop',
        color: '#876237' // Gold
    },
    
    // Troop PA-1997 calendar (add if you have a separate feed)
    pa1997: {
        name: 'Troop PA-1997',
        url: '', // ADD TROOP PA-1997 iCal FEED URL HERE IF AVAILABLE
        color: '#876237' // Gold
    },
    
    // Troop NY-2911 calendar (add if you have a separate feed)
    ny2911: {
        name: 'Troop NY-2911',
        url: '', // ADD TROOP NY-2911 iCal FEED URL HERE IF AVAILABLE
        color: '#4fa7c5' // Light blue
    }
    
    // Add more troop calendars here as needed
};

// ========================================
// Calendar Integration Functions
// ========================================

/**
 * Fetch and parse iCal feed
 * Note: Trail Life Connect feeds may require CORS handling
 * @param {string} url - iCal feed URL
 * @returns {Promise<Array>} Array of parsed events
 */
async function fetchCalendarFeed(url) {
    try {
        // For Trail Life Connect feeds, we may need to use a CORS proxy
        // or fetch server-side. For now, try direct fetch.
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const icalData = await response.text();
        return parseICalData(icalData);
    } catch (error) {
        console.error('Error fetching calendar feed:', error);
        console.log('URL attempted:', url);
        console.log('Note: If CORS error, see CALENDAR_SETUP.md for solutions');
        return [];
    }
}

/**
 * Parse iCal data into event objects
 * @param {string} icalData - Raw iCal data
 * @returns {Array} Parsed events
 */
function parseICalData(icalData) {
    // Basic iCal parsing
    // For production, consider using a library like ical.js
    const events = [];
    const lines = icalData.split('\n');
    let currentEvent = {};
    
    for (let line of lines) {
        line = line.trim();
        
        if (line === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (line === 'END:VEVENT') {
            events.push(currentEvent);
        } else if (line.startsWith('SUMMARY:')) {
            currentEvent.title = line.substring(8);
        } else if (line.startsWith('DTSTART')) {
            // Parse date (simplified - enhance for production)
            const dateMatch = line.match(/\d{8}/);
            if (dateMatch) {
                currentEvent.date = parseICalDate(dateMatch[0]);
            }
        } else if (line.startsWith('DESCRIPTION:')) {
            currentEvent.description = line.substring(12);
        } else if (line.startsWith('LOCATION:')) {
            currentEvent.location = line.substring(9);
        }
    }
    
    return events;
}

/**
 * Parse iCal date format (YYYYMMDD) to JavaScript Date
 * @param {string} icalDate - Date in YYYYMMDD format
 * @returns {Date} JavaScript Date object
 */
function parseICalDate(icalDate) {
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6) - 1;
    const day = icalDate.substring(6, 8);
    return new Date(year, month, day);
}

/**
 * Load all calendar feeds and combine events
 * @returns {Promise<Array>} Combined events from all feeds
 */
async function loadAllCalendars() {
    const allEvents = [];
    
    for (const [key, feed] of Object.entries(CALENDAR_FEEDS)) {
        if (feed.url) {
            const events = await fetchCalendarFeed(feed.url);
            events.forEach(event => {
                event.source = feed.name;
                event.color = feed.color;
            });
            allEvents.push(...events);
        }
    }
    
    // Sort events by date
    allEvents.sort((a, b) => a.date - b.date);
    
    return allEvents;
}

/**
 * Display upcoming events
 * @param {Array} events - Array of event objects
 * @param {number} limit - Number of events to display
 */
function displayUpcomingEvents(events, limit = 6) {
    const container = document.getElementById('upcoming-events-list');
    if (!container) return;
    
    const upcomingEvents = events
        .filter(event => event.date >= new Date())
        .slice(0, limit);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">No upcoming events. Check back soon!</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <div class="event-date">
                <span class="event-month">${getMonthAbbr(event.date)}</span>
                <span class="event-day">${event.date.getDate()}</span>
            </div>
            <div class="event-info">
                <h3>${event.title || 'Event'}</h3>
                ${event.location ? `<p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                <span class="event-source" style="background: ${event.color};">${event.source}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Get month abbreviation
 * @param {Date} date - Date object
 * @returns {string} Three-letter month abbreviation
 */
function getMonthAbbr(date) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()];
}

/**
 * Initialize calendar display
 * For full calendar view, integrate with a calendar library like FullCalendar.js
 */
function initializeCalendar(events) {
    const calendarDiv = document.getElementById('calendar');
    if (!calendarDiv) return;
    
    // This is a placeholder for full calendar implementation
    // Recommended: Use FullCalendar.js or similar library
    // For now, we'll just display a message
    console.log('Calendar events loaded:', events);
    
    // You can integrate with FullCalendar.js like this:
    /*
    const calendar = new FullCalendar.Calendar(calendarDiv, {
        initialView: 'dayGridMonth',
        events: events.map(event => ({
            title: event.title,
            start: event.date,
            description: event.description,
            location: event.location,
            backgroundColor: event.color
        }))
    });
    calendar.render();
    */
}

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the events page
    if (!document.getElementById('calendar')) return;
    
    // Load calendar feeds
    const events = await loadAllCalendars();
    
    // Display upcoming events
    displayUpcomingEvents(events);
    
    // Initialize full calendar view
    initializeCalendar(events);
});

// ========================================
// Export for use in other scripts
// ========================================
window.CalendarIntegration = {
    loadAllCalendars,
    displayUpcomingEvents,
    CALENDAR_FEEDS
};
