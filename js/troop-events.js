/* Troop websites own their event content; Northern Tier imports selected adventures.
   Exposed as window.renderTroopEvents so a page that injects its
   [data-troop-events] hosts dynamically (see js/troops-cms.js) can call this
   again once those hosts actually exist in the DOM. */
async function renderTroopEvents() {
    const hosts = [...document.querySelectorAll('[data-troop-events]')];
    if (!hosts.length) return;
    const make = (tag, text, cls) => {
        const element = document.createElement(tag);
        if (text) element.textContent = text;
        if (cls) element.className = cls;
        return element;
    };
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
    const dateText = value => new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(new Date(value + 'T12:00:00'));
    try {
        const response = await fetch('data/troop-events.json', {cache: 'no-store'});
        if (!response.ok) throw new Error('Unable to load troop events');
        const snapshot = await response.json();
        for (const host of hosts) {
            const troop = snapshot.troops.find(t => t.id === host.dataset.troopEvents);
            if (!troop) throw new Error('Troop feed unavailable');
            const heading = make('h2', 'Upcoming Events — ' + troop.name);
            const grid = make('div', null, 'troop-events-grid');
            const events = troop.events.filter(e => e.endDate >= today);
            for (const event of events) {
                const card = make('article', null, 'troop-event-card');
                const url = new URL('events.html', troop.website);
                url.hash = 'ev-' + event.id;
                if (event.posterUrl) {
                    const link = make('a'); link.href = url.href;
                    const image = make('img'); image.src = event.posterUrl; image.alt = event.title + ' event poster'; image.loading = 'lazy';
                    image.addEventListener('error', () => link.remove(), {once: true});
                    link.append(image); card.append(link);
                }
                const body = make('div', null, 'troop-event-body');
                body.append(make('p', dateText(event.date) + (event.endDate !== event.date ? ' – ' + dateText(event.endDate) : ''), 'troop-event-date'));
                body.append(make('h3', event.title));
                if (event.tentative) body.append(make('span', 'Tentative', 'troop-event-badge'));
                if (event.startTime && event.startTime !== '00:00') body.append(make('p', event.startTime + (event.endTime ? '–' + event.endTime : '') + ' Eastern'));
                if (event.location) body.append(make('p', event.location, 'troop-event-location'));
                const details = make('a', 'Event details →'); details.href = url.href; body.append(details);
                card.append(body); grid.append(card);
            }
            host.replaceChildren(heading);
            host.append(events.length ? grid : make('p', 'No upcoming events are listed at this time.'));
            const source = make('a', 'From ' + troop.name + ' • Visit troop website'); source.href = troop.website; source.className = 'troop-event-source'; host.append(source);
        }
    } catch (error) {
        for (const host of hosts) {
            const message = host.querySelector('p');
            if (message) message.textContent = 'Upcoming events are temporarily unavailable. Visit the troop website for the latest details.';
        }
    }
}

window.renderTroopEvents = renderTroopEvents;

// Safety net for any [data-troop-events] host that's already in the static
// HTML by the time this script runs. A host injected later (dynamically
// rendered troop cards) calls window.renderTroopEvents() itself instead.
document.addEventListener('DOMContentLoaded', renderTroopEvents);
