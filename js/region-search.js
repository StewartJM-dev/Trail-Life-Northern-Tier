// User-triggered, transient geosearch. Addresses and results are not saved.
(() => {
    const form = document.getElementById('region-search-form');
    if (!form) return;
    const input = document.getElementById('region-address');
    const status = document.getElementById('region-search-status');
    const list = document.getElementById('region-nearby');
    const submit = form.querySelector('[type="submit"]');
    const clear = document.getElementById('region-search-clear');
    let pending, serial = 0;

    function miles(a, b) {
        const rad = degrees => degrees * Math.PI / 180;
        const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return 3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
    }
    function plot() {
        if (pending && window.NorthernTierMap) window.NorthernTierMap.showLocation(pending.point, pending.nearest);
    }
    window.addEventListener('region-map-ready', plot);
    form.hidden = false;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const query = input.value.trim();
        if (query.length < 2 || submit.disabled) return;
        const request = ++serial;
        submit.disabled = true;
        submit.textContent = 'Searching…';
        status.textContent = 'Finding your location…';
        list.replaceChildren();
        pending = undefined;
        if (window.NorthernTierMap) window.NorthernTierMap.clearSearch();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
            const url = new URL('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates');
            url.search = new URLSearchParams({ SingleLine: query, f: 'json', maxLocations: '1',
                countryCode: 'USA', outSR: '4326', forStorage: 'false' }).toString();
            const [response, troopResponse] = await Promise.all([
                fetch(url, { signal: controller.signal, cache: 'no-store' }),
                fetch('data/troops.json', { signal: controller.signal })
            ]);
            if (!response.ok || !troopResponse.ok) throw new Error('Search unavailable');
            const [result, troops] = await Promise.all([response.json(), troopResponse.json()]);
            if (request !== serial) return;
            if (result.error) throw new Error('Search unavailable');
            const candidate = result.candidates?.[0];
            if (!candidate || candidate.score < 70 || !Number.isFinite(candidate.location?.x) || !Number.isFinite(candidate.location?.y)) {
                status.textContent = 'No location found. Try a town and state, ZIP code, or a more complete address.';
                return;
            }
            const point = { lng: candidate.location.x, lat: candidate.location.y };
            const nearest = troops.filter(t => Number.isFinite(t.lat) && Number.isFinite(t.lng))
                .map(t => ({ ...t, miles: miles(point, t) })).sort((a, b) => a.miles - b.miles).slice(0, 3);
            pending = { point, nearest };
            status.textContent = 'Found: ' + candidate.address + '. Nearest listed troops below; distances are approximate straight-line miles.';
            nearest.forEach(troop => {
                const item = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = troop.troop_number + ' · ' + troop.location + ' · ' + Math.round(troop.miles) + ' mi';
                button.addEventListener('click', () => {
                    if (window.NorthernTierMap) window.NorthernTierMap.showTroop(troop);
                    else window.location.href = 'troops.html';
                });
                item.append(button);
                list.append(item);
            });
            clear.hidden = false;
            plot();
            document.getElementById('region-map').scrollIntoView({ behavior: 'auto', block: 'nearest' });
        } catch (error) {
            if (request === serial) status.textContent = 'Address search is unavailable right now. Try again or explore the troop directory below.';
        } finally {
            clearTimeout(timeout);
            submit.disabled = false;
            submit.textContent = 'Search map';
        }
    });
    clear.addEventListener('click', () => {
        serial++;
        pending = undefined;
        input.value = '';
        list.replaceChildren();
        status.textContent = '';
        clear.hidden = true;
        if (window.NorthernTierMap) window.NorthernTierMap.clearSearch();
        input.focus();
    });
})();
