(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const role = document.querySelector('.role');
  const motionButton = document.querySelector('.motion-toggle');
  let paused = reduced.matches;
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  function renderScroll() {
    frame = 0;
    const total = root.scrollHeight - innerHeight;
    root.style.setProperty('--scroll', total > 0 ? scrollY / total : 0);
    hero.style.setProperty('--hero-p', paused ? 0 : clamp(-hero.getBoundingClientRect().top / hero.offsetHeight));
    const rect = role.getBoundingClientRect();
    const distance = role.offsetHeight - innerHeight;
    const progress = distance > 100
      ? clamp(-rect.top / distance)
      : clamp((innerHeight - rect.top) / (innerHeight + rect.height));
    role.style.setProperty('--role-p', paused ? 1 : .25 + progress * .75);
  }
  function queueScroll() {
    if (!frame) frame = requestAnimationFrame(renderScroll);
  }
  function setMotion(value) {
    paused = value;
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Включить анимацию ↗' : 'Приостановить анимацию Ⅱ';
    document.querySelectorAll('.hero, .tool-stage').forEach(el => {
      el.style.setProperty('--mouse-x', 0);
      el.style.setProperty('--mouse-y', 0);
    });
    queueScroll();
  }
  motionButton.addEventListener('click', () => setMotion(!paused));
  reduced.addEventListener('change', () => setMotion(reduced.matches));
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });
  setMotion(paused);

  document.querySelectorAll('.hero, .tool-stage').forEach(el => {
    let pointerFrame = 0;
    let x = 0, y = 0;
    el.addEventListener('pointermove', event => {
      if (paused || !finePointer.matches) return;
      const rect = el.getBoundingClientRect();
      x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
        el.style.setProperty('--mouse-x', x);
        el.style.setProperty('--mouse-y', y);
        pointerFrame = 0;
      });
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      el.style.setProperty('--mouse-x', 0);
      el.style.setProperty('--mouse-y', 0);
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const toolInfo = {
    ae: ['ВИДЕО И МОУШН', 'After Effects', 'Монтирую видео и работаю с визуальной подачей контента. Использовал в SMM и продвижении клуба.'],
    ps: ['ГРАФИКА И КОНТЕНТ', 'Photoshop', 'Работаю с изображениями и визуальными материалами. Использовал в дизайне и продвижении бизнеса.'],
    canva: ['ДИЗАЙН И КОММУНИКАЦИЯ', 'Canva', 'Создаю макеты и материалы для социальных сетей. Работал над палитрой, брендбуком и единой подачей бренда.'],
    vscode: ['СРЕДА РАЗРАБОТКИ', 'VS Code', 'Использую для работы с кодом. Мне интересны архитектура программ, логика систем и связи между их частями.'],
    python: ['ПРОГРАММИРОВАНИЕ', 'Python', 'Один из языков, с которыми я работаю. В моём опыте — архитектура Telegram-бота, интеграции и работа с данными.'],
    cpp: ['ПРОГРАММИРОВАНИЕ', 'C++', 'Работаю с C++. В разработке меня особенно интересуют устройство программы, логика и то, как связаны её компоненты.'],
    csharp: ['ПРОГРАММИРОВАНИЕ', 'C#', 'Один из моих языков программирования. Есть опыт работы над программой для анализа активности на игровых компьютерах.'],
    sql: ['БАЗЫ ДАННЫХ', 'SQL', 'Работаю с базами данных. Участвовал в связке программной системы и Telegram-бота через данные.'],
    openai: ['AI В РАБОТЕ', 'ChatGPT', 'Использую в работе с информацией и программированием: чтобы разбирать задачи, обсуждать варианты и уточнять логику.'],
    claude: ['AI В РАБОТЕ', 'Claude', 'Использую как AI-инструмент в рабочем процессе — для разбора информации, идей и задач, связанных с кодом.']
  };
  const toolDetail = document.querySelector('.tool-detail');
  let noteTimer;
  document.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => {
      const info = toolInfo[button.dataset.tool];
      if (!info) return;
      document.querySelectorAll('[data-tool]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      document.getElementById('tool-category').textContent = info[0];
      document.getElementById('tool-name').textContent = info[1];
      document.getElementById('tool-description').textContent = info[2];
      toolDetail.classList.remove('changing');
      void toolDetail.offsetWidth;
      toolDetail.classList.add('changing');
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => toolDetail.classList.remove('changing'), 450);
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  menu.querySelectorAll('a, button').forEach(el => el.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  addEventListener('resize', () => { if (innerWidth > 800) closeMenu(); }, { passive: true });

  document.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('click', () => {
      const after = button.dataset.photo === 'after';
      document.querySelector('.case-before').hidden = after;
      document.querySelector('.case-after').hidden = !after;
      document.querySelector('.case-photo-frame').classList.toggle('show-after', after);
      document.querySelectorAll('[data-photo]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    });
  });

  const dialog = document.querySelector('.profile-dialog');
  let opener;
  document.querySelectorAll('[data-profile]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      closeMenu();
      document.querySelector('.copy-status').textContent = '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (opener && !opener.closest('[hidden]')) opener.focus();
    else menuButton.focus();
  });
  document.querySelector('.copy-profile').addEventListener('click', async () => {
    const copy = [...dialog.querySelectorAll('p:not(.small-label):not(.copy-status)')].map(p => p.textContent).join('\n\n');
    const status = document.querySelector('.copy-status');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(copy);
      status.textContent = 'Профиль скопирован.';
    } catch {
      status.textContent = 'Не удалось скопировать автоматически. Текст выше можно выделить и скопировать вручную.';
    }
  });
  document.fonts.ready.then(queueScroll);
})();
