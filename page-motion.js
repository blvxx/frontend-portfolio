(() => {
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const selectors = [
    '.hero-copy',
    '.hero-visual',
    '.hero-foot > *',
    '.trust-grid article',
    '.section-heading > *',
    '.service-card',
    '.price-card',
    '.promo-banner',
    '.brief-controls',
    '.brief-result',
    '.work-toolbar > *',
    '.transparency-note',
    '.project-card',
    '.case-study-heading',
    '.case-study-points article',
    '.step',
    '.about-layout > *',
    '.faq-list > details',
    '.contact-panel > *',
    '.footer-inner > *'
  ];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -44px 0px'
  });

  function observe(scope = document) {
    scope.querySelectorAll(selectors.join(',')).forEach(element => {
      if (element.hasAttribute('data-reveal')) return;
      element.setAttribute('data-reveal', '');

      const siblings = element.parentElement
        ? Array.from(element.parentElement.children)
        : [];
      const index = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', Math.min(index, 4) * 75 + 'ms');
      observer.observe(element);
    });
  }

  observe();
  document.documentElement.classList.add('motion-ready');

  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && 'MutationObserver' in window) {
    const mutationObserver = new MutationObserver(() => observe(projectsGrid));
    mutationObserver.observe(projectsGrid, {
      childList: true,
      subtree: true
    });
  }
})();
