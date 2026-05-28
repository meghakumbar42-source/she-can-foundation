/* ============================================================
   SHE CAN FOUNDATION — script.js
   Features:
   - Sticky Navbar (scroll class + active links)
   - Dark/Light Mode Toggle (localStorage)
   - Mobile Hamburger Menu
   - Scroll Reveal Animations
   - Animated Counters (scroll-triggered)
   - Form Submission (success animation)
   - Back to Top Button
   ============================================================ */

/* ---- Helpers ---- */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ============================================================
   1. NAVBAR — Scroll Behaviour + Active Link Highlight
   ============================================================ */
const navbar   = $('#navbar');
const navLinks = $$('.nav-link');

function updateNavbar() {
  // Add .scrolled class when page scrolls
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Highlight active nav link based on current section
  const sections = $$('section[id]');
  let currentId = '';
  sections.forEach((section) => {
    const top    = section.offsetTop - 120;
    const bottom = top + section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateNavbar);
updateNavbar(); // Run on load

/* ============================================================
   2. DARK MODE TOGGLE
   ============================================================ */
const themeToggle = $('#themeToggle');
const themeIcon   = $('#themeIcon');
const html        = document.documentElement;

// Read saved theme from localStorage (default: light)
const savedTheme = localStorage.getItem('shecan-theme') || 'light';
applyTheme(savedTheme);

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    themeIcon.className = 'ph ph-moon';
  } else {
    themeIcon.className = 'ph ph-sun';
  }
  localStorage.setItem('shecan-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ============================================================
   3. HAMBURGER MENU — Mobile Nav Toggle
   ============================================================ */
const hamburger  = $('#hamburger');
const mobileMenu = $('#navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  // Toggle aria-expanded for accessibility
  const isOpen = mobileMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a nav link is clicked
$$('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }
});

/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
   ============================================================ */
const revealElements = $$('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(delay, 400)); // Cap delay at 400ms
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ============================================================
   5. ANIMATED COUNTERS — Scroll-triggered
   ============================================================ */
const counters = $$('.counter');
let countersStarted = false;

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000; // ms
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(update);
}

const statsSection = $('.stats');
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach((counter) => animateCounter(counter));
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

if (statsSection) statsObserver.observe(statsSection);

/* ============================================================
   6. CONTACT FORM — Static Success Animation
   ============================================================ */
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple validation
    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name || !email || !message) {
      // Shake the form lightly if fields are missing
      contactForm.style.animation = 'shake .4s ease';
      setTimeout(() => { contactForm.style.animation = ''; }, 400);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#email').focus();
      $('#email').style.borderColor = '#ef4444';
      setTimeout(() => { $('#email').style.borderColor = ''; }, 2000);
      return;
    }

    // Show success state
    contactForm.style.display = 'none';
    formSuccess.classList.add('visible');

    // Confetti burst (lightweight CSS-based dots)
    launchConfetti();
  });
}

/* Reset form helper (called by "Send Another Message" button) */
function resetForm() {
  if (!contactForm || !formSuccess) return;
  contactForm.reset();
  contactForm.style.display = 'flex';
  formSuccess.classList.remove('visible');
}

/* Lightweight canvas-free confetti */
function launchConfetti() {
  const colors = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
  const container = formSuccess;

  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: 40%;
      pointer-events: none;
      animation: confettiFly ${0.8 + Math.random() * 0.8}s ease-out forwards;
      animation-delay: ${Math.random() * 0.3}s;
      --tx: ${(Math.random() - 0.5) * 160}px;
      --ty: ${-60 - Math.random() * 100}px;
    `;
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 1800);
  }
}

// Inject confetti keyframe once
(function injectConfettiStyle() {
  if (document.getElementById('confetti-style')) return;
  const style = document.createElement('style');
  style.id = 'confetti-style';
  style.textContent = `
    @keyframes confettiFly {
      from { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
      to   { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(.5) rotate(360deg); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
const backToTopBtn = $('#backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   8. SMOOTH SCROLL for anchor links
   ============================================================ */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // Navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   9. INPUT FOCUS — Remove red border on re-focus
   ============================================================ */
$$('.form-group input, .form-group textarea, .form-group select').forEach((input) => {
  input.addEventListener('focus', () => {
    input.style.borderColor = '';
  });
});

/* ============================================================
   10. NAVBAR LOGO scroll to top
   ============================================================ */
const navLogo = $('.nav-logo');
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Init log ---- */
console.log('%c✦ She Can Foundation', 'color:#7c3aed;font-size:16px;font-weight:700;');
console.log('%cBuilt with ♥ — Empowering Women. Transforming Communities.', 'color:#ec4899;');
