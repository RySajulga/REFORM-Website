const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Header shrinks + gains a shadow once the page scrolls
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const updateHeaderState = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

// Reveal-on-scroll, staggered by position within each group
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  const groupCounts = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const index = groupCounts.get(parent) || 0;
    if (!prefersReducedMotion) {
      el.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    }
    groupCounts.set(parent, index + 1);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }
}

// Hero parallax: scroll drift + subtle cursor tilt on the product photo
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero-media');
const heroType = document.querySelector('.hero-type');

if (hero && heroMedia && !prefersReducedMotion) {
  let scrollOffset = 0;
  let tiltX = 0;
  let tiltY = 0;
  let scrollTicking = false;

  const renderHeroTransform = () => {
    heroMedia.style.transform = `translateY(${scrollOffset}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    if (heroType) heroType.style.transform = `translateY(${scrollOffset * -0.6}px)`;
  };

  const updateScrollOffset = () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
    scrollOffset = progress * 40;
    renderHeroTransform();
    scrollTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        requestAnimationFrame(updateScrollOffset);
        scrollTicking = true;
      }
    },
    { passive: true }
  );
  updateScrollOffset();

  if (canHover) {
    hero.addEventListener('mousemove', (event) => {
      const rect = heroMedia.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      tiltY = x * 10;
      tiltX = y * -10;
      renderHeroTransform();
    });

    hero.addEventListener('mouseleave', () => {
      tiltX = 0;
      tiltY = 0;
      renderHeroTransform();
    });
  }
}

// Magnetic pull on primary buttons
if (canHover && !prefersReducedMotion) {
  document.querySelectorAll('.btn-primary, .btn-inverse').forEach((btn) => {
    const strength = 14;

    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Newsletter form (no backend yet — just acknowledge the submission)
const ctaForm = document.getElementById('cta-form');
const ctaNote = document.getElementById('cta-note');

if (ctaForm && ctaNote) {
  ctaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    ctaNote.textContent = "You're on the list. We'll be in touch.";
    ctaForm.reset();
  });
}
