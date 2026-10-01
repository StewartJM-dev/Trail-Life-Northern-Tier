"""Import explicitly selected adventures from registered public troop feeds."""
import html
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]

def select_events(payload):
    if not isinstance(payload.get('events'), list):
        raise ValueError('Feed must contain an events array')
    result = []
    for event in payload['events']:
        if event.get('isMeeting') is not False or event.get('cancelled'):
            continue
        # An explicit flag is supported for future troops; PA-1997 currently
        # identifies these activities in the event title or description.
        label = event.get('title', '') + ' ' + event.get('description', '')
        if event.get('hitTheTrail') is not True and not re.search(r'\bhit\s+the\s+trail\b', label, re.I):
            continue
        date.fromisoformat(event['date'])
        date.fromisoformat(event.get('endDate') or event['date'])
        description = html.unescape(re.sub(r'<[^>]+>', ' ', event.get('description', '')))
        description = ' '.join(description.split())
        poster = event.get('poster') or {}
        file_id = poster.get('fileId', '')
        result.append({
            'id': str(event['id']), 'title': event.get('displayTitle') or event['title'],
            'date': event['date'], 'endDate': event.get('endDate') or event['date'],
            'startTime': event.get('startTime'), 'endTime': event.get('endTime'),
            'tentative': bool(event.get('tentative')), 'location': event.get('location', ''),
            'description': description,
            'posterUrl': 'https://drive.google.com/thumbnail?id=' + file_id + '&sz=w1000' if re.fullmatch(r'[\w-]+', file_id) else None,
        })
    return sorted(result, key=lambda e: (e['date'], e.get('startTime') or ''))

def main():
    target = ROOT / 'data/troop-events.json'
    previous = json.loads(target.read_text()) if target.exists() else {'troops': []}
    cached = {t['id']: t for t in previous['troops']}
    troops = []
    for config in json.loads((ROOT / 'data/troop-feeds.json').read_text())['troops']:
        try:
            req = Request(config['feedUrl'], headers={'User-Agent': 'NorthernTierTroopEvents/1.0'})
            with urlopen(req, timeout=30) as response:
                payload = json.load(response)
            troop = dict(config, events=select_events(payload), syncedAt=datetime.now(timezone.utc).isoformat())
        except Exception as exc:
            if config['id'] not in cached:
                raise
            print(f"Keeping last snapshot for {config['id']}: {exc}")
            troop = cached[config['id']]
        troops.append(troop)
    target.write_text(json.dumps({'troops': troops}, indent=2) + '\n')

if __name__ == '__main__':
    main()
