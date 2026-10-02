import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from sync_gallery import SHEET_URL, encode_thumbnail, published_rows, sync


class GalleryTests(unittest.TestCase):
    def test_filters_unpublished_and_preserves_quoted_captions(self):
        rows = published_rows(b'image_url,caption,published\nhttps://i.ibb.co/one/a.jpg,"Hike, together",TRUE\nhttps://i.ibb.co/two/b.jpg,Hidden,FALSE\n')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['caption'], 'Hike, together')

    def test_rejects_unexpected_download_hosts(self):
        with self.assertRaises(ValueError):
            published_rows(b'image_url,published\nhttps://example.com/a.jpg,TRUE\n')

    def test_thumbnail_is_bounded_and_has_no_exif(self):
        raw = io.BytesIO()
        Image.new('RGB', (1600, 1200), 'green').save(raw, 'JPEG')
        data, width, height = encode_thumbnail(raw.getvalue())
        self.assertEqual((width, height), (640, 480))
        with Image.open(io.BytesIO(data)) as image:
            self.assertEqual(image.format, 'WEBP')
            self.assertFalse(image.getexif())

    def test_sync_reuses_thumbnails_and_keeps_snapshot_on_failure(self):
        raw = io.BytesIO()
        Image.new('RGB', (800, 600), 'green').save(raw, 'JPEG')
        image = raw.getvalue()
        url = 'https://i.ibb.co/one/a.jpg'
        sheet = f'image_url,caption,published\n{url},Adventure,TRUE\n'.encode()
        calls = []
        def fetch(target):
            calls.append(target)
            return sheet if target == SHEET_URL else image
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = sync(root, fetch)
            self.assertTrue((root / first['photos'][0]['thumbnail_url']).exists())
            calls.clear()
            sync(root, fetch)
            self.assertEqual(calls, [SHEET_URL])
            snapshot = (root / 'data/gallery.json').read_bytes()
            def broken_fetch(target):
                if target == SHEET_URL:
                    return sheet.replace(b'/one/', b'/new/')
                raise OSError('Image host unavailable')
            with self.assertRaises(OSError):
                sync(root, broken_fetch)
            self.assertEqual((root / 'data/gallery.json').read_bytes(), snapshot)


if __name__ == '__main__':
    unittest.main()
