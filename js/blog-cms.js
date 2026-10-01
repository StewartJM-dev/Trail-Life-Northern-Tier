// Trail Life Northern Tier - Blog CMS powered by Google Sheets
// This file handles fetching and displaying blog posts from Google Sheets.
// CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

// Configuration
const BLOG_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqINnO1dKed1eqWwjd-1rpqfUEGdBWiOI4S4F_pYzHl2q6hbHYawPp5bvv23PR14ipwXNMwr510sGn/pub?output=csv'
};

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Create post HTML
function createPostHTML(post) {
    const tags = post.tags ? post.tags.split(',').map(tag => 
        `<span class="blog-tag">${tag.trim()}</span>`
    ).join('') : '';

    // Use placeholder image if no image provided or if image path doesn't exist
    const imageUrl = post.image || 'images/placeholder-blog.jpg';

    return `
        <article class="blog-card">
            <div class="blog-card-image">
                <img src="${imageUrl}" alt="${post.title}" onerror="this.src='images/placeholder-blog.jpg'">
            </div>
            <div class="blog-card-content">
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
                    ${post.author ? `<span><i class="far fa-user"></i> ${post.author}</span>` : ''}
                </div>
                <h3>${post.title}</h3>
                ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
                <div class="content">${post.content}</div>
                ${tags ? `<div class="blog-tags">${tags}</div>` : ''}
            </div>
        </article>
    `;
}

// Load posts from Google Sheets
async function loadBlogPosts() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const postsContainer = document.getElementById('blog-posts');

    try {
        const posts = SheetCMS.sortByDateDesc(await SheetCMS.fetchPublishedRows(BLOG_CONFIG.SHEET_URL));

        loadingEl.style.display = 'none';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem; grid-column: 1/-1;">No blog posts yet. Add some posts to your Google Sheet to get started!</p>';
            return;
        }

        postsContainer.innerHTML = posts.map(createPostHTML).join('');

    } catch (error) {
        console.error('Error loading blog posts:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `
            <strong>Error loading blog posts:</strong> ${error.message}
            <br><br>
            Please make sure:
            <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Your Google Sheet is published to the web</li>
                <li>The CSV URL is correctly configured in js/blog-cms.js</li>
                <li>Your sheet has the correct column headers</li>
            </ul>
        `;
    }
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);
