const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const requestForm = document.querySelector('#request-form');
const formNote = document.querySelector('#form-note');
const year = document.querySelector('#year');

if (year) year.textContent = String(new Date().getFullYear());

if (menuButton && navigation) {
  const closeNavigation = (restoreFocus = false) => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeNavigation());
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeNavigation(true);
    }
  });
}

if (requestForm && formNote) {
  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!requestForm.reportValidity()) return;
    formNote.textContent = 'Спасибо! Это демонстрация интерфейса: запрос не отправлен и нигде не сохранён.';
    formNote.classList.add('is-success');
    requestForm.reset();
  });
}
