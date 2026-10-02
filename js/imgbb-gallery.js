// Thumbnails and the published photo list are built from the Google Sheet.
// Only an explicit lightbox open fetches the original ImgBB photograph.

const GALLERY_CONFIG = {
    SNAPSHOT_URL: 'data/gallery.json'
};

let allPhotos = [];
let currentPhotoIndex = 0;

// Create photo HTML
function createPhotoElement(photo, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open photo: ${photo.caption || 'Trail Life adventure'}`);
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox(index);
        }
    });
    const image = document.createElement('img');
    image.src = photo.thumbnail_url;
    image.alt = photo.caption || 'Trail Life adventure';
    image.width = photo.width;
    image.height = photo.height;
    image.loading = index < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
        const fallback = document.createElement('p');
        fallback.textContent = 'Preview unavailable. Tap to open the original photo.';
        fallback.style.padding = '24px';
        image.replaceWith(fallback);
    }, {once: true});
    item.append(image);
    if (photo.caption) {
        const caption = document.createElement('div');
        caption.className = 'gallery-item-caption';
        caption.textContent = photo.caption;
        item.append(caption);
    }
    return item;
}

// Lightbox functions
function openLightbox(index) {
    if (!allPhotos[index]) return;
    currentPhotoIndex = index;
    const photo = allPhotos[index];
    
    document.getElementById('lightbox-img').src = photo.image_url;
    document.getElementById('lightbox-img').alt = photo.caption || 'Trail Life adventure';
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    if (!allPhotos.length) return;
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
    } else if (e.key === 'ArrowLeft' && document.getElementById('lightbox').classList.contains('active')) {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight' && document.getElementById('lightbox').classList.contains('active')) {
        navigateLightbox(1);
    }
});

// Close on background click
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Load the same-origin gallery snapshot; new sheet photos sync every six hours.
async function loadGallery() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const galleryGrid = document.getElementById('gallery-grid');

    try {
        const response = await fetch(GALLERY_CONFIG.SNAPSHOT_URL, {cache: 'no-store'});
        if (!response.ok) throw new Error(`Gallery HTTP ${response.status}`);
        const snapshot = await response.json();
        if (!Array.isArray(snapshot.photos)) throw new Error('Invalid gallery snapshot');
        allPhotos = snapshot.photos;

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
        galleryGrid.replaceChildren(...allPhotos.map(createPhotoElement));

    } catch (error) {
        console.error('Error loading gallery:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = 'The gallery is temporarily unavailable. Please refresh or try again shortly.';
    }
}

// Load gallery when page loads
document.addEventListener('DOMContentLoaded', loadGallery);
