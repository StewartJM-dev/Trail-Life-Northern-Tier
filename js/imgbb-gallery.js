// Trail Life Northern Tier - Gallery powered by Google Sheets + ImgBB
// Super simple - just 2 columns: image_url, published

const GALLERY_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_X6dSEGVXlheOHOroGqZzK6bT6Y_v2RpkU30JPXdnRN9mz5q-7KN66WvTynC-bUbHbecsmOwDB3I/pub?output=csv'
};

let allPhotos = [];
let currentPhotoIndex = 0;

// Parse CSV data
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const photos = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
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

        const photo = {};
        headers.forEach((header, index) => {
            photo[header] = values[index] || '';
        });

        // Only include published photos with valid image URLs
        if (photo.published && photo.published.toLowerCase() === 'true' && photo.image_url) {
            photos.push(photo);
        }
    }

    return photos;
}

// Create photo HTML
function createPhotoHTML(photo, index) {
    const caption = photo.caption || '';
    
    return `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${photo.image_url}" alt="${caption}" loading="lazy">
            ${caption ? `<div class="gallery-item-caption">${caption}</div>` : ''}
        </div>
    `;
}

// Lightbox functions
function openLightbox(index) {
    currentPhotoIndex = index;
    const photo = allPhotos[index];
    
    document.getElementById('lightbox-img').src = photo.image_url;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = allPhotos.length - 1;
    } else if (currentPhotoIndex >= allPhotos.length) {
        currentPhotoIndex = 0;
    }
    
    openLightbox(currentPhotoIndex);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
    }
});

// Close on background click
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Load gallery from Google Sheets
async function loadGallery() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const galleryGrid = document.getElementById('gallery-grid');

    try {
        if (GALLERY_CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Please configure your Google Sheets URL in js/imgbb-gallery.js');
        }

        const response = await fetch(GALLERY_CONFIG.SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch gallery from Google Sheets');
        }

        const csvText = await response.text();
        allPhotos = parseCSV(csvText);

        // Sort by date if date column exists, otherwise keep sheet order
        if (allPhotos.length > 0 && allPhotos[0].date) {
            allPhotos.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
        }

        loadingEl.style.display = 'none';

        if (allPhotos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="no-photos">
                    <i class="fas fa-images"></i>
                    <h3>No photos yet</h3>
                    <p>Upload photos to ImgBB and add them to your Google Sheet to get started!</p>
                </div>
            `;
            return;
        }

        // Display all photos in grid
        galleryGrid.innerHTML = allPhotos.map((photo, index) => 
            createPhotoHTML(photo, index)
        ).join('');

    } catch (error) {
        console.error('Error loading gallery:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `
            <strong>Error loading gallery:</strong> ${error.message}
            <br><br>
            Please make sure:
            <ul style="margin-top: 10px; padding-left: 20px;">
                <li>Your Google Sheet is published to the web</li>
                <li>The CSV URL is correctly configured in js/imgbb-gallery.js</li>
                <li>Your sheet has the correct column headers (image_url, published)</li>
            </ul>
        `;
    }
}

// Load gallery when page loads
document.addEventListener('DOMContentLoaded', loadGallery);
