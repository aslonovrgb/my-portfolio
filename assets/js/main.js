(() => {
  const root = document.documentElement;
  const body = document.body;

  const state = {
    lang: safeGet('lang') || 'ru',
    theme: safeGet('theme') || body.getAttribute('data-theme') || 'dark',
    typeIndex: 0,
    charIndex: 0,
    deleting: false,
    typeTimer: null,
  };

  const typeWords = {
    ru: [
      'сайты и лендинги.',
      'мобильные приложения.',
      'UI/UX дизайн в Figma.',
      'MVP от идеи до запуска.'
    ],
    en: [
      'websites and landing pages.',
      'mobile applications.',
      'UI/UX design in Figma.',
      'MVPs from idea to launch.'
    ]
  };

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore private mode */ }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore private mode */ }
  }

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function applyTheme(theme) {
    state.theme = theme;
    body.setAttribute('data-theme', theme);
    safeSet('theme', theme);

    const themeBtn = qs('#theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
    }
  }

  function updateGreeting() {
    const greeting = qs('#smart-greeting');
    if (!greeting) return;

    const hour = new Date().getHours();
    const messages = {
      ru: {
        morning: 'Доброе утро!',
        day: 'Добрый день!',
        evening: 'Добрый вечер!',
        night: 'Работаете допоздна?'
      },
      en: {
        morning: 'Good morning!',
        day: 'Good afternoon!',
        evening: 'Good evening!',
        night: 'Working late?'
      }
    };

    let part = 'day';
    if (hour >= 5 && hour < 12) part = 'morning';
    if (hour >= 18 && hour < 22) part = 'evening';
    if (hour >= 22 || hour < 5) part = 'night';

    greeting.textContent = messages[state.lang][part];
  }

  function applyLanguage(lang) {
    state.lang = lang;
    safeSet('lang', lang);
    root.lang = lang;

    const langBtn = qs('#lang-btn');
    if (langBtn) langBtn.textContent = lang === 'ru' ? 'EN' : 'RU';

    qsa('.lang-txt').forEach((el) => {
      const value = el.getAttribute(`data-${lang}`);
      if (value !== null) el.innerHTML = value;
    });

    qsa('[data-ru-placeholder][data-en-placeholder]').forEach((el) => {
      const value = el.getAttribute(`data-${lang}-placeholder`);
      if (value !== null) el.setAttribute('placeholder', value);
    });

    qsa('option[data-ru][data-en]').forEach((option) => {
      const value = option.getAttribute(`data-${lang}`);
      if (value !== null) option.textContent = value;
    });

    updateGreeting();
    restartTypewriter();
    refreshInteractiveText();
  }

  function restartTypewriter() {
    clearTimeout(state.typeTimer);
    state.typeIndex = 0;
    state.charIndex = 0;
    state.deleting = false;

    const target = qs('#typewriter');
    if (target) target.textContent = '';

    state.typeTimer = setTimeout(typeLoop, 350);
  }

  function typeLoop() {
    const target = qs('#typewriter');
    if (!target) return;

    const words = typeWords[state.lang] || typeWords.ru;
    const word = words[state.typeIndex];

    if (state.deleting) {
      state.charIndex -= 1;
      target.textContent = word.slice(0, state.charIndex);
    } else {
      state.charIndex += 1;
      target.textContent = word.slice(0, state.charIndex);
    }

    let delay = state.deleting ? 42 : 72;

    if (!state.deleting && state.charIndex === word.length) {
      delay = 1500;
      state.deleting = true;
    }

    if (state.deleting && state.charIndex === 0) {
      state.deleting = false;
      state.typeIndex = (state.typeIndex + 1) % words.length;
      delay = 260;
    }

    state.typeTimer = setTimeout(typeLoop, delay);
  }

  function initDynamicExperience() {
    const expEl = qs('#dynamic-exp');
    if (!expEl) return;
    const startYear = 2024;
    const year = new Date().getFullYear();
    expEl.textContent = String(Math.max(1, year - startYear));
  }

  function initPreloader() {
    const preloader = qs('#preloader');
    if (!preloader) return;

    const hide = () => {
      preloader.classList.add('is-hidden');
      setTimeout(() => preloader.remove(), 750);
    };

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide, { once: true });

    setTimeout(hide, 1800);
  }

  function initMobileMenu() {
    const toggle = qs('#menu-toggle');
    const nav = qs('#mobile-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    qsa('a', nav).forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  function initHeaderButtons() {
    const themeBtn = qs('#theme-toggle');
    const langBtn = qs('#lang-btn');

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    if (langBtn) {
      langBtn.addEventListener('click', () => {
        applyLanguage(state.lang === 'ru' ? 'en' : 'ru');
      });
    }
  }

  function initCopyEmail() {
    const btn = qs('#copy-email');
    const email = qs('#email-text');
    const toast = qs('#toast');
    if (!btn || !email || !toast) return;

    btn.addEventListener('click', async () => {
      const value = email.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
        toast.textContent = state.lang === 'ru' ? 'Почта скопирована!' : 'Email copied!';
      } catch {
        toast.textContent = value;
      }
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 2200);
    });
  }

  async function fetchGitHub() {
    const list = qs('#github-repos-list');
    if (!list) return;

    try {
      const res = await fetch('https://api.github.com/users/usanv/repos?sort=updated&per_page=4', {
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!res.ok) throw new Error('GitHub request failed');
      const repos = await res.json();

      list.innerHTML = repos.map((repo) => `
        <div class="repo-item">
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="active-hover">${escapeHtml(repo.name)}</a>
          <span><i class="fa-solid fa-star"></i>${repo.stargazers_count}</span>
        </div>
      `).join('');
    } catch {
      list.innerHTML = `
        <div class="repo-item">
          <a href="https://github.com/usanv" target="_blank" rel="noopener" class="active-hover">GitHub Profile</a>
          <span><i class="fa-brands fa-github"></i>open</span>
        </div>
      `;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initFilters() {
    const buttons = qsa('.filter-btn');
    const cards = qsa('.case-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';

        buttons.forEach((item) => item.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach((card) => {
          const categories = card.dataset.category || '';
          const show = filter === 'all' || categories.split(' ').includes(filter);
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  function initFaq() {
    qsa('.faq-item').forEach((item, index) => {
      const btn = qs('.faq-question', item);
      if (!btn) return;

      if (index === 0) item.classList.add('active');

      btn.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    });
  }

  function initReveal() {
    const items = qsa('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  function initProgressAndSpy() {
    const progress = qs('#progressBar');
    const sections = qsa('.scroll-section');
    const navLinks = qsa('.desktop-nav .nav-link');

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? (scrollTop / max) * 100 : 0;
      if (progress) progress.style.width = `${percent}%`;

      let current = '';
      sections.forEach((section) => {
        if (scrollTop >= section.offsetTop - 180) current = section.id;
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${current}`);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initCursor() {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cursor = qs('#cursor');
    const follower = qs('#cursor-follower');
    if (!finePointer || !cursor || !follower) return;

    let cx = 0;
    let cy = 0;
    let fx = 0;
    let fy = 0;

    document.addEventListener('mousemove', (e) => {
      body.classList.add('cursor-visible');
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      body.classList.remove('cursor-visible');
    });

    const render = () => {
      fx += (cx - fx) * 0.14;
      fy += (cy - fy) * 0.14;
      follower.style.transform = `translate3d(${fx - 21}px, ${fy - 21}px, 0)`;
      requestAnimationFrame(render);
    };
    render();

    const grow = () => {
      follower.style.width = '70px';
      follower.style.height = '70px';
      follower.style.background = 'rgba(56, 189, 248, 0.10)';
    };

    const shrink = () => {
      follower.style.width = '42px';
      follower.style.height = '42px';
      follower.style.background = 'transparent';
    };

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.active-hover, a, button, input, textarea')) grow();
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.active-hover, a, button, input, textarea')) shrink();
    });
  }

  function initTilt() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (reduceMotion || coarse || typeof VanillaTilt === 'undefined') return;

    VanillaTilt.init(qsa('[data-tilt]'), {
      max: 5,
      speed: 500,
      glare: true,
      'max-glare': 0.12,
      scale: 1.01,
    });
  }

  function refreshInteractiveText() {
    renderEstimate(true);
    updateLaunchProgress(false);
    syncContactQuickBrief(false);
  }

  function initLiveFrames() {
    const frames = qsa('.live-frame[data-src]');
    if (!frames.length) return;

    const loadFrame = (frame) => {
      if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
    };

    if (!('IntersectionObserver' in window)) {
      frames.forEach(loadFrame);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadFrame(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '240px 0px' });

    frames.forEach((frame) => observer.observe(frame));
  }

  function initPreviewModal() {
    const modal = qs('#preview-modal');
    const frame = qs('#preview-modal-frame');
    const title = qs('#preview-modal-title');
    const closeBtn = qs('#preview-modal-close');
    if (!modal || !frame || !title) return;

    const openPreview = (url, name) => {
      frame.setAttribute('src', url);
      title.textContent = name || 'Live preview';
      modal.classList.remove('mobile-view');
      qsa('[data-modal-preview-size]', modal).forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.modalPreviewSize === 'desktop');
      });
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      body.classList.add('preview-open');
    };

    const closePreview = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      body.classList.remove('preview-open');
      frame.removeAttribute('src');
    };

    qsa('[data-open-preview]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPreview(btn.dataset.openPreview, btn.dataset.title);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closePreview);
    qsa('[data-close-preview]', modal).forEach((el) => el.addEventListener('click', closePreview));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closePreview();
    });
  }



  function initLivePreviewDevices() {
    qsa('.preview-browser').forEach((browser) => {
      const buttons = qsa('[data-preview-size]', browser);
      if (!buttons.length) return;

      buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          const mode = button.dataset.previewSize || 'desktop';
          browser.classList.toggle('mobile-view', mode === 'mobile');
          buttons.forEach((item) => item.classList.toggle('active', item === button));
        });
      });
    });

    const modal = qs('#preview-modal');
    if (!modal) return;

    qsa('[data-modal-preview-size]', modal).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const mode = button.dataset.modalPreviewSize || 'desktop';
        modal.classList.toggle('mobile-view', mode === 'mobile');
        qsa('[data-modal-preview-size]', modal).forEach((item) => item.classList.toggle('active', item === button));
      });
    });
  }

  function syncContactQuickBrief(append = false) {
    const chips = qsa('.quick-brief-chip');
    const textarea = qs('#contact-form textarea[name="message"]');
    if (!chips.length || !textarea) return;

    const active = chips.find((chip) => chip.classList.contains('active')) || chips[0];
    if (!active) return;

    if (!append && textarea.dataset.quickFilled !== 'true') return;

    const text = active.getAttribute(`data-brief-${state.lang}`) || active.getAttribute('data-brief-ru') || '';
    const current = textarea.value.trim();

    if (append && current && textarea.dataset.quickFilled !== 'true') {
      textarea.value = `${current}\n\n${text}`;
    } else {
      textarea.value = text;
    }

    textarea.dataset.quickFilled = 'true';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function initContactQuickBrief() {
    const chips = qsa('.quick-brief-chip');
    const textarea = qs('#contact-form textarea[name="message"]');
    if (!chips.length || !textarea) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((item) => item.classList.remove('active'));
        chip.classList.add('active');
        syncContactQuickBrief(true);
        textarea.focus();
      });
    });

    textarea.addEventListener('input', () => {
      if (!textarea.value.trim()) textarea.dataset.quickFilled = 'false';
    });
  }

  const CONTACT_DRAFT_KEY = 'nuvora-contact-draft';

  function clearContactDraft() {
    safeRemove(CONTACT_DRAFT_KEY);
  }

  function initContactDraft() {
    const form = qs('#contact-form');
    if (!form) return;

    const fields = qsa('input[name="name"], input[name="email"], textarea[name="message"]', form);
    if (!fields.length) return;

    try {
      const saved = JSON.parse(safeGet(CONTACT_DRAFT_KEY) || '{}');
      fields.forEach((field) => {
        if (!field.value && saved[field.name]) field.value = saved[field.name];
      });
    } catch { /* ignore invalid draft */ }

    let timer;
    const saveDraft = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const draft = {};
        fields.forEach((field) => { draft[field.name] = field.value; });
        safeSet(CONTACT_DRAFT_KEY, JSON.stringify(draft));
      }, 180);
    };

    fields.forEach((field) => field.addEventListener('input', saveDraft));
  }

  function renderEstimate(onlyIfActive = false) {
    const type = qs('#estimate-type');
    const speed = qs('#estimate-speed');
    const result = qs('#estimate-result');
    if (!type || !speed || !result) return;

    if (onlyIfActive && result.dataset.active !== 'true') return;

    const messages = {
      ru: {
        site: {
          calm: 'Сайт / лендинг: обычно 2–3 недели. Следующий шаг — структура, референсы и контент.',
          fast: 'Сайт / лендинг: быстрый запуск возможен за 7–12 дней, если контент и цель готовы.'
        },
        app: {
          calm: 'Мобильное приложение: MVP обычно 4–8 недель. Начинаем с сценариев, экранов и логики.',
          fast: 'Flutter app sprint: 3–5 недель для компактного MVP с приоритетными экранами.'
        },
        mvp: {
          calm: 'MVP продукта: 3–6 недель. Фокус — на ключевой ценности, интеграциях и аккуратном запуске.',
          fast: 'Быстрый MVP: 2–4 недели, если оставить только основные сценарии и понятный scope.'
        },
        design: {
          calm: 'UI/UX дизайн: 1–3 недели. На выходе — структура, Figma-макеты, UI-kit и handoff.',
          fast: 'Дизайн-спринт: 5–10 дней для ключевых экранов, user flow и визуального направления.'
        }
      },
      en: {
        site: {
          calm: 'Website / landing page: usually 2–3 weeks. Next step — structure, references and content.',
          fast: 'Website / landing page: a fast launch is possible in 7–12 days if content and goal are ready.'
        },
        app: {
          calm: 'Mobile app: MVP usually takes 4–8 weeks. We start with flows, screens and logic.',
          fast: 'Flutter app sprint: 3–5 weeks for a compact MVP with priority screens.'
        },
        mvp: {
          calm: 'Product MVP: 3–6 weeks. Focus — core value, integrations and a polished launch.',
          fast: 'Fast MVP: 2–4 weeks if we keep only core scenarios and a clear scope.'
        },
        design: {
          calm: 'UI/UX design: 1–3 weeks. Deliverables — structure, Figma layouts, UI kit and handoff.',
          fast: 'Design sprint: 5–10 days for key screens, user flow and visual direction.'
        }
      }
    };

    result.textContent = messages[state.lang][type.value][speed.value];
    result.dataset.active = 'true';
  }

  function initEstimator() {
    const btn = qs('#estimate-btn');
    if (!btn) return;
    btn.addEventListener('click', () => renderEstimate(false));
  }

  function initQuickBrief() {
    const chips = qsa('.brief-chip');
    const moveBtn = qs('#brief-to-contact');
    const textarea = qs('#contact-form textarea[name="message"]');
    if (!chips.length || !moveBtn || !textarea) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((item) => item.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    moveBtn.addEventListener('click', () => {
      const active = chips.find((chip) => chip.classList.contains('active')) || chips[0];
      const text = active.getAttribute(`data-brief-${state.lang}`) || active.getAttribute('data-brief-ru') || '';
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      qs('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => textarea.focus(), 550);
    });
  }

  function updateLaunchProgress(save = true) {
    const checks = qsa('.launch-check');
    const fill = qs('#launch-progress-fill');
    const text = qs('#launch-progress-text');
    if (!checks.length || !fill || !text) return;

    const done = checks.filter((item) => item.checked).length;
    const percent = Math.round((done / checks.length) * 100);
    fill.style.width = `${percent}%`;
    text.textContent = state.lang === 'ru' ? `Готовность: ${percent}%` : `Readiness: ${percent}%`;

    if (save) {
      safeSet('launch-checklist', JSON.stringify(checks.map((item) => item.checked)));
    }
  }

  function initLaunchChecklist() {
    const checks = qsa('.launch-check');
    if (!checks.length) return;

    try {
      const saved = JSON.parse(safeGet('launch-checklist') || '[]');
      checks.forEach((check, index) => {
        check.checked = Boolean(saved[index]);
      });
    } catch { /* ignore invalid storage */ }

    checks.forEach((check) => check.addEventListener('change', () => updateLaunchProgress(true)));
    updateLaunchProgress(false);
  }

  function initFeatureCopyEmail() {
    const btn = qs('#copy-email-feature');
    const toast = qs('#toast');
    if (!btn || !toast) return;

    btn.addEventListener('click', async () => {
      const value = 'nenotiiice@gmail.com';
      try {
        await navigator.clipboard.writeText(value);
        toast.textContent = state.lang === 'ru' ? 'Email скопирован!' : 'Email copied!';
      } catch {
        toast.textContent = value;
      }
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 2200);
    });
  }

  function initForm() {
    const form = qs('#contact-form');
    const status = qs('#form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = '';
      status.textContent = state.lang === 'ru' ? 'Отправляю...' : 'Sending...';

      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          form.reset();
          clearContactDraft();
          status.className = 'success';
          status.textContent = state.lang === 'ru'
            ? 'Заявка отправлена. Спасибо!'
            : 'Request sent. Thank you!';
        } else {
          throw new Error('Form submission failed');
        }
      } catch {
        status.className = 'error';
        status.textContent = state.lang === 'ru'
          ? 'Не получилось отправить. Можно написать в Telegram или на email.'
          : 'Could not send. You can message us on Telegram or email.';
      }
    });
  }

  function init() {
    applyTheme(state.theme);
    applyLanguage(state.lang);
    initDynamicExperience();
    initPreloader();
    initMobileMenu();
    initHeaderButtons();
    initCopyEmail();
    initFilters();
    initFaq();
    initLiveFrames();
    initPreviewModal();
    initLivePreviewDevices();
    initContactQuickBrief();
    initContactDraft();
    initEstimator();
    initQuickBrief();
    initLaunchChecklist();
    initFeatureCopyEmail();
    initReveal();
    initProgressAndSpy();
    initCursor();
    initForm();
    fetchGitHub();

    window.addEventListener('load', initTilt, { once: true });
  }

  init();
})();
