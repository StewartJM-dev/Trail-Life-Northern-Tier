"""Regenerate the shared nav bar and footer across every public page.

The nav and footer used to be hand-typed into all 11 pages. That's how
index.html quietly lost its "About" link, how a leftover empty "Stay
Updated" heading survived in events.html, and why the registered-trademark
line only showed up on 4 of 11 footers. This script makes the nav/footer
markup here the single source of truth and stamps it into every page, so
drift like that can't happen again.

Usage:
    python scripts/build_pages.py            # check for drift, exit 1 if any
    python scripts/build_pages.py --write    # rewrite the files in place
    python scripts/build_pages.py --write --root _site   # target a build dir

The GitHub Actions deploy workflow runs this with --root _site right before
publishing, so the live site is always built from this one definition.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (label, href) in the order they should appear. Pages not in this list
# (admin-dashboard.html, admin-login.html) keep their own nav/footer and are
# left untouched by this script.
NAV_ITEMS = [
    ("Home", "index.html"),
    ("About", "about.html"),
    ("Blog", "blog.html"),
    ("Resources", "resources.html"),
    ("Events", "events.html"),
    ("Gallery", "gallery.html"),
    ("Troops", "troops.html"),
    ("Spotlight", "spotlight.html"),
    ("Area Team", "leaders.html"),
    ("Achievements", "achievements.html"),
    ("Contact", "contact.html"),
]

FOOTER_QUICK_LINKS = [
    ("Area Blog", "blog.html"),
    ("Resources", "resources.html"),
    ("Events", "events.html"),
    ("Our Troops", "troops.html"),
]

FOOTER_CONNECT_LINKS = [
    ("Area Team", "leaders.html"),
    ("Contact Us", "contact.html"),
    ("Trail Life USA", "https://www.traillifeusa.com"),
    ("TL Connect", "https://www.traillifeconnect.com"),
]

TEMPLATED_PAGES = [href for _, href in NAV_ITEMS]

NAV_RE = re.compile(r'    <nav class="navbar">.*?</nav>\n', re.DOTALL)
FOOTER_RE = re.compile(r'    <footer class="footer">.*?</footer>\n', re.DOTALL)


def render_nav(current_page):
    items = []
    for label, href in NAV_ITEMS:
        active = ' class="active"' if href == current_page else ''
        items.append(f'                <li><a href="{href}"{active}>{label}</a></li>')
    items_html = '\n'.join(items)
    return f'''    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <img src="images/TL_ClassicLogo_1_RGB.png" alt="Trail Life USA Logo">
                <span class="nav-title">Northern Tier</span>
            </div>
            <button class="nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu">
{items_html}
            </ul>
        </div>
    </nav>
'''


def render_footer(current_page):
    quick_link_lines = []
    for label, href in FOOTER_QUICK_LINKS:
        active = ' class="active"' if href == current_page else ''
        quick_link_lines.append(f'                        <li><a href="{href}"{active}>{label}</a></li>')
    quick_links = '\n'.join(quick_link_lines)
    connect_links = []
    for label, href in FOOTER_CONNECT_LINKS:
        external = href.startswith('http')
        active = ' class="active"' if href == current_page else ''
        target = ' target="_blank"' if external else ''
        connect_links.append(f'                        <li><a href="{href}"{active}{target}>{label}</a></li>')
    connect_links_html = '\n'.join(connect_links)
    return f'''    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <img src="images/TL_ClassicLogo_1_RGB.png" alt="Trail Life USA" class="footer-logo">
                    <p>Trail Life USA Northern Tier</p>
                    <p class="footer-tagline">Adventure > Character > Leadership</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
{quick_links}
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <ul>
{connect_links_html}
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Trail Life USA Northern Tier. All rights reserved.</p>
                <p>Trail Life USA is a registered trademark.</p>
            </div>
        </div>
    </footer>
'''


def build(root, write):
    changed = []
    missing = []
    for page in TEMPLATED_PAGES:
        path = root / page
        if not path.exists():
            missing.append(page)
            continue
        text = path.read_text(encoding='utf-8')
        new_text = text
        new_text, nav_subs = NAV_RE.subn(render_nav(page), new_text, count=1)
        new_text, footer_subs = FOOTER_RE.subn(render_footer(page), new_text, count=1)
        if nav_subs == 0:
            print(f'WARNING: no <nav class="navbar"> block found in {page}', file=sys.stderr)
        if footer_subs == 0:
            print(f'WARNING: no <footer class="footer"> block found in {page}', file=sys.stderr)
        if new_text != text:
            changed.append(page)
            if write:
                path.write_text(new_text, encoding='utf-8')
    return changed, missing


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--write', action='store_true', help='Rewrite files in place instead of just checking for drift.')
    parser.add_argument('--root', default=str(ROOT), help='Directory containing the HTML pages (default: repo root).')
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_absolute():
        root = ROOT / root
    changed, missing = build(root, args.write)

    if missing:
        print(f'Skipped (not found in {root}): {", ".join(missing)}')

    if args.write:
        print(f'Wrote canonical nav/footer into {len(changed)} page(s): {", ".join(changed) or "(none changed)"}')
        return 0

    if changed:
        print(f'Drift found in {len(changed)} page(s), run with --write to fix: {", ".join(changed)}')
        return 1

    print('All templated pages already match the canonical nav/footer.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
