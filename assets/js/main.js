/* ==========================================================================
   Kiboko Safaris — main.js
   Vanilla JS only. Handles UI behavior: sticky header state, mobile menu,
   dropdown accordions on mobile, scroll-reveal animations, gallery lightbox.
   No content is generated or injected here — all markup lives in index.html.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Hero slider ---------- */
  var heroSlides = document.querySelectorAll('.hero-slide');
  var heroDots = document.querySelectorAll('.hero__dot');
  var heroPrev = document.getElementById('heroPrev');
  var heroNext = document.getElementById('heroNext');
  var heroIndex = 0;
  var heroTimer;
  var heroHoverPaused = false;
  var heroFocusPaused = false;
  var heroPointerInteraction = false;
  var HERO_AUTOPLAY_DELAY = 7000;

  function goToHeroSlide(i) {
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === heroIndex);
    });
    heroDots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === heroIndex);
      dot.setAttribute('aria-selected', idx === heroIndex ? 'true' : 'false');
    });
  }

  function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroHoverPaused || heroFocusPaused) return;
    heroTimer = setInterval(function () { goToHeroSlide(heroIndex + 1); }, HERO_AUTOPLAY_DELAY);
  }
  function stopHeroAutoplay() { clearInterval(heroTimer); }

  if (heroSlides.length) {
    heroNext.addEventListener('click', function () { goToHeroSlide(heroIndex + 1); stopHeroAutoplay(); startHeroAutoplay(); });
    heroPrev.addEventListener('click', function () { goToHeroSlide(heroIndex - 1); stopHeroAutoplay(); startHeroAutoplay(); });
    heroDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToHeroSlide(Number(dot.getAttribute('data-dot')));
        stopHeroAutoplay(); startHeroAutoplay();
      });
    });
    var heroSection = document.getElementById('heroSlider');
    heroSection.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) {
        heroHoverPaused = true;
        stopHeroAutoplay();
      }
    });
    heroSection.addEventListener('mouseleave', function () {
      heroHoverPaused = false;
      startHeroAutoplay();
    });
    heroSection.addEventListener('focusin', function () {
      if (!heroPointerInteraction) {
        heroFocusPaused = true;
        stopHeroAutoplay();
      }
    });
    heroSection.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!heroSection.contains(document.activeElement)) {
          heroFocusPaused = false;
          startHeroAutoplay();
        }
      }, 0);
    });
    heroSection.addEventListener('pointerdown', function () {
      heroPointerInteraction = true;
      stopHeroAutoplay();
    });
    heroSection.addEventListener('pointerup', function () {
      heroPointerInteraction = false;
      startHeroAutoplay();
    });
    heroSection.addEventListener('pointercancel', function () {
      heroPointerInteraction = false;
      startHeroAutoplay();
    });
    startHeroAutoplay();
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  });

  /* Close mobile menu when a plain link (no dropdown) is tapped */
  primaryNav.querySelectorAll('a.primary-nav__link').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ---------- Dropdown accordions (mobile) / hover (desktop via CSS) ---------- */
  var dropdownParents = document.querySelectorAll('.has-dropdown');
  var subDropdownParents = document.querySelectorAll('.dropdown__has-sub');

  function closeAllSubmenus() {
    subDropdownParents.forEach(function (s) {
      s.classList.remove('is-open');
      s.querySelector(':scope > .dropdown__sub-trigger').setAttribute('aria-expanded', 'false');
    });
  }

  dropdownParents.forEach(function (parent) {
    var trigger = parent.querySelector(':scope > .primary-nav__link');
    trigger.addEventListener('click', function (e) {
      var isDesktop = window.matchMedia('(min-width: 1100px)').matches;
      if (isDesktop) e.preventDefault(); /* desktop: allow click as a hover fallback, not just CSS :hover / :focus-within */

      var isOpen = parent.classList.contains('is-open');
      dropdownParents.forEach(function (p) {
        p.classList.remove('is-open');
        p.querySelector(':scope > .primary-nav__link').setAttribute('aria-expanded', 'false');
      });
      closeAllSubmenus();
      if (!isOpen) {
        parent.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    /* Desktop: hovering a sibling item must close any dropdown left open by a click */
    parent.addEventListener('mouseenter', function () {
      var isDesktop = window.matchMedia('(min-width: 1100px)').matches;
      if (!isDesktop) return;
      dropdownParents.forEach(function (p) {
        if (p !== parent && p.classList.contains('is-open')) {
          p.classList.remove('is-open');
          p.querySelector(':scope > .primary-nav__link').setAttribute('aria-expanded', 'false');
          closeAllSubmenus();
        }
      });
    });
  });

  /* ---------- Destinations: nested circuit submenus ---------- */
  subDropdownParents.forEach(function (sub) {
    var subTrigger = sub.querySelector(':scope > .dropdown__sub-trigger');
    subTrigger.addEventListener('click', function (e) {
      e.preventDefault(); /* toggles the nested submenu (desktop flyout / mobile accordion) */
      var isOpen = sub.classList.contains('is-open');
      sub.parentElement.querySelectorAll(':scope > .dropdown__has-sub').forEach(function (s) {
        s.classList.remove('is-open');
        s.querySelector(':scope > .dropdown__sub-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        sub.classList.add('is-open');
        subTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    /* Desktop: hovering a sibling circuit must close any submenu left open by a click */
    sub.addEventListener('mouseenter', function () {
      var isDesktop = window.matchMedia('(min-width: 1100px)').matches;
      if (!isDesktop) return;
      sub.parentElement.querySelectorAll(':scope > .dropdown__has-sub').forEach(function (s) {
        if (s !== sub && s.classList.contains('is-open')) {
          s.classList.remove('is-open');
          s.querySelector(':scope > .dropdown__sub-trigger').setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  /* Desktop: clicking outside the nav closes any dropdown left open by a click */
  document.addEventListener('click', function (e) {
    var isDesktop = window.matchMedia('(min-width: 1100px)').matches;
    if (!isDesktop) return;
    if (primaryNav.contains(e.target)) return;
    dropdownParents.forEach(function (p) {
      if (p.classList.contains('is-open')) {
        p.classList.remove('is-open');
        p.querySelector(':scope > .primary-nav__link').setAttribute('aria-expanded', 'false');
      }
    });
    closeAllSubmenus();
  });

  /* Reset mobile menu / dropdown state when resizing past the desktop breakpoint */
  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 1100px)').matches) {
      closeMobileMenu();
      dropdownParents.forEach(function (p) { p.classList.remove('is-open'); });
      closeAllSubmenus();
    }
  });

  /* ---------- Scroll-reveal animation ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Gallery: view more ---------- */
  var galleryViewMoreBtn = document.getElementById('galleryViewMore');
  var galleryHiddenItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item[hidden]'));
  if (galleryViewMoreBtn) {
    galleryViewMoreBtn.addEventListener('click', function () {
      galleryHiddenItems.forEach(function (item) {
        item.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { item.classList.add('in-view'); });
        });
      });
      galleryViewMoreBtn.hidden = true;
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lightboxIndex = 0;

  function updateLightboxImage() {
    var item = galleryItems[lightboxIndex];
    var fullSrc = item.getAttribute('data-full');
    var altText = item.querySelector('img').getAttribute('alt');
    lightboxImage.setAttribute('src', fullSrc);
    lightboxImage.setAttribute('alt', altText);
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + galleryItems.length;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    updateLightboxImage();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function stepLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
    updateLightboxImage();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.setAttribute('src', '');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(function (item, idx) {
    item.addEventListener('click', function () { openLightbox(idx); });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(-1); });
  lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  /* Swipe navigation on touch devices */
  var lightboxTouchStartX = null;
  lightbox.addEventListener('touchstart', function (e) {
    lightboxTouchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (lightboxTouchStartX === null) return;
    var dx = e.changedTouches[0].clientX - lightboxTouchStartX;
    if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
    lightboxTouchStartX = null;
  }, { passive: true });

  /* ---------- Testimonial carousel ---------- */
  var testiTrack = document.getElementById('testimonialsTrack');
  if (testiTrack) {
    var testiCards = Array.prototype.slice.call(testiTrack.children);
    var testiDotsWrap = document.getElementById('testimonialsDots');
    var testiPrev = document.getElementById('testiPrev');
    var testiNext = document.getElementById('testiNext');
    var testiCarousel = document.getElementById('testimonialsCarousel');
    var testiIndex = 0;
    var testiPerView = 1;
    var testiTimer;

    function getPerView() {
      if (window.matchMedia('(min-width: 1000px)').matches) return 3;
      if (window.matchMedia('(min-width: 640px)').matches) return 2;
      return 1;
    }

    function testiMaxIndex() {
      return Math.max(0, testiCards.length - testiPerView);
    }

    function renderTestiDots() {
      testiDotsWrap.innerHTML = '';
      var count = testiMaxIndex() + 1;
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('button');
        dot.className = 'testimonials__dot' + (i === testiIndex ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Show review ' + (i + 1));
        dot.setAttribute('aria-selected', i === testiIndex ? 'true' : 'false');
        dot.addEventListener('click', function (idx) {
          return function () { goToTesti(idx); stopTestiAutoplay(); startTestiAutoplay(); };
        }(i));
        testiDotsWrap.appendChild(dot);
      }
    }

    function updateTestiDots() {
      Array.prototype.forEach.call(testiDotsWrap.children, function (dot, i) {
        dot.classList.toggle('is-active', i === testiIndex);
        dot.setAttribute('aria-selected', i === testiIndex ? 'true' : 'false');
      });
    }

    function goToTesti(i) {
      testiIndex = Math.max(0, Math.min(i, testiMaxIndex()));
      var card = testiCards[0];
      var gap = parseFloat(getComputedStyle(testiTrack).gap) || 0;
      var step = card.getBoundingClientRect().width + gap;
      testiTrack.style.transform = 'translateX(' + (-testiIndex * step) + 'px)';
      updateTestiDots();
    }

    function testiStep(dir) {
      var next = testiIndex + dir;
      if (next > testiMaxIndex()) next = 0;
      if (next < 0) next = testiMaxIndex();
      goToTesti(next);
    }

    function startTestiAutoplay() {
      stopTestiAutoplay();
      testiTimer = setInterval(function () { testiStep(1); }, 5000);
    }
    function stopTestiAutoplay() { clearInterval(testiTimer); }

    function refreshTesti() {
      testiPerView = getPerView();
      renderTestiDots();
      goToTesti(Math.min(testiIndex, testiMaxIndex()));
    }

    refreshTesti();
    startTestiAutoplay();

    testiNext.addEventListener('click', function () { testiStep(1); stopTestiAutoplay(); startTestiAutoplay(); });
    testiPrev.addEventListener('click', function () { testiStep(-1); stopTestiAutoplay(); startTestiAutoplay(); });
    testiCarousel.addEventListener('mouseenter', stopTestiAutoplay);
    testiCarousel.addEventListener('mouseleave', startTestiAutoplay);
    window.addEventListener('resize', refreshTesti);
  }

})();
