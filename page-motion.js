(() => {
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const selectors = [
    '.hero-copy',
    '.hero-visual',
    '.trust-grid article',
    '.service-card',
    '.price-card',
    '.project-card',
    '.case-study-layout',
    '.step',
    '.about-layout',
    '.faq-list details',
    '.contact-panel'
  ];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  function observe(scope = document) {
    scope.querySelectorAll(selectors.join(',')).forEach(element => {
      if (element.hasAttribute('data-reveal')) return;
      element.setAttribute('data-reveal', '');
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const index = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', Math.min(index, 4) * 60 + 'ms');
      observer.observe(element);
    });
  }

  observe();
  document.documentElement.classList.add('motion-ready');

  const projects = document.getElementById('projects-grid');
  if (projects && 'MutationObserver' in window) {
    new MutationObserver(() => observe(projects)).observe(projects, { childList: true, subtree: true });
  }
})();
