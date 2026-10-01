import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('troop_sync', Path(__file__).resolve().parents[1] / 'scripts/sync_troop_events.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class SelectionTests(unittest.TestCase):
    def test_explicit_selection_excludes_meetings_and_cancelled_events(self):
        base = dict(id='a', title='Adventure', isMeeting=False, date='2026-10-03', description='Science Hit the Trail', poster=None)
        events = [base, dict(base, id='meeting', isMeeting=True), dict(base, id='cancelled', cancelled=True), dict(base, id='other', description='Ordinary special event')]
        self.assertEqual([e['id'] for e in sync.select_events({'events': events})], ['a'])

    def test_future_flag_and_safe_description(self):
        event = dict(id='b', title='Camping', isMeeting=False, hitTheTrail=True, date='2026-10-03', description='<p>Faith &amp; adventure</p>', poster={'fileId':'../unsafe'})
        result = sync.select_events({'events':[event]})[0]
        self.assertEqual(result['description'], 'Faith & adventure')
        self.assertIsNone(result['posterUrl'])

    def test_invalid_feed_fails_instead_of_clearing_snapshot(self):
        with self.assertRaises(ValueError): sync.select_events({'error': 'Unavailable'})
