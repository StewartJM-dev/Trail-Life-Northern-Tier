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

    return `
        <div class="troop-card reveal">
            <h3>Troop ${troop.troop_number}</h3>
            ${meta}
            ${troop.description ? `<p class="troop-description">${troop.description}</p>` : ''}
            ${website}
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

        // List troops by troop number (PA-0490, PA-1201, ... NY-2911, ...),
        // ignoring the state prefix, so new troops land in order no matter
        // where they're added in troops.json.
        const troopNumber = t => parseInt(String(t.troop_number).replace(/\D/g, ''), 10) || 0;
        troops.sort((a, b) => troopNumber(a) - troopNumber(b));

        listContainer.innerHTML = troops.map(createTroopHTML).join('');
        if (window.observeReveal) window.observeReveal(listContainer);


    } catch (error) {
        console.error('Error loading troops:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `<strong>Error loading troops:</strong> ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', loadTroops);
