// Trail Life Northern Tier - Flickr Gallery Auto-Loader
// Automatically displays all public photos from Flickr account

const FLICKR_CONFIG = {
    USER_ID: '203769753@N07', // Your Flickr user ID
    PER_PAGE: 100, // Number of photos to load
    API_KEY: 'e36784df8a03fbd9c9e9b94b799a8d62' // Public API key for demo purposes
};

let allPhotos = [];
let currentPhotoIndex = 0;

// Build Flickr photo URL
function getPhotoURL(photo, size = 'z') {
    // Size options: s=small, m=medium, z=medium 640, b=large, h=large 1600
    return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${size}.jpg`;
}

// Create photo HTML
function createPhotoHTML(photo, index) {
    const thumbURL = getPhotoURL(photo, 'z'); // Medium 640px for display
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
    const largeURL = getPhotoURL(photo, 'b'); // Large size for lightbox
    
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

// Fetch photos from Flickr
async function loadFlickrPhotos() {
    const loadingEl = document.getElementById('loading');
    const galleryGrid = document.getElementById('gallery-grid');

    try {
        // Use Flickr's public API to get photos
        const apiURL = `https://www.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${FLICKR_CONFIG.API_KEY}&user_id=${FLICKR_CONFIG.USER_ID}&per_page=${FLICKR_CONFIG.PER_PAGE}&format=json&nojsoncallback=1`;
        
        const response = await fetch(apiURL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch photos from Flickr');
        }

        const data = await response.json();
        
        if (data.stat !== 'ok') {
            throw new Error('Flickr API error: ' + (data.message || 'Unknown error'));
        }

        allPhotos = data.photos.photo;

        loadingEl.style.display = 'none';

        if (allPhotos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="no-photos">
                    <i class="fas fa-images"></i>
                    <h3>No photos yet</h3>
                    <p>Upload photos to your Flickr account to see them here!</p>
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
                <p style="margin-top: 15px;">Make sure your Flickr photos are set to "Public".</p>
            </div>
        `;
    }
}

// Load photos when page loads
document.addEventListener('DOMContentLoaded', loadFlickrPhotos);
