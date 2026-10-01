/* Upcoming adventures grouped by troop on the Events page. */
async function renderTroopEvents() {
    const sections = document.getElementById('troop-event-sections');
    if (!sections) return;
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
        sections.replaceChildren();
        for (const troop of snapshot.troops) {
            const host = make('div', null, 'troop-events');
            sections.append(host);
            const heading = make('h2', 'Upcoming Events — ' + troop.name);
            const grid = make('div', null, 'troop-events-grid');
            grid.id = 'events-' + troop.id;
            grid.tabIndex = 0;
            grid.setAttribute('role', 'region');
            grid.setAttribute('aria-label', troop.name + ' upcoming events');
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
            const header = make('div', null, 'troop-events-header');
            header.append(heading);
            const controls = make('div', null, 'troop-events-controls');
            const previous = make('button', '←');
            const next = make('button', '→');
            previous.type = next.type = 'button';
            previous.setAttribute('aria-label', 'Previous events for ' + troop.name);
            next.setAttribute('aria-label', 'Next events for ' + troop.name);
            previous.setAttribute('aria-controls', grid.id);
            next.setAttribute('aria-controls', grid.id);
            const update = () => {
                previous.disabled = grid.scrollLeft <= 1;
                next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
            };
            const move = direction => {
                const card = grid.querySelector('article');
                const step = card ? card.getBoundingClientRect().width + 24 : grid.clientWidth;
                grid.scrollBy({left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
            };
            previous.addEventListener('click', () => move(-1));
            next.addEventListener('click', () => move(1));
            grid.addEventListener('scroll', update, {passive: true});
            controls.append(previous, next);
            if (events.length > 1) header.append(controls);
            host.append(header);
            host.append(events.length ? grid : make('p', 'No upcoming events are listed at this time.'));
            const source = make('a', 'From ' + troop.name + ' • Visit troop website'); source.href = troop.website; source.className = 'troop-event-source'; host.append(source);
            requestAnimationFrame(update);
            const observer = new ResizeObserver(update); observer.observe(grid);
        }
    } catch (error) {
        sections.replaceChildren(make('p', 'Troop events are temporarily unavailable. Please visit the troop websites for the latest details.'));
    }
}

document.addEventListener('DOMContentLoaded', renderTroopEvents);
