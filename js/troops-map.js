// Trail Life Northern Tier - troop location map (Leaflet + OpenStreetMap,
// no API key needed). Reads the same data/troops.json that troops-cms.js
// uses to render the cards, so a troop only needs lat/lng added there to
// show up on the map too.

async function loadTroopMap() {
    const mapEl = document.getElementById('troop-map');
    if (!mapEl || typeof L === 'undefined') return;

    try {
        const response = await fetch('data/troops.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load troops');
        const troops = await response.json();
        const located = troops.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number');
        if (located.length === 0) {
            mapEl.style.display = 'none';
            return;
        }

        const map = L.map(mapEl, { scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);

        const markerIcon = L.divIcon({
            className: 'troop-map-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 28],
            popupAnchor: [0, -26],
        });

        const markers = located.map(troop => {
            const marker = L.marker([troop.lat, troop.lng], { icon: markerIcon }).addTo(map);
            const websiteLink = troop.website
                ? `<a href="${troop.website}" target="_blank" rel="noopener">Visit Website</a>`
                : '';
            marker.bindPopup(
                `<strong>Troop ${troop.troop_number}</strong><br>${troop.location || ''}${websiteLink ? '<br>' + websiteLink : ''}`
            );
            return marker;
        });

        if (markers.length === 1) {
            map.setView(markers[0].getLatLng(), 10);
        } else {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3));
        }
    } catch (error) {
        console.error('Error loading troop map:', error);
        mapEl.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadTroopMap);
