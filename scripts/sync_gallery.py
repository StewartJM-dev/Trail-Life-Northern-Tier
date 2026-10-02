"""Build same-origin, lightweight gallery thumbnails from the published sheet."""
import csv
import hashlib
import io
import json
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_X6dSEGVXlheOHOroGqZzK6bT6Y_v2RpkU30JPXdnRN9mz5q-7KN66WvTynC-bUbHbecsmOwDB3I/pub?output=csv'
MAX_BYTES = 20 * 1024 * 1024


def download(url):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0 NorthernTierGallery/1.0'}), timeout=45) as response:
        content = response.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise ValueError('Gallery download exceeds 20 MB')
    return content


def published_rows(raw):
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8-sig')))
    if not {'image_url', 'published'} <= set(reader.fieldnames or []):
        raise ValueError('Gallery sheet is missing required columns')
    rows = list(reader)
    result = []
    for row in rows:
        if row.get('published', '').strip().lower() != 'true':
            continue
        url = row.get('image_url', '').strip()
        # Only download the expected image host, not arbitrary sheet URLs.
        parsed = urlparse(url)
        if parsed.scheme != 'https' or parsed.hostname != 'i.ibb.co':
            raise ValueError('Published gallery image must use https://i.ibb.co')
        result.append({'image_url': url, 'caption': row.get('caption', '').strip(), 'date': row.get('date', '').strip()})
    return result


def encode_thumbnail(raw):
    with Image.open(io.BytesIO(raw)) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        image.save(output, format='WEBP', quality=78, method=4)
        return output.getvalue(), image.width, image.height


def sync(root=ROOT, fetch=download):
    root = Path(root)
    rows = published_rows(fetch(SHEET_URL))
    directory = root / 'images/gallery-thumbnails'
    directory.mkdir(parents=True, exist_ok=True)

    def prepare(row):
        digest = hashlib.sha256(row['image_url'].encode()).hexdigest()[:24]
        relative = f'images/gallery-thumbnails/{digest}.webp'
        path = root / relative
        if path.exists():
            with Image.open(path) as image:
                width, height = image.size
        else:
            data, width, height = encode_thumbnail(fetch(row['image_url']))
            temporary = path.with_suffix('.tmp')
            temporary.write_bytes(data)
            os.replace(temporary, path)
        return {**row, 'thumbnail_url': relative, 'width': width, 'height': height, 'thumbnail_bytes': path.stat().st_size}

    # Abort a failed build rather than publish a partial photo list.
    with ThreadPoolExecutor(max_workers=3) as pool:
        photos = list(pool.map(prepare, rows))
    if photos and all(photo['date'] for photo in photos):
        photos.sort(key=lambda photo: photo['date'], reverse=True)
    payload = {'generatedAt': datetime.now(timezone.utc).isoformat(), 'photos': photos}
    output = root / 'data/gallery.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    os.replace(temporary, output)
    print(json.dumps({'photos': len(photos), 'thumbnailBytes': sum(photo['thumbnail_bytes'] for photo in photos)}))
    return payload


if __name__ == '__main__':
    sync()
