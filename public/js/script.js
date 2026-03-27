// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Fix 100vh issues on mobile browsers by using a CSS variable.
(() => {
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight, { passive: true });
  window.addEventListener('orientationchange', setViewportHeight, { passive: true });
})();

// Navbar menu popup toggle for login/logout actions.
(() => {
  const closeAllPopups = () => {
    const openWraps = document.querySelectorAll('.menu-popup-wrap.open');
    openWraps.forEach((wrap) => {
      wrap.classList.remove('open');
      const btn = wrap.querySelector('[data-menu-toggle]');
      const popup = wrap.querySelector('[data-menu-popup]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (popup) popup.setAttribute('aria-hidden', 'true');
    });
  };

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-menu-toggle]');

    if (toggle) {
      const wrap = toggle.closest('.menu-popup-wrap');
      if (!wrap) return;

      const popup = wrap.querySelector('[data-menu-popup]');
      const isOpen = wrap.classList.contains('open');

      closeAllPopups();

      if (!isOpen) {
        wrap.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        if (popup) popup.setAttribute('aria-hidden', 'false');
      }
      return;
    }

    if (!event.target.closest('.menu-popup-wrap')) {
      closeAllPopups();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllPopups();
  });
})();

// Shrink navbar on scroll to mimic Airbnb compact header behavior.
(() => {
  const header = document.querySelector('.airbnb-header');
  const sentinel = document.querySelector('.navbar-scroll-sentinel');
  if (!header) return;

  const threshold = 10;
  let rafId = 0;

  const setCompactState = (isCompact) => {
    header.classList.toggle('is-compact', isCompact);
  };

  const updateHeaderState = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    setCompactState(scrollTop > threshold);
    rafId = 0;
  };

  const queueUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(updateHeaderState);
  };

  // Observer is helpful when available, but scroll fallback stays active always.
  if ('IntersectionObserver' in window && sentinel) {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setCompactState(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-8px 0px 0px 0px'
      }
    );
    observer.observe(sentinel);
  }

  updateHeaderState();
  window.addEventListener('load', updateHeaderState);
  window.addEventListener('resize', queueUpdate);
  window.addEventListener('wheel', queueUpdate, { passive: true });
  window.addEventListener('touchmove', queueUpdate, { passive: true });
  window.addEventListener('scroll', queueUpdate, { passive: true });
  document.addEventListener('scroll', queueUpdate, { passive: true });

  // Last-resort sync in environments with aggressive throttling.
  setInterval(updateHeaderState, 300);
})();