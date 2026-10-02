// Scenic hero: staged downloads, optional rotation, and explicit manual controls.
(() => {
    const hero = document.querySelector('.hero--rotating');
    if (!hero) return;
    const month = Number(new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: 'America/New_York' }).format(new Date()));
    if (month >= 9 && month <= 11) {
        const seasonal = hero.querySelector('[data-autumn-src]');
        if (seasonal) {
            seasonal.dataset.sceneSrc = seasonal.dataset.autumnSrc;
            seasonal.dataset.sceneSrcset = seasonal.dataset.autumnSrcset;
            document.body.dataset.season = 'autumn';
            hero.querySelector('.hero-eyebrow').textContent = 'Trail Life USA · Autumn on the trail';
            hero.querySelector('[data-scene="1"]').setAttribute('aria-label', 'Show autumn forest trail');
        }
    }
    const scenes = [...hero.querySelectorAll('.hero-scene')];
    const controls = hero.querySelector('.hero-scene-controls');
    const dots = [...hero.querySelectorAll('[data-scene]')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, request = 0, timer;
    let stopped = reduced.matches || Boolean(navigator.connection?.saveData);

    function schedule() {
        clearTimeout(timer);
        if (!stopped && !document.hidden) {
            timer = setTimeout(() => show((active + 1) % scenes.length), 4000);
        }
    }

    async function show(index) {
        clearTimeout(timer);
        const currentRequest = ++request;
        const image = scenes[index];
        if (!image.src) {
            image.srcset = image.dataset.sceneSrcset;
            image.src = image.dataset.sceneSrc;
        }
        try {
            await image.decode();
            if (currentRequest !== request) return;
            scenes[active].classList.remove('is-active');
            image.classList.add('is-active');
            active = index;
            dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
        } catch (error) {
            // Keep the current scenery visible if the next image is unavailable.
        }
        if (currentRequest === request) schedule();
    }

    dots.forEach(dot => dot.addEventListener('click', () => {
        show(Number(dot.dataset.scene));
    }));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => {
        if (reduced.matches) stopped = true;
        schedule();
    });
    controls.hidden = false;
    schedule();
})();
