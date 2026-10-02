// Homepage terrain explorer; troop coordinates stay in data/troops.json.
(() => {
    const container = document.getElementById('region-map');
    const directory = document.getElementById('region-troops');
    if (!container || !directory) return;
    const toolbar = document.querySelector('.region-map-toolbar');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let map, popup, terrain = true;

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
        card.className = 'region-map-popup';
        const title = document.createElement('h3');
        title.textContent = 'Troop ' + troop.troop_number;
        const location = document.createElement('p');
        location.textContent = troop.location;
        const link = document.createElement('a');
        link.href = 'troops.html';
        link.textContent = 'Troop details →';
        card.append(title, location, link);
        return card;
    }

    function select(troop) {
        if (!map) return;
        if (popup) popup.remove();
        map.flyTo({ center: [troop.lng, troop.lat], zoom: 11, pitch: terrain ? 58 : 0,
            bearing: terrain ? -15 : 0, duration: reduced.matches ? 0 : 1400 });
        popup = new maplibregl.Popup({ offset: 26 }).setLngLat([troop.lng, troop.lat])
            .setDOMContent(popupContent(troop)).addTo(map);
        container.scrollIntoView({ behavior: 'auto', block: 'center' });
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
                pin.setAttribute('aria-label', 'Explore troop ' + troop.troop_number + ', ' + troop.location);
                pin.addEventListener('click', () => select(troop));
                new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([troop.lng, troop.lat]).addTo(map);
            });
            const overview = () => {
                if (popup) popup.remove();
                map.fitBounds(bounds, { padding: 55, pitch: terrain ? 48 : 0,
                    bearing: terrain ? -12 : 0, duration: reduced.matches ? 0 : 800 });
            };
            overview();
            const timeout = setTimeout(fallback, 20000);
            map.once('load', () => {
                clearTimeout(timeout);
                map.setTerrain({ source: 'regional-terrain', exaggeration: 1.4 });
                toolbar.hidden = false;
            });
            map.on('error', event => {
                if (map && !event.sourceId && !map.isStyleLoaded()) { clearTimeout(timeout); fallback(); }
            });
            document.getElementById('region-reset').addEventListener('click', overview);
            document.getElementById('region-view').addEventListener('click', event => {
                terrain = !terrain;
                map.setTerrain(terrain ? { source: 'regional-terrain', exaggeration: 1.4 } : null);
                map.easeTo({ pitch: terrain ? 48 : 0, bearing: terrain ? -12 : 0, duration: reduced.matches ? 0 : 600 });
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
