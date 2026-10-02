import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = ['index', 'about', 'blog', 'resources', 'events', 'gallery',
                'troops', 'spotlight', 'leaders', 'achievements', 'contact',
                'new-to-trail-life']
REQUIRED = ['og:title', 'og:description', 'og:url', 'og:image']


class LinkPreviewTagsTests(unittest.TestCase):
    """Every public page needs Open Graph tags so a shared link shows a
    title, description, and preview image instead of a bare URL."""

    def test_every_public_page_has_preview_tags(self):
        for page in PUBLIC_PAGES:
            html = (ROOT / f'{page}.html').read_text(encoding='utf-8')
            with self.subTest(page=page):
                self.assertRegex(html, r'<meta name="description" content="[^"]+">')
                for prop in REQUIRED:
                    self.assertRegex(html, rf'<meta property="{prop}" content="[^"]+">')

    def test_preview_image_exists(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        image_url = re.search(r'<meta property="og:image" content="([^"]+)">', html).group(1)
        self.assertTrue((ROOT / image_url.split('/Trail-Life-Northern-Tier/')[1]).exists())


if __name__ == '__main__':
    unittest.main()
