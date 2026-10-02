// Homepage terrain explorer; troop coordinates stay in data/troops.json.
(() => {
    const container = document.getElementById('region-map');
    const directory = document.getElementById('region-troops');
    if (!container || !directory) return;
    const toolbar = document.querySelector('.region-map-toolbar');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let map, popup, locationMarker, terrain = true;
    const selection = document.createElement('div');
    selection.className = 'region-selected';
    selection.hidden = true;
    selection.setAttribute('role', 'region');
    selection.setAttribute('aria-label', 'Selected troop details');
    toolbar.after(selection);

    function highlightPin(number) {
        container.querySelectorAll('.region-map-pin').forEach(pin => {
            const selected = pin.dataset.troopNumber === number;
            pin.classList.toggle('is-selected', selected);
            pin.setAttribute('aria-pressed', String(selected));
        });
    }

    function clearSelection() {
        if (popup) popup.remove();
        highlightPin(null);
        selection.hidden = true;
    }

    function fallback() {
        if (map) { map.remove(); map = undefined; }
        toolbar.hidden = true;
        container.replaceChildren();
        const message = document.createElement('p');
        message.className = 'region-map-fallback';
        message.textContent = 'The interactive map is unavailable. Explore the troop directory below.';
        container.append(message);
    }

    function popupContent(troop) {
        const card = document.createElement('div');
        card.className = 'region-selected-card';
        const heading = document.createElement('div');
        heading.className = 'region-preview-heading';
        const logo = document.createElement('img');
        logo.src = 'images/trail-life-block-logo.png';
        logo.alt = '';
        logo.width = 70;
        logo.height = 80;
        const identity = document.createElement('div');
        const eyebrow = document.createElement('span');
        eyebrow.className = 'region-preview-eyebrow';
        eyebrow.textContent = 'Northern Tier · Trail Life USA';
        const title = document.createElement('h3');
        title.textContent = 'Troop ' + troop.troop_number;
        const location = document.createElement('p');
        location.textContent = troop.location;
        const link = document.createElement('a');
        const hasWebsite = typeof troop.website === 'string' && /^https?:\/\//.test(troop.website);
        link.href = hasWebsite ? troop.website : 'troops.html';
        if (hasWebsite) { link.target = '_blank'; link.rel = 'noopener'; }
        link.className = 'region-preview-primary';
        link.textContent = hasWebsite ? 'Visit troop website ↗' : 'Troop details →';
        identity.append(eyebrow, title, location);
        heading.append(logo, identity);
        card.append(heading);
        const facts = document.createElement('dl');
        facts.className = 'region-preview-facts';
        [['Hosted by', troop.sponsor], ['Meeting address', troop.address],
            ['Meetings', troop.meetings || 'Contact the troop for current meeting times.']].forEach(([label, value]) => {
            if (!value) return;
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const detail = document.createElement('dd');
            term.textContent = label;
            detail.textContent = value;
            row.append(term, detail);
            facts.append(row);
        });
        card.append(facts);
        const actions = document.createElement('div');
        actions.className = 'region-preview-actions';
        actions.append(link);
        const streetView = document.createElement('a');
        const viewpoint = new URLSearchParams({ api: '1', map_action: 'pano', viewpoint: troop.lat + ',' + troop.lng });
        streetView.href = 'https://www.google.com/maps/@?' + viewpoint.toString();
        streetView.target = '_blank';
        streetView.rel = 'noopener noreferrer';
        streetView.textContent = 'Google Street View ↗';
        actions.append(streetView);
        const directions = document.createElement('a');
        directions.href = 'https://www.google.com/maps/dir/?' + new URLSearchParams({ api: '1', destination: troop.address || troop.lat + ',' + troop.lng });
        directions.target = '_blank';
        directions.rel = 'noopener noreferrer';
        directions.textContent = 'Get directions ↗';
        actions.append(directions);
        card.append(actions);
        const note = document.createElement('p');
        note.className = 'region-preview-note';
        note.textContent = 'Street View opens nearby imagery where available. Confirm meeting details with the troop before visiting.';
        card.append(note);
        return card;
    }

    function select(troop) {
        if (!map) return;
        if (popup) popup.remove();
        highlightPin(troop.troop_number);
        // The regional DEM is too coarse for a tilted street-scale camera.
        // Use a centered overhead view for troop detail, then restore terrain on overview.
        map.stop();
        map.setTerrain(null);
        map.flyTo({ center: [troop.lng, troop.lat], zoom: 16.5, pitch: 0,
            bearing: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 }, duration: reduced.matches ? 0 : 1400 });
        selection.replaceChildren();
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'region-selection-close';
        close.textContent = 'Close details ×';
        close.addEventListener('click', clearSelection);
        selection.append(close, popupContent(troop));
        selection.hidden = false;
        const label = document.createElement('div');
        label.className = 'region-map-popup';
        label.textContent = 'Troop ' + troop.troop_number;
        popup = new maplibregl.Popup({ offset: 26, closeOnClick: false, closeButton: false,
            focusAfterOpen: false, maxWidth: '160px' }).setLngLat([troop.lng, troop.lat])
            .setDOMContent(label).addTo(map);
        selection.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }

    async function initialize(troops) {
        try {
            if (!window.maplibregl) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.append(script);
                });
            }
            container.replaceChildren();
            map = new maplibregl.Map({ container, style: {
                    version: 8,
                    sources: {
                        imagery: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256,
                            maxzoom: 19, attribution: 'Imagery: Esri, Maxar, Earthstar Geographics, and the GIS User Community' },
                        'regional-terrain': { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
                            tileSize: 256, encoding: 'terrarium', maxzoom: 14, attribution: 'Elevation: Mapzen / AWS Open Data' }
                    },
                    layers: [{ id: 'imagery', type: 'raster', source: 'imagery' }]
                },
                center: [-77, 41.7], zoom: 7, pitch: 48, bearing: -12, maxPitch: 70,
                cooperativeGestures: true, attributionControl: true });
            map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
            const bounds = new maplibregl.LngLatBounds();
            troops.forEach(troop => {
                bounds.extend([troop.lng, troop.lat]);
                const pin = document.createElement('button');
                pin.className = 'region-map-pin';
                pin.type = 'button';
                pin.dataset.troopNumber = troop.troop_number;
                pin.setAttribute('aria-pressed', 'false');
                pin.setAttribute('aria-label', 'Explore troop ' + troop.troop_number + ', ' + troop.location);
                // A pin tap must not become a map tap that closes its new popup.
                pin.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    select(troop);
                });
                pin.addEventListener('mousedown', event => event.stopPropagation());
                pin.addEventListener('touchstart', event => event.stopPropagation(), { passive: true });
                new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([troop.lng, troop.lat]).addTo(map);
            });
            const overview = () => {
                clearSelection();
                if (map.isStyleLoaded()) map.setTerrain(terrain ? { source: 'regional-terrain', exaggeration: 1.4 } : null);
                map.fitBounds(bounds, { padding: 55, pitch: terrain ? 48 : 0,
                    bearing: terrain ? -12 : 0, duration: reduced.matches ? 0 : 800 });
            };
            overview();
            const timeout = setTimeout(fallback, 20000);
            map.once('load', () => {
                clearTimeout(timeout);
                map.setTerrain({ source: 'regional-terrain', exaggeration: 1.4 });
                toolbar.hidden = false;
                window.NorthernTierMap = {
                    showTroop: select,
                    showLocation(point, nearest) {
                        clearSelection();
                        map.setTerrain(terrain ? { source: 'regional-terrain', exaggeration: 1.4 } : null);
                        if (locationMarker) locationMarker.remove();
                        const dot = document.createElement('div');
                        dot.className = 'region-search-location';
                        dot.setAttribute('role', 'img');
                        dot.setAttribute('aria-label', 'Your searched location');
                        locationMarker = new maplibregl.Marker({ element: dot }).setLngLat([point.lng, point.lat]).addTo(map);
                        const nearby = new maplibregl.LngLatBounds([point.lng, point.lat], [point.lng, point.lat]);
                        nearest.forEach(troop => nearby.extend([troop.lng, troop.lat]));
                        map.fitBounds(nearby, { padding: 55, maxZoom: 12, pitch: terrain ? 48 : 0,
                            bearing: terrain ? -12 : 0, duration: reduced.matches ? 0 : 1000 });
                    },
                    clearSearch() { if (locationMarker) locationMarker.remove(); overview(); }
                };
                window.dispatchEvent(new Event('region-map-ready'));
            });
            map.on('error', event => {
                if (map && !event.sourceId && !map.isStyleLoaded()) { clearTimeout(timeout); fallback(); }
            });
            document.getElementById('region-reset').addEventListener('click', overview);
            document.getElementById('region-view').addEventListener('click', event => {
                terrain = !terrain;
                map.setTerrain(terrain ? { source: 'regional-terrain', exaggeration: 1.4 } : null);
                overview();
                event.currentTarget.setAttribute('aria-pressed', String(terrain));
                event.currentTarget.textContent = terrain ? '3D terrain' : 'Flat map';
            });
        } catch (error) { fallback(); }
    }

    fetch('data/troops.json').then(response => {
        if (!response.ok) throw new Error('Troop directory unavailable');
        return response.json();
    }).then(rows => {
        const troops = rows.filter(t => Number.isFinite(t.lat) && Number.isFinite(t.lng));
        directory.replaceChildren();
        troops.forEach(troop => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'region-troop';
            link.href = 'troops.html';
            const number = document.createElement('strong');
            number.textContent = troop.troop_number;
            const location = document.createElement('span');
            location.textContent = troop.location;
            link.append(number, location);
            link.addEventListener('click', event => { if (map) { event.preventDefault(); select(troop); } });
            item.append(link);
            directory.append(item);
        });
        if (!troops.length) { fallback(); return; }
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); initialize(troops); }
            }, { rootMargin: '200px' });
            observer.observe(container);
        } else initialize(troops);
    }).catch(fallback);
})();
