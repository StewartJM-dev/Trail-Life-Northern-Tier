// Trail Life Northern Tier - Troops list, loaded from data/troops.json
//
// Troops used to be hand-written inline-styled HTML directly in troops.html,
// which is exactly why the PA-4031 entry quietly ended up missing fields
// (sponsor, address, website) that the other two troops had - there was
// nothing enforcing a consistent shape. Adding a troop now means adding an
// object to data/troops.json, not hand-writing HTML.

const TROOPS_CONFIG = {
    DATA_URL: 'data/troops.json'
};

function troopMetaLine(icon, label, value) {
    if (!value) return '';
    return `<p class="troop-meta"><i class="fas ${icon}"></i><strong>${label}:</strong> ${value}</p>`;
}

function createTroopHTML(troop) {
    const meta = [
        troopMetaLine('fa-map-marker-alt', 'Location', troop.location),
        troopMetaLine('fa-church', 'Sponsor', troop.sponsor),
        troopMetaLine('fa-map-pin', 'Address', troop.address),
        troopMetaLine('fa-calendar-alt', 'Chartered', troop.chartered),
        troopMetaLine('fa-clock', 'Meetings', troop.meetings),
    ].join('');

    const website = troop.website
        ? `<a href="${troop.website}" target="_blank" class="btn btn-primary">Visit Website</a>`
        : '';

    // Troops with an "id" have a registered events feed (see data/troop-feeds.json);
    // js/troop-events.js fills this placeholder in once the cards below exist.
    const eventsPlaceholder = troop.id
        ? `<div id="troop-events-${troop.id}" class="troop-events" data-troop-events="${troop.id}" aria-live="polite"><h2>Upcoming Events — Troop ${troop.troop_number}</h2><p>Loading upcoming events…</p></div>`
        : '';

    return `
        <div class="troop-card">
            <h3>Troop ${troop.troop_number}</h3>
            ${meta}
            ${troop.description ? `<p class="troop-description">${troop.description}</p>` : ''}
            ${website}
            ${eventsPlaceholder}
        </div>
    `;
}

async function loadTroops() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const listContainer = document.getElementById('troops-list');

    try {
        const response = await fetch(TROOPS_CONFIG.DATA_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load troops (HTTP ${response.status})`);
        }

        const troops = await response.json();
        if (!Array.isArray(troops)) {
            throw new Error('troops.json is not a list of troops');
        }

        loadingEl.style.display = 'none';

        if (troops.length === 0) {
            listContainer.innerHTML = '<p class="loading">No troops listed yet.</p>';
            return;
        }

        listContainer.innerHTML = troops.map(createTroopHTML).join('');

        // The event placeholders above were just inserted, so (re)run the
        // troop-events loader now that there's something for it to find.
        if (window.renderTroopEvents) window.renderTroopEvents();

    } catch (error) {
        console.error('Error loading troops:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `<strong>Error loading troops:</strong> ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', loadTroops);
