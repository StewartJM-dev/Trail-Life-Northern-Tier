"""Fetch public TLC calendars and atomically write a validated event snapshot."""
import hashlib
import json
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from icalendar import Calendar
import recurring_ical_events

ROOT = Path(__file__).resolve().parents[1]
EASTERN = ZoneInfo('America/New_York')
FEEDS = [
    {'id': 'troop', 'name': 'Troop Events', 'color': '#876237', 'url': 'https://www.traillifeconnect.com/icalendar/tkp7apvaqhab/na/public'},
    {'id': 'area', 'name': 'Northern Tier Area Events', 'color': '#ba262d', 'url': 'https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aaktziejgkh6/area'},
    {'id': 'region', 'name': 'Northern Tier Events', 'color': '#1e5a8e', 'url': 'https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aaktziejgkh6/region'},
    {'id': 'national', 'name': 'Trail Life USA National Events', 'color': '#2e7d32', 'url': 'https://www.traillifeconnect.com/icalendar/tkekboggp6qa/aaktziejgkh6/home_office'},
]


def normalize(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=EASTERN)
        return value.astimezone(EASTERN).isoformat()
    return value.isoformat()


def parse_feed(raw, feed, start, end):
    if b'BEGIN:VCALENDAR' not in raw:
        raise ValueError('Response is not an iCalendar feed')
    calendar = Calendar.from_ical(raw)
    results = []
    for item in recurring_ical_events.of(calendar).between(start, end):
        if str(item.get('STATUS', '')).upper() == 'CANCELLED':
            continue
        begin = item.decoded('DTSTART')
        finish = item.decoded('DTEND', None)
        all_day = isinstance(begin, date) and not isinstance(begin, datetime)
        if finish is None:
            finish = begin + item.decoded('DURATION', timedelta(days=1) if all_day else timedelta(hours=1))
        event = {
            'title': str(item.get('SUMMARY', 'Event')),
            'start': normalize(begin), 'end': normalize(finish), 'allDay': all_day,
            'description': str(item.get('DESCRIPTION', '')),
            'location': str(item.get('LOCATION', '')),
            'source': feed['id'], 'sourceName': feed['name'], 'color': feed['color'],
        }
        uid = str(item.get('UID', event['title']))
        event['id'] = hashlib.sha256((feed['id'] + uid + event['start']).encode()).hexdigest()[:24]
        results.append(event)
    return results


def fetch_feed(feed, start, end):
    request = Request(feed['url'], headers={'User-Agent': 'NorthernTierCalendar/1.0'})
    with urlopen(request, timeout=45) as response:
        raw = response.read(10 * 1024 * 1024 + 1)
    if len(raw) > 10 * 1024 * 1024:
        raise ValueError('Calendar exceeds maximum size')
    events = parse_feed(raw, feed, start, end)
    return events, {'id': feed['id'], 'name': feed['name'], 'color': feed['color'], 'count': len(events)}


def sync(output=ROOT / 'data/events.json'):
    now = datetime.now(EASTERN)
    start = datetime(now.year, now.month, 1, tzinfo=EASTERN) - timedelta(days=365)
    end = now + timedelta(days=730)
    # A failed feed aborts publication; it must never masquerade as an empty calendar.
    with ThreadPoolExecutor(max_workers=4) as pool:
        snapshots = list(pool.map(lambda feed: fetch_feed(feed, start, end), FEEDS))
    events = {event['id']: event for batch, _ in snapshots for event in batch}
    payload = {
        'generatedAt': datetime.now(timezone.utc).isoformat(), 'timeZone': 'America/New_York',
        'windowStart': start.date().isoformat(), 'windowEnd': end.date().isoformat(),
        'sources': [source for _, source in snapshots],
        'events': sorted(events.values(), key=lambda event: (event['start'], event['id'])),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix('.tmp')
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    os.replace(temp, output)
    print(json.dumps({'events': len(events), 'sources': payload['sources']}))


if __name__ == '__main__':
    sync()
