(() => {
  const root = document.getElementById('hero-atelier');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[data-atelier-tab]'));
  const views = Array.from(root.querySelectorAll('[data-atelier-view]'));
  const counter = document.getElementById('atelier-counter');
  const kicker = document.getElementById('atelier-stage-kicker');
  const title = document.getElementById('atelier-stage-title');
  const description = document.getElementById('atelier-stage-description');
  const canvas = root.querySelector('.atelier-canvas');
  const board = root.querySelector('.atelier-board');

  const stages = {
    structure: {
      number: '01 — 03',
      kicker: '01 / СНАЧАЛА ЛОГИКА',
      title: 'Структура',
      description: 'Продумываю содержание и путь пользователя, чтобы сайт был понятным ещё до начала дизайна.'
    },
    design: {
      number: '02 — 03',
      kicker: '02 / ЗАТЕМ ФОРМА',
      title: 'Интерфейс',
      description: 'Подбираю визуальный язык, типографику и детали, которые помогают бизнесу выглядеть цельно.'
    },
    code: {
      number: '03 — 03',
      kicker: '03 / ИДЕЯ СТАНОВИТСЯ САЙТОМ',
      title: 'Разработка',
      description: 'Собираю адаптивный интерфейс, проверяю поведение элементов и довожу сайт до публикации.'
    }
  };

  let activeStage = 'structure';

  function activate(stage, focusTab = false) {
    if (!stages[stage]) return;
    activeStage = stage;
    const content = stages[stage];

    tabs.forEach(tab => {
      const selected = tab.dataset.atelierTab === stage;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (focusTab && selected) tab.focus();
    });

    views.forEach(view => {
      const selected = view.dataset.atelierView === stage;
      view.classList.toggle('is-active', selected);
      view.setAttribute('aria-hidden', String(!selected));
    });

    counter.textContent = content.number;
    kicker.textContent = content.kicker;
    title.textContent = content.title;
    description.textContent = content.description;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.atelierTab));
  });

  root.querySelector('.atelier-tabs')?.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const current = tabs.findIndex(tab => tab.dataset.atelierTab === activeStage);
    const nextIndex = (current + direction + tabs.length) % tabs.length;
    activate(tabs[nextIndex].dataset.atelierTab, true);
  });

  const canParallax = window.matchMedia &&
    window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

  if (canvas && board && canParallax) {
    canvas.addEventListener('pointermove', event => {
      const bounds = canvas.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
      board.style.setProperty('--atelier-shift-x', (relativeX * 3).toFixed(2) + 'px');
      board.style.setProperty('--atelier-shift-y', (relativeY * 2).toFixed(2) + 'px');
    });
    canvas.addEventListener('pointerleave', () => {
      board.style.setProperty('--atelier-shift-x', '0px');
      board.style.setProperty('--atelier-shift-y', '0px');
    });
  }

  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  const targets = [
    '.hero-copy',
    '.hero-atelier',
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

  function prepareReveal(scope = document) {
    scope.querySelectorAll(targets.join(',')).forEach(element => {
      if (element.hasAttribute('data-reveal')) return;
      element.setAttribute('data-reveal', '');
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const index = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', Math.min(index, 4) * 65 + 'ms');
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
