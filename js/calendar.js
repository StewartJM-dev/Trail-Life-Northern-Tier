// Events come from a validated snapshot refreshed by GitHub Actions.
(() => {
    const ZONE = 'America/New_York';
    let snapshot, month, selected = new Set();
    const byId = id => document.getElementById(id);
    const todayKey = () => new Intl.DateTimeFormat('en-CA', {timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
    const dayKey = event => event.allDay ? event.start : new Intl.DateTimeFormat('en-CA', {timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(event.start));
    function node(tag, text, className) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    }
    function dateValue(event) {
        return new Date(event.allDay ? `${event.start}T12:00:00-04:00` : event.start);
    }
    function upcoming(event) {
        return event.allDay ? event.end > todayKey() : new Date(event.end) > new Date();
    }
    function timeLabel(event) {
        if (event.allDay) {
            const last = new Date(`${event.end}T12:00:00Z`);
            last.setUTCDate(last.getUTCDate() - 1);
            const finalDay = last.toISOString().slice(0, 10);
            return finalDay > event.start ? `All day, ${event.start} – ${finalDay}` : 'All day';
        }
        const format = new Intl.DateTimeFormat('en-US', {timeZone: ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short'});
        const begin = new Date(event.start), end = new Date(event.end);
        const dates = new Intl.DateTimeFormat('en-US', {timeZone: ZONE, month: 'short', day: 'numeric', year: 'numeric'});
        if (dates.format(begin) !== dates.format(end)) {
            return `${dates.format(begin)}, ${format.format(begin)} – ${dates.format(end)}, ${format.format(end)}`;
        }
        return `${format.format(begin)} – ${format.format(end)}`;
    }
    function eventCard(event) {
        const card = node('article', undefined, 'event-card');
        const date = dateValue(event);
        const stamp = node('div', undefined, 'event-date');
        stamp.append(node('span', date.toLocaleDateString('en-US', {timeZone: ZONE, month: 'short'}).toUpperCase(), 'event-month'),
            node('span', date.toLocaleDateString('en-US', {timeZone: ZONE, day: 'numeric'}), 'event-day'));
        const info = node('div', undefined, 'event-info');
        info.append(node('h3', event.title), node('p', date.toLocaleDateString('en-US', {timeZone: ZONE, dateStyle: 'medium'})), node('p', timeLabel(event)));
        if (event.location) info.append(node('p', event.location));
        if (event.description) {
            const details = node('details');
            details.append(node('summary', 'Event details'), node('p', event.description, 'event-description'));
            info.append(details);
        }
        const source = node('span', event.sourceName, 'event-source');
        source.style.backgroundColor = event.color;
        info.append(source);
        card.append(stamp, info);
        return card;
    }
    function fillList(id, events, empty) {
        const container = byId(id);
        if (!container) return;
        container.replaceChildren(...(events.length ? events.map(eventCard) : [node('p', empty, 'calendar-message')]));
    }
    function updateRegionalControls() {
        const rail = byId('upcoming-events-list');
        if (!rail || !byId('regional-events-prev')) return;
        byId('regional-events-prev').disabled = rail.scrollLeft <= 1;
        byId('regional-events-next').disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    }
    function setupRegionalRail() {
        const rail = byId('upcoming-events-list');
        if (!rail || !byId('regional-events-prev')) return;
        for (const [id, direction] of [['regional-events-prev', -1], ['regional-events-next', 1]]) {
            byId(id).addEventListener('click', () => {
                const card = rail.querySelector('article');
                const step = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth;
                rail.scrollBy({left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
            });
        }
        rail.addEventListener('scroll', updateRegionalControls, {passive: true});
        const observer = new ResizeObserver(updateRegionalControls); observer.observe(rail);
    }
    function filtered() {
        return snapshot.events.filter(event => selected.has(event.source));
    }
    function render() {
        const events = filtered();
        const cutoff = new Date(Date.now() + 90 * 86400000);
        const regional = events.filter(event => ['area', 'region'].includes(event.source) && upcoming(event) && dateValue(event) <= cutoff)
            .sort((a, b) => dateValue(a) - dateValue(b)).slice(0, 6);
        fillList('upcoming-events-list', regional, 'No area or regional events in the next 90 days for the selected calendars. Browse the full calendar for later dates.');
        updateRegionalControls();
        if (!byId('calendar')) return;
        const year = month.getUTCFullYear(), index = month.getUTCMonth();
        byId('calendar-month').textContent = month.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'});
        const table = node('table', undefined, 'calendar-grid');
        table.setAttribute('aria-label', byId('calendar-month').textContent);
        const head = node('thead'), headings = node('tr');
        for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
            const th = node('th', day); th.scope = 'col'; headings.append(th);
        }
        head.append(headings); table.append(head);
        const body = node('tbody');
        const first = new Date(Date.UTC(year, index, 1)).getUTCDay();
        const total = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
        let row;
        for (let cell = 0; cell < Math.ceil((first + total) / 7) * 7; cell++) {
            if (cell % 7 === 0) { row = node('tr'); body.append(row); }
            const td = node('td'); row.append(td);
            const day = cell - first + 1;
            if (day < 1 || day > total) continue;
            const key = `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            td.append(node('div', String(day), 'calendar-day'));
            if (key === todayKey()) td.classList.add('calendar-today');
            for (const event of events.filter(event => {
                if (event.allDay) return event.start <= key && event.end > key;
                const last = dayKey({...event, start: new Date(new Date(event.end).getTime() - 1).toISOString()});
                return dayKey(event) <= key && last >= key;
            })) {
                const button = node('button', event.title, 'calendar-event');
                button.type = 'button'; button.style.borderLeftColor = event.color;
                button.setAttribute('aria-label', `${event.title}, ${key}, ${timeLabel(event)}`);
                button.addEventListener('click', () => showDetails(event));
                td.append(button);
            }
        }
        table.append(body); byId('calendar').replaceChildren(table);
    }
    function showDetails(event) {
        const dialog = byId('event-dialog');
        const body = byId('event-dialog-body');
        body.replaceChildren(node('h2', event.title), node('p', dateValue(event).toLocaleDateString('en-US', {timeZone: ZONE, dateStyle: 'full'})), node('p', timeLabel(event)));
        if (event.location) body.append(node('p', event.location));
        if (event.description) body.append(node('p', event.description, 'event-description'));
        body.append(node('p', event.sourceName));
        dialog.showModal();
    }
    async function load() {
        if (!byId('home-events-list') && !byId('upcoming-events-list')) return;
        try {
            const response = await fetch('data/events.json', {cache: 'no-store'});
            if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
            snapshot = await response.json();
            if (!Array.isArray(snapshot.events) || !Array.isArray(snapshot.sources)) throw new Error('Invalid calendar snapshot');
            selected = new Set(snapshot.sources.map(source => source.id));
            const today = todayKey();
            month = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
            const status = byId('calendar-status');
            if (status) {
                const updated = new Date(snapshot.generatedAt);
                const old = Date.now() - updated.getTime() > 24 * 60 * 60 * 1000;
                status.textContent = `${old ? 'Calendar refresh is delayed. Last update: ' : 'Updated: '}${updated.toLocaleString('en-US', {timeZone: ZONE})} Eastern. All event times are Eastern.`;
            }
            if (byId('calendar-filters')) {
                for (const source of snapshot.sources) {
                    const label = node('label', undefined, 'calendar-filter');
                    const input = node('input'); input.type = 'checkbox'; input.checked = true;
                    input.addEventListener('change', () => {
                        input.checked ? selected.add(source.id) : selected.delete(source.id); render();
                    });
                    const swatch = node('span', undefined, 'legend-color'); swatch.style.backgroundColor = source.color;
                    label.append(input, swatch, node('span', source.name)); byId('calendar-filters').append(label);
                }
                for (const [id, offset] of [['calendar-prev', -1], ['calendar-next', 1]]) {
                    byId(id).addEventListener('click', () => {
                        const next = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + offset, 1));
                        if (next.toISOString().slice(0, 10) < snapshot.windowStart || next.toISOString().slice(0, 10) > snapshot.windowEnd) return;
                        month = next; render();
                    });
                }
                byId('calendar-today').addEventListener('click', () => { month = new Date(`${todayKey().slice(0, 7)}-01T00:00:00Z`); render(); });
                byId('event-dialog-close').addEventListener('click', () => byId('event-dialog').close());
            }
            const cutoff = new Date(Date.now() + 30 * 86400000);
            fillList('home-events-list', snapshot.events.filter(event => upcoming(event) && dateValue(event) <= cutoff).slice(0, 3), 'No events in the next 30 days. See the Events page for later dates.');
            setupRegionalRail();
            render();
        } catch (error) {
            console.error(error);
            for (const id of ['home-events-list', 'upcoming-events-list', 'calendar']) {
                const container = byId(id);
                if (container) container.replaceChildren(node('p', 'The calendar is temporarily unavailable. Please try again later.', 'calendar-message'));
            }
        }
    }
    document.addEventListener('DOMContentLoaded', load);
})();
