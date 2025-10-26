# 📅 Calendar Integration - Quick Reference

## ✅ Your Calendar Feeds (ACTIVE)

### Northern Tier Area Events
**URL:** `https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/area`
**Color:** Red (#ba262d)
**Shows:** Area-level events for Northern Tier

### Troop Events  
**URL:** `https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aajala0vlv0b/troop`
**Color:** Gold (#876237)
**Shows:** Troop-level events

---

## 🔄 How It Works

1. **Automatic Sync:** Events are fetched from Trail Life Connect when visitors load the events page
2. **Real-Time Updates:** When you add/edit events in Trail Life Connect, they automatically appear on your website
3. **Color Coding:** Events are color-coded by source (Area vs Troop events)
4. **Descriptions Included:** Event details, locations, and descriptions pull automatically

---

## 📝 Managing Events

**To add/edit events:**
1. Log into Trail Life Connect at https://www.traillifeconnect.com
2. Navigate to your calendar
3. Add or edit events as normal
4. Events will automatically sync to your website within minutes

**Event Information Displayed:**
- Event title
- Date and time
- Location
- Description
- Which source it's from (Area or Troop)

---

## 🎨 Event Display

**On the Events Page:**
- Full calendar view (when implemented with FullCalendar.js)
- "Upcoming Events" section showing next 6 events
- Color-coded by source
- Sorted chronologically

**Event Cards Show:**
- Month and day prominently displayed
- Event title
- Location (if specified)
- Description
- Source badge (Area Events or Troop Events)

---

## ⚙️ Technical Details

**Calendar System:** 
- Located in: `js/calendar.js`
- Events page: `events.html`
- Documentation: `CALENDAR_SETUP.md`

**Event Feeds:**
- Format: iCalendar (.ics)
- Protocol: HTTPS
- Source: Trail Life Connect

**Update Frequency:**
- Events refresh each time the page loads
- No caching (always shows latest)

---

## 🔧 Need to Modify?

**To add more calendar feeds:**
1. Open `js/calendar.js`
2. Add entry to `CALENDAR_FEEDS` object
3. Choose a color from official Trail Life palette
4. Update legend in `events.html`

**To change colors:**
1. Edit `color` values in `js/calendar.js`
2. Update legend colors in `events.html`

---

## 📧 Subscribe Links

**For leaders/parents to add to their personal calendars:**

**Google Calendar:**
- Click "Subscribe to Google Calendar" on Trail Life Connect
- Or manually add the iCal URL in Google Calendar settings

**Apple Calendar (iPhone/Mac):**
- Use the iCal feed URLs above
- File → New Calendar Subscription → Paste URL

**Outlook:**
- Add from web → Paste iCal URL

---

## ✨ What's Automatic

✅ Event titles
✅ Event dates and times  
✅ Event locations
✅ Event descriptions
✅ Color coding by source
✅ Chronological sorting
✅ Updates from Trail Life Connect

---

## 🆘 Troubleshooting

**Events not showing?**
1. Check that events exist in Trail Life Connect
2. Verify URLs are correct in `js/calendar.js`
3. Check browser console (F12) for errors
4. See CALENDAR_SETUP.md for CORS solutions if needed

**Events delayed?**
- Events update when page loads
- Have visitors refresh the page
- No caching is used, so updates appear immediately

---

**Your calendar integration is ready to go!** 🎉

Add events in Trail Life Connect and they'll automatically appear on your website!
