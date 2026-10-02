// Trail Life Northern Tier - home page "Latest from the Trail"
// Shows the newest published post from the same Google Sheet the Blog page
// uses (js/blog-cms.js). The post already written into index.html stays as
// the fallback if the sheet can't be reached or has no published posts.
// CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

const HOME_BLOG_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqINnO1dKed1eqWwjd-1rpqfUEGdBWiOI4S4F_pYzHl2q6hbHYawPp5bvv23PR14ipwXNMwr510sGn/pub?output=csv',
    EXCERPT_LENGTH: 260
};

function homeBlogText(html) {
    const scratch = document.createElement('div');
    scratch.innerHTML = html || '';
    return (scratch.textContent || '').replace(/\s+/g, ' ').trim();
}

function homeBlogDate(value) {
    // "2026-09-15" would otherwise be read as midnight UTC, which is the
    // evening before in Eastern time; read it as a local calendar date.
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
    const date = iso ? new Date(+iso[1], iso[2] - 1, +iso[3]) : new Date(value);
    if (!value || isNaN(date.getTime())) return value || '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadHomeBlog() {
    const card = document.getElementById('home-latest-post');
    if (!card || typeof SheetCMS === 'undefined') return;

    try {
        const posts = SheetCMS.sortByDateDesc(await SheetCMS.fetchPublishedRows(HOME_BLOG_CONFIG.SHEET_URL));
        const post = posts.find(p => p.title);
        if (!post) return;

        let summary = homeBlogText(post.excerpt) || homeBlogText(post.content);
        if (summary.length > HOME_BLOG_CONFIG.EXCERPT_LENGTH) {
            summary = summary.slice(0, HOME_BLOG_CONFIG.EXCERPT_LENGTH).replace(/\s+\S*$/, '') + '…';
        }

        card.querySelector('.home-post-title').textContent = post.title;
        card.querySelector('.home-post-date-text').textContent = homeBlogDate(post.date);
        if (summary) card.querySelector('.home-post-summary').textContent = summary;

        if (post.image) {
            const img = card.querySelector('.home-post-image');
            const fallback = img.getAttribute('src');
            img.addEventListener('error', () => { img.src = fallback; }, { once: true });
            img.src = post.image;
            img.alt = post.title;
        }
    } catch (error) {
        // Keep the built-in post; the Blog page shows the detailed error.
        console.error('Error loading latest blog post:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHomeBlog);
