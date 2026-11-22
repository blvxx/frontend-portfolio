(() => {
  const root = document.getElementById('hero-showcase');
  if (!root) return;

  const projects = [
    {
      title: 'ДОМФОРМА',
      category: 'HOME SERVICES / CONCEPT',
      description: 'Сайт ремонтной компании с услугами, примерами интерьеров и понятным сценарием обращения.',
      url: 'https://blvxx.github.io/web-development-portfolio/projects/domforma/',
      slug: 'domforma'
    },
    {
      title: 'VÉRA SKIN',
      category: 'E-COMMERCE / BEAUTY',
      description: 'Концепт магазина косметики: каталог, товарные карточки и интерактивная корзина.',
      url: 'https://blvxx.github.io/web-development-portfolio/projects/vera-skin/',
      slug: 'vera-skin'
    },
    {
      title: 'IRON DISTRICT',
      category: 'FITNESS / WEBSITE',
      description: 'Сайт фитнес-клуба с направлениями тренировок, преимуществами и сценариями записи.',
      url: 'https://blvxx.github.io/web-development-portfolio/projects/iron-district/',
      slug: 'iron-district'
    },
    {
      title: 'NOIR COFFEE',
      category: 'COFFEE / BRAND WEBSITE',
      description: 'Сайт кофейни с атмосферной подачей, меню, историей бренда и контактами.',
      url: 'https://blvxx.github.io/web-development-portfolio/projects/noir-coffee/',
      slug: 'noir-coffee'
    },
    {
      title: 'FRAME STUDIO',
      category: 'CREATIVE / DIGITAL STUDIO',
      description: 'Минималистичный сайт креативной студии с акцентом на услуги и типографику.',
      url: 'https://blvxx.github.io/web-development-portfolio/projects/frame-studio/',
      slug: 'frame-studio'
    }
  ];

  const frame = document.getElementById('showcase-frame');
  const count = document.getElementById('showcase-count');
  const address = document.getElementById('showcase-address');
  const category = document.getElementById('showcase-category');
  const title = document.getElementById('showcase-title');
  const description = document.getElementById('showcase-description');
  const openLink = document.getElementById('showcase-open');
  const progress = document.getElementById('showcase-progress-bar');
  const tabs = Array.from(root.querySelectorAll('[data-showcase-index]'));
  const previous = document.getElementById('showcase-prev');
  const next = document.getElementById('showcase-next');
  let activeIndex = 0;
  let loadFallback = null;

  function activate(index) {
    const nextIndex = (index + projects.length) % projects.length;
    const project = projects[nextIndex];
    if (nextIndex === activeIndex && frame.src === project.url) return;
    activeIndex = nextIndex;

    frame.classList.add('is-changing');
    if (loadFallback) window.clearTimeout(loadFallback);
    const finishTransition = () => {
      frame.classList.remove('is-changing');
      if (loadFallback) window.clearTimeout(loadFallback);
      loadFallback = null;
    };
    frame.addEventListener('load', finishTransition, { once: true });
    frame.src = project.url;
    loadFallback = window.setTimeout(finishTransition, 1800);

    frame.title = 'Живое превью сайта ' + project.title;
    count.textContent = String(nextIndex + 1).padStart(2, '0') + ' / ' + String(projects.length).padStart(2, '0');
    address.textContent = 'blvxx.github.io / ' + project.slug;
    category.textContent = project.category;
    title.textContent = project.title;
    description.textContent = project.description;
    openLink.href = project.url;
    progress.style.width = ((nextIndex + 1) / projects.length * 100) + '%';

    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === nextIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
  });
  previous?.addEventListener('click', () => activate(activeIndex - 1));
  next?.addEventListener('click', () => activate(activeIndex + 1));

  root.querySelector('.showcase-tabs')?.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    event.preventDefault();
    const nextIndex = (activeIndex + direction + projects.length) % projects.length;
    activate(nextIndex);
    tabs[nextIndex]?.focus();
  });

  const showcaseWindow = document.getElementById('showcase-window');
  const canTilt = window.matchMedia && window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
  if (showcaseWindow && canTilt) {
    showcaseWindow.addEventListener('pointermove', event => {
      const bounds = showcaseWindow.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      showcaseWindow.style.setProperty('--showcase-tilt-y', (x * 1.6).toFixed(2) + 'deg');
      showcaseWindow.style.setProperty('--showcase-tilt-x', (-y * 1.3).toFixed(2) + 'deg');
    });
    showcaseWindow.addEventListener('pointerleave', () => {
      showcaseWindow.style.setProperty('--showcase-tilt-x', '0deg');
      showcaseWindow.style.setProperty('--showcase-tilt-y', '0deg');
    });
  }

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  const revealTargets = [
    '.hero-copy',
    '.hero-showcase',
    '.trust-grid article',
    '.service-card',
    '.price-card',
    '.case-study-layout',
    '.step',
    '.about-layout',
    '.faq-list details',
    '.contact-panel'
  ];

  function prepareReveal(scope = document) {
    scope.querySelectorAll(revealTargets.join(',')).forEach((element, index) => {
      if (element.hasAttribute('data-reveal')) return;
      element.setAttribute('data-reveal', '');
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const siblingIndex = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', Math.min(siblingIndex, 4) * 70 + 'ms');
      observer.observe(element);
    });
  }

  prepareReveal();
  document.documentElement.classList.add('motion-ready');

  const projectGrid = document.getElementById('projects-grid');
  if (projectGrid && 'MutationObserver' in window) {
    const mutationObserver = new MutationObserver(() => prepareReveal(projectGrid));
    mutationObserver.observe(projectGrid, { childList: true, subtree: true });
  }
})();
