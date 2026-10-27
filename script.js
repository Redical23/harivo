/* NOVA — interactions */
(function () {
  'use strict';

  // ---------- Loader ----------
  window.addEventListener('load', () => {
    const l = document.getElementById('loader');
    if (l) setTimeout(() => l.classList.add('hide'), 350);
  });

  // ---------- Navbar scroll + mobile toggle ----------
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const setActive = () => {
    let cur = '';
    const y = window.scrollY + 120;
    sections.forEach((s) => {
      if (s.offsetTop <= y) cur = s.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  };
  window.addEventListener('scroll', debounce(setActive, 60), { passive: true });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          if (e.target.dataset.count) animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal, [data-count]').forEach((el) => io.observe(el));

  // ---------- Counters ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = target * eased;
      el.textContent = prefix + v.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Particles ----------
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, parts;
    const COUNT = window.innerWidth < 700 ? 32 : 70;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function init() {
      parts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        c: Math.random() > 0.5 ? '74,53,160' : '212,168,67',
        a: Math.random() * 0.3 + 0.1,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(' + p.c + ',0.6)';
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }
    resize();
    init();
    draw();
    window.addEventListener('resize', debounce(() => { resize(); init(); }, 200));
  }

  // ---------- Parallax (hero phone + orbs) ----------
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const s = parseFloat(el.dataset.parallax || '0.2');
        el.style.transform = `translateY(${y * s}px)`;
      });
    },
    { passive: true }
  );

  // ---------- Mouse 3D tilt on phone & cards ----------
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  });

  // ---------- Advanced 3D Card Tilt System ----------
  // Feature cards — deep 3D tilt + shine sweep
  document.querySelectorAll('.feature-card').forEach((card) => {
    // Inject shine element
    const shine = document.createElement('div');
    shine.classList.add('card-shine');
    card.appendChild(shine);

    // Inject floating particles
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.classList.add('card-particle');
      card.appendChild(p);
    }

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      const px = (cx / r.width - 0.5);
      const py = (cy / r.height - 0.5);

      card.style.transform = `translateY(-10px) scale(1.02) perspective(800px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Screenshot cards — perspective parallax tilt
  document.querySelectorAll('.shot-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      card.style.transform = `translateY(-14px) perspective(1000px) rotateY(${px * 14}deg) rotateX(${-py * 10}deg)`;
      const img = card.querySelector('img');
      if (img) {
        img.style.transform = `scale(1.04) translateX(${px * -8}px) translateY(${py * -8}px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const img = card.querySelector('img');
      if (img) img.style.transform = '';
    });
  });

  // Stat cards — magnetic number bounce
  document.querySelectorAll('.stat-card').forEach((card) => {
    // Inject particles
    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.classList.add('card-particle');
      card.appendChild(p);
    }

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      card.style.transform = `translateY(-10px) scale(1.03) perspective(600px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Showcase items — subtle depth on hover
  document.querySelectorAll('.showcase-item').forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const r = item.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      item.style.transform = `translateX(8px) scale(1.01) perspective(600px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  // Testimonial cards — gentle float
  document.querySelectorAll('.t-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      card.style.transform = `perspective(800px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---------- Screenshots carousel (removed — now static grid) ----------
  initCarousel('#testimonialsCarousel', { auto: true, interval: 5200, perView: 1 });

  function initCarousel(sel, opts) {
    const root = document.querySelector(sel);
    if (!root) return;
    const track = root.querySelector('[data-track]');
    const slides = root.querySelectorAll('[data-slide]');
    const dotsWrap = root.querySelector('[data-dots]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    if (!track || !slides.length) return;

    let perView = opts.perView || (window.innerWidth < 700 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    let idx = 0;
    let max = Math.max(0, slides.length - perView);
    let timer;

    function go(i) {
      idx = (i + (max + 1)) % (max + 1);
      track.style.transform = `translateX(-${(idx * 100) / perView}%)`;
      if (dotsWrap)
        dotsWrap.querySelectorAll('button').forEach((b, j) => b.classList.toggle('active', j === idx));
    }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= max; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => { go(i); reset(); });
        dotsWrap.appendChild(b);
      }
      go(0);
    }
    function reset() {
      if (!opts.auto) return;
      clearInterval(timer);
      timer = setInterval(() => go(idx + 1), opts.interval || 4500);
    }
    prev && prev.addEventListener('click', () => { go(idx - 1); reset(); });
    next && next.addEventListener('click', () => { go(idx + 1); reset(); });

    // touch swipe
    let sx = null;
    track.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); reset(); }
      sx = null;
    });

    window.addEventListener('resize', debounce(() => {
      perView = opts.perView || (window.innerWidth < 700 ? 1 : window.innerWidth < 1024 ? 2 : 3);
      max = Math.max(0, slides.length - perView);
      buildDots();
    }, 200));

    buildDots();
    reset();
  }

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();
      if (!name || name.length > 100) return setStatus(status, 'Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus(status, 'Please enter a valid email.');
      if (msg.length < 4 || msg.length > 1000) return setStatus(status, 'Message must be 4–1000 characters.');
      setStatus(status, 'Thanks! We will get back to you within 24 hours.', true);
      form.reset();
    });
  }
  function setStatus(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#4A35A0' : '#ff7a7a';
  }

  // ---------- Smooth in-page links ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- Utilities ----------
  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      const a = arguments, c = this;
      t = setTimeout(() => fn.apply(c, a), ms);
    };
  }

  // Year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();