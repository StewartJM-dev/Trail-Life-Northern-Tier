// Trail Life Northern Tier - Blog CMS powered by Google Sheets
// This file handles fetching and displaying blog posts from Google Sheets

// Configuration
const BLOG_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqINnO1dKed1eqWwjd-1rpqfUEGdBWiOI4S4F_pYzHl2q6hbHYawPp5bvv23PR14ipwXNMwr510sGn/pub?output=csv'
};

// Parse CSV data
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const posts = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle CSV parsing with quoted fields
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let char of lines[i]) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const post = {};
        headers.forEach((header, index) => {
            post[header] = values[index] || '';
        });

        // Only include published posts
        if (post.published && post.published.toLowerCase() === 'true') {
            posts.push(post);
        }
    }

    return posts;
}

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
        // Check if URL is configured
        if (BLOG_CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Please configure your Google Sheets URL in js/blog-cms.js');
        }

        const response = await fetch(BLOG_CONFIG.SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog posts from Google Sheets');
        }

        const csvText = await response.text();
        const posts = parseCSV(csvText);

        // Sort posts by date (newest first)
        posts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

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
