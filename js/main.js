/* Bolos e Delícias Mangueira — interações */
(function () {
  'use strict';

  /* Configuração central da loja */
  var CONFIG = {
    whatsapp: '5562981730499',
    themeKey: 'bdm-theme'
  };

  var root = document.documentElement;

  /* ---------- Links de WhatsApp com mensagem pré-preenchida ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (link) {
    var msg = link.getAttribute('data-wa');
    link.href = 'https://wa.me/' + CONFIG.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : '');
  });

  /* ---------- Tema claro / escuro ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var themeMeta = document.querySelectorAll('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
    var bg = getComputedStyle(document.body).backgroundColor;
    themeMeta.forEach(function (m) { m.setAttribute('content', bg); });
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(CONFIG.themeKey, next); } catch (e) {}
    });
  }

  /* ---------- Menu mobile ---------- */
  var nav = document.querySelector('[data-nav]');
  var navToggle = document.querySelector('[data-nav-toggle]');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Header com sombra ao rolar + WhatsApp flutuante ---------- */
  var header = document.querySelector('[data-header]');
  var waFloat = document.querySelector('.wa-float');
  var hero = document.querySelector('.hero');
  var footer = document.querySelector('.site-footer');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* O botão flutuante some enquanto o CTA do hero ou o rodapé estão visíveis */
  if ('IntersectionObserver' in window && waFloat) {
    var hidden = new Set();
    var floatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) hidden.add(entry.target); else hidden.delete(entry.target);
      });
      waFloat.classList.toggle('is-hidden', hidden.size > 0);
    }, { threshold: 0.35 });
    [hero, footer].forEach(function (el) { if (el) floatObserver.observe(el); });
  }

  /* ---------- Link ativo no menu ---------- */
  var navLinks = document.querySelectorAll('.nav__link');
  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.setAttribute('aria-current', String(link.getAttribute('href') === '#' + entry.target.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id], footer[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Entrada suave dos elementos ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Carrossel de depoimentos ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var dotsWrap = carousel.querySelector('[data-carousel-dots]');
    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) { dotsWrap.hidden = true; return; }

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dots__btn';
      b.setAttribute('aria-label', 'Mostrar item ' + (i + 1) + ' de ' + slides.length);
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });

    var current = 0;
    function mark(i) {
      current = i;
      dots.forEach(function (d, j) { d.setAttribute('aria-current', String(i === j)); });
    }
    function goTo(i) {
      mark(i);
      var left = i * track.clientWidth;
      if (Math.abs(track.scrollLeft - left) < 1) { schedule(); return; } // já está no slide: não haverá rolagem
      stop(); // o próximo avanço é agendado quando a rolagem terminar
      track.scrollTo({ left: left, behavior: 'smooth' });
    }
    mark(0);

    /* Só atualiza o índice quando a rolagem assenta; posições intermediárias
       da animação faziam o carrossel voltar ou pular depoimentos */
    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        mark(Math.round(track.scrollLeft / track.clientWidth));
        schedule();
      }, 150);
    }, { passive: true });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') goTo(Math.min(current + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') goTo(Math.max(current - 1, 0));
    });

    /* Avanço automático discreto (pausado ao interagir e com movimento reduzido) */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer, hovering = false, focused = false, touching = false;
    function schedule() {
      stop();
      if (reduce || hovering || focused || touching) return;
      timer = setTimeout(function () { goTo((current + 1) % slides.length); }, 5000); // 5 segundos por depoimento
    }
    function stop() { clearTimeout(timer); }
    carousel.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; stop(); } });
    carousel.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; schedule(); } });
    carousel.addEventListener('focusin', function (e) {
      // pausa só com foco via teclado; clicar num ponto não deve travar o carrossel
      try { focused = e.target.matches(':focus-visible'); } catch (err) { focused = false; }
      if (focused) stop();
    });
    carousel.addEventListener('focusout', function () { focused = false; schedule(); });
    track.addEventListener('touchstart', function () { touching = true; stop(); }, { passive: true });
    track.addEventListener('touchend', function () { touching = false; schedule(); }, { passive: true });
    schedule();
  });

  /* ---------- Galeria de fotos nos cards ---------- */
  function createGalleryButton(className, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gallery__btn ' + className;
    b.setAttribute('aria-label', label);
    b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
    return b;
  }

  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var track = gallery.querySelector('[data-gallery-track]');
    var photos = Array.prototype.slice.call(track.children);
    if (photos.length < 2) return;

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'gallery__dots';
    var dots = photos.map(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'gallery__dot';
      d.setAttribute('aria-label', 'Ver foto ' + (i + 1) + ' de ' + photos.length);
      d.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(d);
      return d;
    });
    var prev = createGalleryButton('gallery__btn--prev', 'Foto anterior');
    var next = createGalleryButton('gallery__btn--next', 'Próxima foto');
    gallery.append(prev, next, dotsWrap);

    var current = 0;
    function mark(i) {
      current = i;
      dots.forEach(function (d, j) { d.setAttribute('aria-current', String(i === j)); });
      prev.disabled = i === 0;
      next.disabled = i === photos.length - 1;
    }
    function goTo(i) {
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
      mark(i);
    }
    mark(0);

    prev.addEventListener('click', function () { goTo(Math.max(current - 1, 0)); });
    next.addEventListener('click', function () { goTo(Math.min(current + 1, photos.length - 1)); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(current + 1, photos.length - 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(current - 1, 0)); }
    });

    var raf;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        mark(Math.round(track.scrollLeft / track.clientWidth));
      });
    }, { passive: true });
  });

  /* ---------- Ano atual no rodapé ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
