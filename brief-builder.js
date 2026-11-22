
(() => {
  const form = document.getElementById('project-brief');
  if (!form) return;

  const resultTitle = document.getElementById('brief-result-title');
  const resultDescription = document.getElementById('brief-result-description');
  const resultPrice = document.getElementById('brief-result-price');
  const resultNote = document.getElementById('brief-result-note');
  const resultSummary = document.getElementById('brief-result-summary');
  const formatFieldset = form.querySelector('[data-format-fieldset]');
  const priorityNumber = form.querySelector('[data-priority-number]');
  const siteUrlInput = document.getElementById('brief-site-url');
  const copyButton = document.getElementById('brief-copy');
  const copyStatus = document.getElementById('brief-copy-status');
  const emailLink = document.getElementById('brief-email');

  const taskLabels = {
    new: 'Создание сайта с нуля',
    redesign: 'Обновление существующего сайта',
    fix: 'Точечные исправления'
  };
  const priorityLabels = {
    leads: 'Больше обращений',
    presentation: 'Показать услуги и работы',
    mobile: 'Удобство на телефоне',
    quality: 'Исправить ошибки'
  };
  const priorityCopy = {
    leads: 'Сделаю заметными основные предложения и точки связи, чтобы посетителю было проще перейти к обращению. Количество заявок не гарантируется.',
    presentation: 'Помогу структурировать услуги, преимущества и примеры работ, чтобы посетитель быстрее понял предложение компании.',
    mobile: 'Особое внимание уделю мобильной навигации, читаемости, расположению кнопок и удобству форм на смартфоне.',
    quality: 'Сфокусируюсь на согласованных технических проблемах: вёрстке, поведении элементов, формах и проверке основных сценариев.'
  };
  let currentSummary = '';

  const selected = name => form.querySelector('input[name="' + name + '"]:checked')?.value || '';

  function buildRecommendation() {
    const task = selected('brief-task') || 'new';
    const format = selected('brief-format') || 'landing';
    const priority = selected('brief-priority') || 'leads';
    const siteUrl = siteUrlInput.value.trim();

    formatFieldset.hidden = task !== 'new';
    formatFieldset.disabled = task !== 'new';
    priorityNumber.textContent = task === 'new' ? '03' : '02';

    let title = '';
    let description = '';
    let price = '';
    let note = 'Точная стоимость и срок зависят от объёма, материалов и функций. Их согласуем до начала работы.';

    if (task === 'new' && format === 'landing') {
      title = 'Лендинг для бизнеса';
      description = 'Одностраничный сайт с ясным предложением, описанием услуги, преимуществами и удобными точками связи. ' + priorityCopy[priority];
      price = 'от 8 000 ₽';
    } else if (task === 'new' && format === 'company') {
      title = 'Многостраничный сайт компании';
      description = 'Базовый сайт до четырёх страниц: главная, услуги, о компании и контакты. ' + priorityCopy[priority];
      price = 'от 15 000 ₽';
    } else if (task === 'new') {
      title = 'Подберём формат после обсуждения';
      description = 'Если нужно представить одно основное предложение, может подойти лендинг. Если направлений или услуг несколько — сайт компании. ' + priorityCopy[priority];
      price = 'от 8 000 ₽';
      note = 'Лендинг — от 8 000 ₽; сайт компании — от 15 000 ₽. Точный формат и сроки определим после короткого обсуждения.';
    } else if (task === 'redesign') {
      title = 'Редизайн и доработка';
      description = 'Можно начать с проблемных страниц или блоков, обновить визуальную подачу и мобильную версию без полной переделки. ' + priorityCopy[priority];
      price = 'от 5 000 ₽';
    } else {
      title = 'Точечные исправления';
      description = 'Подойдёт для небольших и чётко описанных задач: поправить вёрстку, адаптив, форму или отдельный элемент. ' + priorityCopy[priority];
      price = 'от 1 500 ₽';
    }

    const summaryParts = [taskLabels[task]];
    if (task === 'new') {
      summaryParts.push(format === 'landing' ? 'Лендинг' : format === 'company' ? 'Сайт компании' : 'Формат пока не определён');
    }
    summaryParts.push(priorityLabels[priority]);
    if (siteUrl) summaryParts.push('Текущий сайт: ' + siteUrl);

    currentSummary = [
      'Здравствуйте! Хочу обсудить задачу по сайту.',
      '',
      'Что нужно: ' + taskLabels[task],
      task === 'new' ? 'Формат: ' + (format === 'landing' ? 'лендинг' : format === 'company' ? 'многостраничный сайт компании' : 'нужна рекомендация') : '',
      'Приоритет: ' + priorityLabels[priority],
      siteUrl ? 'Текущий сайт: ' + siteUrl : '',
      '',
      'Подскажите, пожалуйста, что можно предложить по объёму работ, срокам и стоимости.',
      '',
      'С уважением'
    ].filter(Boolean).join('\n');

    resultTitle.textContent = title;
    resultDescription.textContent = description;
    resultPrice.textContent = price;
    resultNote.textContent = note;
    resultSummary.textContent = summaryParts.join(' · ');
    emailLink.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=blvx8x%40gmail.com&su=' +
      encodeURIComponent('Запрос по разработке или обновлению сайта') + '&body=' + encodeURIComponent(currentSummary);
    copyStatus.textContent = '';
  }

  form.addEventListener('change', buildRecommendation);
  siteUrlInput.addEventListener('input', buildRecommendation);
  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(currentSummary);
      copyStatus.textContent = 'Текст запроса скопирован. Его можно вставить в письмо или сообщение.';
    } catch (error) {
      copyStatus.textContent = 'Не удалось скопировать автоматически. Откройте письмо — текст уже подготовлен в черновике Gmail.';
    }
  });

  buildRecommendation();
})();
