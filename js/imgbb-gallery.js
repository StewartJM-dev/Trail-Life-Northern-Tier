// Trail Life Northern Tier - Gallery powered by Google Sheets + ImgBB
// Super simple - just 2 columns: image_url, published
// CSV fetching/parsing lives in js/sheet-cms.js (loaded before this file).

const GALLERY_CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_X6dSEGVXlheOHOroGqZzK6bT6Y_v2RpkU30JPXdnRN9mz5q-7KN66WvTynC-bUbHbecsmOwDB3I/pub?output=csv'
};

let allPhotos = [];
let currentPhotoIndex = 0;

// Create photo HTML
function createPhotoHTML(photo, index) {
    const caption = photo.caption || '';
    
    return `
        <div class="gallery-item reveal" onclick="openLightbox(${index})">
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
        allPhotos = await SheetCMS.fetchPublishedRows(GALLERY_CONFIG.SHEET_URL, {
            extraFilter: photo => !!photo.image_url
        });

        // Sort by date if date column exists, otherwise keep sheet order
        if (allPhotos.length > 0 && allPhotos[0].date) {
            allPhotos = SheetCMS.sortByDateDesc(allPhotos);
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
        if (window.observeReveal) window.observeReveal(galleryGrid);

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
