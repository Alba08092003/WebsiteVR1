
/* ============================
   SibuVR — scripts.js
   Версия: демо, чистый JS (без фреймворков)
   ============================ */

(() => {
  // ---------- Простая "аутентификация" ----------
  const AUTH_KEY = 'sibu_vr_authed_v1';
  const valid = { user: 'admin', pass: '1234' }; // тестовые данные

  const authScreen = document.getElementById('auth-screen');
  const splash = document.getElementById('splash-screen');
  const app = document.getElementById('app');
  const btnLogin = document.getElementById('btn-login');
  const btnGuest = document.getElementById('btn-guest');
  const errBox = document.getElementById('auth-error');
  const inputUser = document.getElementById('login-username');
  const inputPass = document.getElementById('login-password');
  const btnLogout = document.getElementById('btn-logout');

  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  function startSplashThenApp() {
    hide(authScreen);
    show(splash);
    // небольшая анимация (2.2s), потом показать основной сайт
    setTimeout(() => {
      hide(splash);
      show(app);
      window.scrollTo(0,0);
      initApp(); // инициализируем функционал основного сайта
    }, 2200);
  }
  
  btnLogin.addEventListener('click', () => {
    const u = inputUser.value.trim();
    const p = inputPass.value.trim();
    if (!u || !p) { errBox.textContent = 'Введите логин и пароль'; return; }
    // Простая проверка — в реальном проекте нужно серверное подтверждение
    if (u === valid.user && p === valid.pass) {
      errBox.textContent = '';
      startSplashThenApp();
    } else {
      errBox.textContent = 'Неверный логин или пароль';
      // мягкая вибрация на ошибке (если есть поддержка)
      if (navigator.vibrate) navigator.vibrate(120);
    }
  });

  // Вход как гость
  btnGuest.addEventListener('click', () => {
    startSplashThenApp();
  });

  // Выход
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    // Плавно скрываем приложение и возвращаемся к логину
    hide(app);
    show(authScreen);
    inputUser.value = '';
    inputPass.value = '';
  });

  // ---------- Данные курсов (demo) ----------
  const COURSES = [
    { id:'c1', title:'Промышленная безопасность', tag:'safety', level:'Средний', duration:'35 мин', desc:'Опытные сценарии, отработка действий при авариях.' },
    { id:'c2', title:'Электробезопасность', tag:'electro', level:'Базовый', duration:'25 мин', desc:'Практика работы с электроустановками в контролируемой среде.' },
    { id:'c3', title:'Монтаж насосного узла', tag:'assembly', level:'Продвинутый', duration:'45 мин', desc:'Сборка, пусконаладка и контроль качества.' },
    { id:'c4', title:'Работа на высоте', tag:'safety', level:'Средний', duration:'30 мин', desc:'Отработка страховочных систем и процедур.' },
    { id:'c5', title:'Сборка электрических шкафов', tag:'electro', level:'Средний', duration:'40 мин', desc:'Маркировка, проверка и испытания.' },
  ];

  // Динамическая генерация «картинок» для карточек: используем inline SVG as data URL
  function svgThumb(title, a='#0ab29a', b='#0a7fa6') {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='640' height='360' rx='20' fill='url(#g)'/><text x='30' y='320' font-family='Segoe UI, Arial' font-size='36' font-weight='700' fill='rgba(255,255,255,0.95)'>${escapeHtml(title)}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---------- Рендер карточек ----------
  const cardsRoot = document.getElementById('cards');
  function renderCards(list){
    cardsRoot.innerHTML = '';
    list.forEach((c, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      // Небольшой рандомный градиент для разнообразия
      const colors = [
        ['#0ab29a','#0a7fa6'],
        ['#9b5de5','#0ab29a'],
        ['#ff7f50','#0a7fa6'],
        ['#ffd166','#0ab29a']
      ];
      const col = colors[i % colors.length];
      el.innerHTML = `
        <div class="thumb" style="background-image:url('${svgThumb(c.title,col[0],col[1])}')"></div>
        <div class="card-body">
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
          <div class="meta">
            <div class="tag">${c.level}</div>
            <div class="tag">${c.duration}</div>
          </div>
          <div class="actions">
            <button class="btn primary open-course" data-id="${c.id}">Открыть демо</button>
            <button class="btn accent enroll" data-id="${c.id}">В программу</button>
          </div>
        </div>
      `;
      cardsRoot.appendChild(el);
      // анимация появления с задержкой
      setTimeout(()=> el.classList.add('visible'), 80*(i+1));
    });
  }
  renderCards(COURSES);

  // ---------- Фильтры ----------
  document.querySelectorAll('.chip').forEach(ch => {
    ch.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
      ch.classList.add('active');
      const f = ch.dataset.filter;
      if (f === 'all') renderCards(COURSES);
      else renderCards(COURSES.filter(c=>c.tag === f));
    });
  });

  // ---------- Модал курса ----------
  const modal = document.getElementById('modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');

  document.body.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.open-course');
    const enrollBtn = e.target.closest('.enroll');
    if (openBtn) {
      const id = openBtn.dataset.id;
      openCourseModal(id);
    } else if (enrollBtn) {
      const id = enrollBtn.dataset.id;
      alert('Вы успешно записались на курс: ' + id + '\\n(демо — локальное действие)');
    }
  });

  function openCourseModal(id) {
    const course = COURSES.find(c=>c.id===id);
    if (!course) return;
    modalContent.innerHTML = `
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="flex:0 0 320px">
          <img alt="${escapeHtml(course.title)}" src="${svgThumb(course.title)}" style="width:100%;border-radius:12px;box-shadow:0 12px 30px rgba(2,24,25,.12)"/>
        </div>
        <div style="flex:1">
          <h2 style="margin-top:0">${course.title}</h2>
          <p>${course.desc}</p>
          <ul style="margin:12px 0;padding-left:18px;color:#666">
            <li>Уровень: <b>${course.level}</b></li>
            <li>Длительность: <b>${course.duration}</b></li>
            <li>Формат: <b>VR + настольный режим</b></li>
          </ul>
          <div style="display:flex;gap:10px;margin-top:12px">
            <button class="btn primary start-sim" data-id="${course.id}">Запустить симулятор</button>
            <button class="btn ghost close-modal">Закрыть</button>
          </div>
        </div>
      </div>
    `;
    show(modal);
    modal.setAttribute('aria-hidden','false');
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.close-modal')) closeModal();
    if (e.target.closest('.start-sim')) {
      closeModal();
      const id = e.target.closest('.start-sim').dataset.id;
      startSimulation(id);
    }
  });
  function closeModal(){
    hide(modal);
    modal.setAttribute('aria-hidden','true');
  }

  // ---------- Запуск симуляции (демо) ----------
  function startSimulation(id){
    alert('Запуск демо-симуляции: ' + id + '\\n(в реальном проекте здесь открылся бы Three.js/WebXR canvas)');
    // В демо — можно плавно показать "лабораторию"
    document.location.hash = '#labs';
  }

  // ---------- Аккордеон FAQ ----------
  document.querySelectorAll('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const opened = panel.style.display === 'block';
      // закроем все панели
      document.querySelectorAll('.acc-panel').forEach(p => p.style.display = 'none');
      panel.style.display = opened ? 'none' : 'block';
    });
  });

  // ---------- Форма контактов ----------
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Спасибо! Ваше сообщение отправлено (демо).');
    contactForm.reset();
  });

  // ---------- Canvas / Hero background (particles) ----------
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = Math.max(window.innerHeight*0.6, 480);

    const particles = [];
    const COUNT = Math.round((width/1200)*26) + 16; // responsive count
    for (let i=0;i<COUNT;i++){
      particles.push(createParticle());
    }

    function createParticle(){
      const size = 30 + Math.random()*60;
      return {
        x: Math.random()*width,
        y: Math.random()*height,
        vx: (Math.random()-0.5)*0.6,
        vy: -0.2 - Math.random()*0.6,
        size,
        opacity: 0.06 + Math.random()*0.25,
        angle: Math.random()*Math.PI*2,
        spin: (Math.random()-0.5)*0.02,
        gradient: (Math.random() > 0.5)
      };
    }

    function draw(){
      ctx.clearRect(0,0,width,height);
      // subtle vignette
      const g = ctx.createLinearGradient(0,0,0,height);
      g.addColorStop(0, 'rgba(255,255,255,0.02)');
      g.addColorStop(1, 'rgba(2,24,25,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,width,height);

      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        if (p.y + p.size < 0) {
          p.x = Math.random()*width;
          p.y = height + 40;
        }
        if (p.x < -80) p.x = width + 80;
        if (p.x > width + 80) p.x = -80;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        // lens-like shape
        const r = p.size;
        const grad = ctx.createRadialGradient(-r*0.2, -r*0.2, r*0.05, 0, 0, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.25)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
        grad.addColorStop(1, 'rgba(10,127,166,' + (p.opacity*0.8) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r*0.6, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', ()=> {
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight*0.6, 480);
    });
  }

  // ---------- Reveal on scroll ----------
  function revealOnScroll(){
    const items = document.querySelectorAll('.card, .adv-card, .lab-card, .hero-left .stat');
    const onscroll = () => {
      items.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          el.classList.add('visible');
        }
      });
    };
    onscroll();
    window.addEventListener('scroll', onscroll);
  }

  // ---------- Demo: открывает модал при клике на кнопку Demo -->
  const openDemo = document.getElementById('open-demo');
  openDemo?.addEventListener('click', () => {
    alert('Демо-режим: здесь можно встроить Three.js/WebXR сцену.');
  });

  // ---------- Init main app after splash ----------
  function initApp() {
    initHeroCanvas();
    revealOnScroll();
    // дополнительные "мелкие" интерактивы
    document.querySelectorAll('.tilt').forEach(el=>{
      el.addEventListener('mousemove', (e)=>{
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * 6;
        const ry = (px - 0.5) * -6;
        el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', ()=> el.style.transform = '');
    });

    // small enrichment: when user presses "Escape" close modal
    document.addEventListener('keydown', (e)=> {
      if (e.key === 'Escape') closeModal();
    });
  }

  // expose startSimulation/closeModal to functions inside file scope
  function closeModal(){ document.getElementById('modal').classList.add('hidden'); document.getElementById('modal').setAttribute('aria-hidden','true'); }
  function startSimulation(id){ alert('Запуск симуляции: ' + id); }

  // Make modal functions available (for inner listeners)
  window.startSimulation = startSimulation;
  window.closeModal = closeModal;

})();
