import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_pages import NAV_ITEMS, TEMPLATED_PAGES, build, render_footer, render_nav


class RenderTests(unittest.TestCase):
    def test_nav_marks_exactly_the_current_page_active(self):
        nav = render_nav('troops.html')
        self.assertEqual(nav.count('class="active"'), 1)
        self.assertIn('<a href="troops.html" class="active">Troops</a>', nav)
        self.assertEqual(nav.count('<li>'), len(NAV_ITEMS))

    def test_nav_has_no_active_item_for_a_page_outside_the_list(self):
        nav = render_nav('admin-dashboard.html')
        self.assertNotIn('class="active"', nav)

    def test_footer_marks_current_page_in_quick_links_and_connect(self):
        footer = render_footer('contact.html')
        self.assertIn('<a href="contact.html" class="active">Contact Us</a>', footer)

    def test_footer_always_includes_trademark_line(self):
        footer = render_footer('index.html')
        self.assertIn('Trail Life USA is a registered trademark.', footer)


class RepoDriftTests(unittest.TestCase):
    """Guards against the exact bug that motivated this script: a page's nav
    or footer silently drifting from every other page (a missing link, a
    missing active class, a dropped line) through a one-off hand edit."""

    def test_committed_pages_already_match_the_canonical_nav_and_footer(self):
        changed, missing = build(ROOT, write=False)
        self.assertEqual(missing, [], f'Pages missing a nav/footer block entirely: {missing}')
        self.assertEqual(changed, [], f'Pages whose committed nav/footer has drifted from the canonical version: {changed}')

    def test_every_templated_page_exists(self):
        for page in TEMPLATED_PAGES:
            self.assertTrue((ROOT / page).exists(), f'{page} is listed in NAV_ITEMS but does not exist')


if __name__ == '__main__':
    unittest.main()
