/* ============================================================
   Pawz Riverside — main.js
   Nav toggle, scroll effects, fade-in, FAQ accordion, lightbox
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Active nav link
  ---------------------------------------------------------- */
  function setActiveNav() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === currentFile || (currentFile === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     Nav shadow on scroll
  ---------------------------------------------------------- */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Mobile hamburger toggle
  ---------------------------------------------------------- */
  function initHamburger() {
    const hamburger = document.querySelector('.nav__hamburger');
    if (!hamburger) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    hamburger.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    document.querySelectorAll('.nav__mobile a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('click', function (e) {
      const nav = document.querySelector('.nav');
      if (document.body.classList.contains('nav-open') && nav && !nav.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  /* ----------------------------------------------------------
     Smooth scroll for anchor links
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
          10
        );
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     IntersectionObserver fade-in
  ---------------------------------------------------------- */
  function initFadeIn() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------------------------------------------
     FAQ accordion
  ---------------------------------------------------------- */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      const btn = item.querySelector('.faq-item__question');
      if (!btn) return;
      btn.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(function (i) { i.classList.remove('open'); });
        // Toggle clicked
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ----------------------------------------------------------
     Lightbox for gallery
  ---------------------------------------------------------- */
  function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    // Build image data array
    const images = Array.from(galleryItems).map(function (item) {
      const img = item.querySelector('img');
      return {
        src:     img ? img.src     : item.dataset.src || '',
        alt:     img ? img.alt     : '',
        caption: item.dataset.caption || (img ? img.alt : '') || ''
      };
    });

    // Create overlay DOM
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Photo viewer');
    overlay.innerHTML = [
      '<button class="lightbox-close" aria-label="Close photo viewer">&times;</button>',
      '<button class="lightbox-prev" aria-label="Previous photo">&#8249;</button>',
      '<button class="lightbox-next" aria-label="Next photo">&#8250;</button>',
      '<div class="lightbox-content">',
      '  <img class="lightbox-img" src="" alt="" />',
      '  <p class="lightbox-caption"></p>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    const imgEl  = overlay.querySelector('.lightbox-img');
    const capEl  = overlay.querySelector('.lightbox-caption');
    let current  = 0;

    function show(index) {
      current = (index + images.length) % images.length;
      if (images[current].src) {
        imgEl.src = images[current].src;
        imgEl.alt = images[current].alt;
        imgEl.style.display = '';
      } else {
        imgEl.style.display = 'none';
      }
      capEl.textContent = images[current].caption;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.lightbox-close').focus();
    }

    function close() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener('click', function () { show(i); });
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
      });
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
    overlay.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   show(current - 1);
      if (e.key === 'ArrowRight')  show(current + 1);
    });
  }

  /* ----------------------------------------------------------
     Contact form: date minimum + basic validation
  ---------------------------------------------------------- */
  function initContactForm() {
    const dateInput = document.getElementById('preferred-date');
    if (dateInput) {
      dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
    }

    const form = document.querySelector('.contact-form form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      let valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          valid = false;
        }
      });
      if (!valid) {
        e.preventDefault();
        const first = Array.from(form.querySelectorAll('[required]')).find(function (f) {
          return !f.value.trim();
        });
        if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }
    });
  }

  /* ----------------------------------------------------------
     Footer year
  ---------------------------------------------------------- */
  function setFooterYear() {
    document.querySelectorAll('.footer-year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ----------------------------------------------------------
     Init
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initNavScroll();
    initHamburger();
    initSmoothScroll();
    initFadeIn();
    initFaq();
    initLightbox();
    initContactForm();
    setFooterYear();
  });
})();
