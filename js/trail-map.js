// Trail Life Northern Tier - "Your Trail Map" on new-to-trail-life.html.
// Draws winding dashed trails through the numbered stop dots. The dots are
// laid out by CSS (alternating sides), and this measures where they actually
// landed so the trail stays connected however the text wraps.
(function () {
    const map = document.getElementById('trail-map');
    if (!map) return;
    const svg = map.querySelector('.trail-lines');
    const NS = 'http://www.w3.org/2000/svg';

    function centerOf(el, box) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    }

    // Smooth S-curves between consecutive points (vertical tangents).
    function pathThrough(points) {
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1], b = points[i], dy = (b.y - a.y) / 2;
            d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
        }
        return d;
    }

    function draw() {
        const box = map.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
        svg.replaceChildren();
        const you = centerOf(map.querySelector('.trail-you-dot'), box);
        const routes = [...map.querySelectorAll('.trail-route')];
        const sideBySide = routes.length > 1 &&
            Math.abs(routes[0].getBoundingClientRect().top - routes[1].getBoundingClientRect().top) < 5;

        routes.forEach((route, i) => {
            const marker = centerOf(route.querySelector('.trail-route-marker'), box);
            const dots = [...route.querySelectorAll('.trail-dot')].map(d => centerOf(d, box));
            // Side by side, both trails branch from "You are here"; stacked
            // (phones), the second trail starts at its own sign.
            const points = (i === 0 || sideBySide) ? [you, marker, ...dots] : [marker, ...dots];
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', pathThrough(points));
            if (route.classList.contains('trail-route--start')) path.classList.add('trail-path--start');
            svg.append(path);
        });
    }

    let frame = null;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(map);
    window.addEventListener('load', schedule);
    document.fonts && document.fonts.ready.then(schedule);
    schedule();
})();
