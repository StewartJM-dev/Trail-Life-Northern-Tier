// Trail Life Northern Tier - Calendar Integration
// This file handles pulling events from multiple calendar feeds

// ========================================
// Calendar Feed Configuration
// ========================================
const CALENDAR_FEEDS = {
    // Troop Events via Google Calendar
    troopEvents: {
        name: 'Troop Events',
        url: 'https://calendar.google.com/calendar/ical/4rmk9e2v6c5ngo39n7g9i679b737h7gm%40import.calendar.google.com/public/basic.ics',
        color: '#876237' // Gold
    },
    
    // Northern Tier Area Events via Google Calendar
    regional: {
        name: 'Northern Tier Area Events',
        url: 'https://calendar.google.com/calendar/ical/vd66q5sembl1l479m829q8mgnqgu2sm8%40import.calendar.google.com/public/basic.ics',
        color: '#ba262d' // Primary red
    }
    
    // Add more troop calendars here as needed
};

// ========================================
// Calendar Integration Functions
// ========================================

/**
 * Fetch and parse iCal feed using CORS proxy
 * @param {string} url - iCal feed URL
 * @returns {Promise<Array>} Array of parsed events
 */
async function fetchCalendarFeed(url) {
    try {
        // Use corsproxy.io to bypass CORS restrictions
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        console.log('Fetching calendar from:', url);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const icalData = await response.text();
        console.log('Successfully fetched calendar data');
        return parseICalData(icalData);
    } catch (error) {
        console.error('Error fetching calendar feed:', error);
        console.log('Failed URL:', url);
        return [];
    }
}

/**
 * Parse iCal data into event objects
 * @param {string} icalData - Raw iCal data
 * @returns {Array} Parsed events
 */
function parseICalData(icalData) {
    const events = [];
    const lines = icalData.split(/\r?\n/);
    let currentEvent = null;
    let currentField = '';
    let currentValue = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Handle line continuations (lines starting with space or tab)
        if (line.startsWith(' ') || line.startsWith('\t')) {
            currentValue += line.trim();
            continue;
        }
        
        // Save previous field if we have one
        if (currentField && currentEvent) {
            if (currentField === 'SUMMARY') {
                currentEvent.title = currentValue;
            } else if (currentField.startsWith('DTSTART')) {
                currentEvent.date = parseICalDate(currentValue);
            } else if (currentField === 'DESCRIPTION') {
                currentEvent.description = currentValue.replace(/\\n/g, ' ').replace(/\\,/g, ',');
            } else if (currentField === 'LOCATION') {
                currentEvent.location = currentValue.replace(/\\,/g, ',');
            }
        }
        
        // Process current line
        if (line === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (line === 'END:VEVENT') {
            if (currentEvent && currentEvent.title && currentEvent.date) {
                events.push(currentEvent);
            }
            currentEvent = null;
        } else if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            currentField = line.substring(0, colonIndex).split(';')[0];
            currentValue = line.substring(colonIndex + 1);
        }
    }
    
    console.log(`Parsed ${events.length} events from calendar`);
    return events;
}

/**
 * Parse iCal date format to JavaScript Date
 * Handles both date-only (YYYYMMDD) and datetime (YYYYMMDDTHHmmssZ) formats
 * @param {string} icalDate - Date in iCal format
 * @returns {Date} JavaScript Date object
 */
function parseICalDate(icalDate) {
    // Remove any extra characters and get just the date part
    const dateStr = icalDate.replace(/[;:]/g, '').split('T')[0];
    
    if (dateStr.length >= 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6) - 1; // JS months are 0-indexed
        const day = dateStr.substring(6, 8);
        return new Date(year, month, day);
    }
    
    // Fallback to current date if parsing fails
    return new Date();
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
    
    console.log('Calendar events loaded:', events);
}

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the events page
    if (!document.getElementById('calendar')) return;
    
    console.log('Loading calendar feeds...');
    
    // Load calendar feeds
    const events = await loadAllCalendars();
    
    console.log(`Total events loaded: ${events.length}`);
    
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
