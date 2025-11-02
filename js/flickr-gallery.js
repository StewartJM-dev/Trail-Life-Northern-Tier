
// Trail Life Northern Tier - Flickr Gallery Auto-Loader
// Automatically displays all public photos from Flickr account using public feed

const FLICKR_CONFIG = {
    USER_ID: '203769753@N07' // Your Flickr user ID
};

let allPhotos = [];
let currentPhotoIndex = 0;

// Create photo HTML
function createPhotoHTML(photo, index) {
    const thumbURL = photo.media.m; // Medium size
    const largeURL = photo.media.m.replace('_m.jpg', '_b.jpg'); // Large size
    const title = photo.title || 'Untitled';
    
    return `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${thumbURL}" alt="${title}" loading="lazy">
            ${title !== 'Untitled' ? `<div class="gallery-item-caption">${title}</div>` : ''}
        </div>
    `;
}

// Lightbox functions
function openLightbox(index) {
    currentPhotoIndex = index;
    const photo = allPhotos[index];
    const largeURL = photo.media.m.replace('_m.jpg', '_b.jpg'); // Large size
    
    document.getElementById('lightbox-img').src = largeURL;
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

// Fetch photos from Flickr using public feed
async function loadFlickrPhotos() {
    const loadingEl = document.getElementById('loading');
    const galleryGrid = document.getElementById('gallery-grid');

    try {
        // Use Flickr's public feed (no API key required!)
        const feedURL = `https://www.flickr.com/photos/203769753@N07`;
        
        const response = await fetch(feedURL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch photos from Flickr');
        }

        const text = await response.text();
        
        // Flickr returns JSONP, we need to extract the JSON
        const jsonMatch = text.match(/jsonFlickrFeed\((.*)\)/);
        if (!jsonMatch) {
            throw new Error('Could not parse Flickr feed');
        }
        
        const data = JSON.parse(jsonMatch[1]);
        allPhotos = data.items;

        loadingEl.style.display = 'none';

        if (allPhotos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="no-photos">
                    <i class="fas fa-images"></i>
                    <h3>No photos yet</h3>
                    <p>Upload photos to your Flickr account to see them here!</p>
                    <p style="margin-top: 15px; font-size: 0.9rem;">Make sure your photos are set to <strong>Public</strong>.</p>
                </div>
            `;
            return;
        }

        // Display photos
        galleryGrid.innerHTML = allPhotos.map((photo, index) => 
            createPhotoHTML(photo, index)
        ).join('');

    } catch (error) {
        console.error('Error loading Flickr photos:', error);
        loadingEl.style.display = 'none';
        
        galleryGrid.innerHTML = `
            <div class="no-photos">
                <i class="fas fa-exclamation-triangle" style="color: var(--primary-red);"></i>
                <h3>Error Loading Photos</h3>
                <p>${error.message}</p>
                <p style="margin-top: 15px;">Make sure your Flickr photos are set to <strong>"Public"</strong>.</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">To make photos public: Click photo → Lock icon → Select "Public"</p>
            </div>
        `;
    }
}

// Load photos when page loads
document.addEventListener('DOMContentLoaded', loadFlickrPhotos);
