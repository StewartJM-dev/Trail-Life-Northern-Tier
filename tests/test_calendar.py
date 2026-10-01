import sys
import unittest
from datetime import datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from sync_calendar import EASTERN, FEEDS, parse_feed

class CalendarTests(unittest.TestCase):
    def parse(self, body):
        return parse_feed(('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'+body+'END:VCALENDAR\r\n').encode(), FEEDS[0], datetime(2026, 1, 1, tzinfo=EASTERN), datetime(2027, 1, 1, tzinfo=EASTERN))

    def test_recurring_exclusions_and_daylight_saving(self):
        events = self.parse('BEGIN:VEVENT\r\nUID:weekly\r\nDTSTART;TZID=America/New_York:20260303T180000\r\nDTEND;TZID=America/New_York:20260303T193000\r\nRRULE:FREQ=WEEKLY;COUNT=3\r\nEXDATE;TZID=America/New_York:20260310T180000\r\nSUMMARY:Meeting\r\nEND:VEVENT\r\n')
        self.assertEqual(len(events), 2)
        self.assertEqual(events[0]['start'], '2026-03-03T18:00:00-05:00')
        self.assertEqual(events[1]['start'], '2026-03-17T18:00:00-04:00')

    def test_all_day_exclusive_end_and_escaped_folded_text(self):
        events = self.parse('BEGIN:VEVENT\r\nUID:camp\r\nDTSTART;VALUE=DATE:20261003\r\nDTEND;VALUE=DATE:20261005\r\nSUMMARY:Camp\\, together\r\nDESCRIPTION:First line\\nSecond\r\n  line\r\nLOCATION:Church\\, field\r\nEND:VEVENT\r\n')
        self.assertTrue(events[0]['allDay'])
        self.assertEqual(events[0]['end'], '2026-10-05')
        self.assertEqual(events[0]['description'], 'First line\nSecond line')
        self.assertEqual(events[0]['location'], 'Church, field')

    def test_moved_occurrence_and_cancelled_event(self):
        events = self.parse('BEGIN:VEVENT\r\nUID:weekly\r\nDTSTART;TZID=America/New_York:20261006T180000\r\nDTEND;TZID=America/New_York:20261006T193000\r\nRRULE:FREQ=WEEKLY;COUNT=2\r\nSUMMARY:Meeting\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:weekly\r\nRECURRENCE-ID;TZID=America/New_York:20261013T180000\r\nDTSTART;TZID=America/New_York:20261014T190000\r\nDTEND;TZID=America/New_York:20261014T200000\r\nSUMMARY:Moved meeting\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:cancelled\r\nDTSTART:20261015T180000Z\r\nSTATUS:CANCELLED\r\nSUMMARY:Cancelled\r\nEND:VEVENT\r\n')
        self.assertEqual(len(events), 2)
        self.assertTrue(any(event['start'] == '2026-10-14T19:00:00-04:00' for event in events))

    def test_html_response_rejected(self):
        with self.assertRaises(ValueError):
            parse_feed(b'<html>Sign in</html>', FEEDS[0], datetime(2026, 1, 1), datetime(2027, 1, 1))

if __name__ == '__main__':
    unittest.main()
