# 📅 Calendar Integration Setup Guide

## ✅ Calendar Feeds Already Configured!

Your Trail Life Connect calendar feeds are **already integrated** and working:

### Northern Tier Area Events:
```
https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/area
```

### Troop Events:
```
https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/troop
```

**These are active and will automatically pull events from Trail Life Connect!**

---

## Overview

The Trail Life Northern Tier website includes automatic calendar integration that pulls events from Trail Life Connect and individual troop calendars. Events are automatically synced and displayed with color-coding by source.

---

## 🎯 What You'll Need

1. **iCal Feed URLs** from:
   - Trail Life Connect (regional calendar)
   - Troop PA-1997 calendar
   - Troop NY-2911 calendar
   - Any additional troop calendars

2. **Access to edit** the `js/calendar.js` file

---

## 📍 Step 1: Get Your Calendar Feed URLs

### From Trail Life Connect:

1. Log into https://www.traillifeconnect.com
2. Navigate to your regional calendar
3. Look for "Subscribe" or "Export" options
4. Copy the **iCal** or **webcal://** URL
5. If you see `webcal://`, replace it with `https://`

**Example:**
```
webcal://calendar.google.com/calendar/ical/...
```
Changes to:
```
https://calendar.google.com/calendar/ical/...
```

### From Troop Calendars:

**If using Google Calendar:**
1. Open the calendar in Google Calendar
2. Click Settings (gear icon) > Settings
3. Click on the calendar name in the left sidebar
4. Scroll to "Integrate calendar"
5. Copy the **Secret address in iCal format**

**If using other calendar systems:**
- Look for "iCal feed", "Calendar subscription", or "Export" options
- Most calendar systems provide iCal (.ics) feed URLs

---

## 📍 Step 2: Add Feed URLs to the Website

1. Open the file: `js/calendar.js`

2. Find the `CALENDAR_FEEDS` configuration section (near the top):

```javascript
const CALENDAR_FEEDS = {
    regional: {
        name: 'Regional Events',
        url: '', // ADD YOUR TRAIL LIFE CONNECT iCal FEED URL HERE
        color: '#ba262d'
    },
    
    pa1997: {
        name: 'Troop PA-1997',
        url: '', // ADD TROOP PA-1997 iCal FEED URL HERE
        color: '#876237'
    },
    
    ny2911: {
        name: 'Troop NY-2911',
        url: '', // ADD TROOP NY-2911 iCal FEED URL HERE
        color: '#4fa7c5'
    }
};
```

3. Replace the empty `url: ''` values with your actual iCal feed URLs:

```javascript
const CALENDAR_FEEDS = {
    regional: {
        name: 'Regional Events',
        url: 'https://calendar.google.com/calendar/ical/YOUR_REGIONAL_CALENDAR/basic.ics',
        color: '#ba262d'
    },
    
    pa1997: {
        name: 'Troop PA-1997',
        url: 'https://calendar.google.com/calendar/ical/PA1997_CALENDAR_ID/basic.ics',
        color: '#876237'
    },
    
    ny2911: {
        name: 'Troop NY-2911',
        url: 'https://calendar.google.com/calendar/ical/NY2911_CALENDAR_ID/basic.ics',
        color: '#4fa7c5'
    }
};
```

4. **Save the file** and upload to your GitHub repository

---

## 📍 Step 3: Adding More Troop Calendars

To add additional troop calendars, add new entries to the `CALENDAR_FEEDS` object:

```javascript
const CALENDAR_FEEDS = {
    // Existing calendars...
    
    // Add new troop like this:
    ny1234: {
        name: 'Troop NY-1234',
        url: 'https://calendar.google.com/calendar/ical/NY1234_ID/basic.ics',
        color: '#34441c' // Use one of the official Trail Life colors
    }
};
```

**Available Official Colors:**
- Primary Red: `#ba262d`
- Dark Red: `#6c162b`
- Gold/Brown: `#876237`
- Dark Brown: `#3e2e18`
- Light Green: `#728e38`
- Dark Green: `#34441c`
- Light Blue: `#4fa7c5`
- Medium Blue: `#005c85`
- Dark Blue: `#003b59`

---

## 📍 Step 4: Update the Legend

1. Open `events.html`

2. Find the calendar legend section:

```html
<div class="calendar-legend">
    <div class="legend-item">
        <div class="legend-color" style="background: var(--primary-red);"></div>
        <span>Regional Events</span>
    </div>
    ...
</div>
```

3. Add legend items for new troops:

```html
<div class="legend-item">
    <div class="legend-color" style="background: #34441c;"></div>
    <span>Troop NY-1234</span>
</div>
```

---

## ⚠️ Important Notes on CORS

**Calendar feeds from external sources may be blocked by CORS (Cross-Origin Resource Sharing) policies.**

### Solutions:

**Option 1: Use a CORS Proxy (Temporary/Development)**
```javascript
url: 'https://cors-anywhere.herokuapp.com/YOUR_CALENDAR_URL'
```

**Option 2: Backend Service (Recommended for Production)**
Set up a simple backend service (Node.js, PHP, etc.) that:
1. Fetches the iCal feeds server-side
2. Serves the data to your frontend
3. Avoids CORS issues entirely

**Option 3: Use Calendar API Directly**
If using Google Calendar, use the Google Calendar API with an API key instead of iCal feeds.

---

## 🔄 How Auto-Sync Works

Once configured:

1. **Automatic Updates**: Events are fetched from calendar feeds when the page loads
2. **Color Coding**: Events are automatically color-coded by source
3. **Sorting**: Events are sorted chronologically
4. **Upcoming Events**: The "Upcoming Events" section shows the next 6 events
5. **Full Calendar**: The calendar view (when implemented with FullCalendar.js) shows all events

---

## 📚 Optional: Advanced Calendar Features

### Adding FullCalendar.js for Interactive Calendar View

1. Add FullCalendar library to `events.html` (in the `<head>` section):

```html
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.css' rel='stylesheet' />
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js'></script>
```

2. Uncomment the FullCalendar initialization code in `js/calendar.js` (line ~150):

```javascript
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
```

---

## 🧪 Testing Your Calendar Integration

1. Add at least one test event to each calendar
2. Open `events.html` in a browser
3. Check browser console (F12) for any errors
4. Verify events appear in the "Upcoming Events" section
5. Check that color coding matches the legend

---

## 🆘 Troubleshooting

**Events not showing?**
- Check that calendar URLs are correct and accessible
- Verify calendars are set to "Public" or have proper sharing settings
- Check browser console for CORS errors
- Test calendar URLs directly in browser

**Wrong colors?**
- Double-check the `color` values in `CALENDAR_FEEDS`
- Use official Trail Life colors from the list above

**Events from only some calendars?**
- Ensure all calendar `url` fields are filled in
- Check that each calendar is publicly accessible
- Verify iCal format (not just a web link)

---

## 📧 Need Help?

If you need assistance with calendar setup:

1. Contact your regional coordinator
2. Email: info@tlnorthern-tier.org (update with your actual email)
3. Check Trail Life Connect support documentation

---

**Calendar integration will make your events page dynamic and always up-to-date!** 📅✨
