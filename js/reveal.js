// Trail Life Northern Tier - subtle scroll-in reveal for cards and sections.
// Elements with class="reveal" fade/slide into view once, the first time
// they cross into the viewport. Respects prefers-reduced-motion.
//
// Most cards on this site are rendered after a fetch() (blog posts,
// achievements, troops, gallery photos, etc.), so this exposes
// window.observeReveal(root) for those scripts to call right after they
// set innerHTML, in addition to the automatic pass on DOMContentLoaded
// for content that's already in the page source.

(function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer = null;

    function getObserver() {
        if (observer || prefersReduced || !('IntersectionObserver' in window)) return observer;
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        entry.target.classList.remove('reveal-pending');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        return observer;
    }

    function observeReveal(root) {
        const scope = root || document;
        const targets = scope.querySelectorAll('.reveal:not(.in-view)');
        if (prefersReduced || !('IntersectionObserver' in window)) {
            targets.forEach((el) => el.classList.add('in-view'));
            return;
        }
        const obs = getObserver();
        // Content is visible by default. Only hide an element after its
        // observer is running, so a missing script cannot hide the cards.
        targets.forEach((el) => {
            obs.observe(el);
            el.classList.add('reveal-pending');
        });
    }

    window.observeReveal = observeReveal;
    document.addEventListener('DOMContentLoaded', () => observeReveal(document));
})();
