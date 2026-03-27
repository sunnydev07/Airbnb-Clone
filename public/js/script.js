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
})();

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

// ── Search Dropdown Panels ───────────────────────────
(() => {
  console.log("AIRBNB SEARCH PANELS INIT");
  const allWraps = document.querySelectorAll('.search-segment-wrap');
  console.log("Found panels:", allWraps.length);

  const closeAll = () => {
    allWraps.forEach(w => w.classList.remove('is-active'));
  };

  // Toggle panels on click
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-panel-toggle]');
    if (toggle) {
      console.log("TOGGLE CLICKED", toggle.dataset.panelToggle);
      e.preventDefault();
      e.stopPropagation();
      const wrap = toggle.closest('.search-segment-wrap');
      const wasOpen = wrap.classList.contains('is-active');
      closeAll();
      if (!wasOpen) {
        wrap.classList.add('is-active');
        // Init calendar if opening When panel
        if (wrap.dataset.panel === 'when') initCalendar();
      }
      return;
    }

    // Click inside dropdown should not close it
    if (e.target.closest('.search-dropdown')) return;

    // Click outside closes all
    if (!e.target.closest('.search-segment-wrap')) {
      closeAll();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // ── WHERE: destination selection ──
  document.querySelectorAll('.dest-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = item.dataset.dest;
      const val = document.getElementById('where-value');
      if (val) val.textContent = dest;
      closeAll();
    });
  });

  // ── WHEN: calendar ──
  let calYear, calMonth, selectedDate = null;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function initCalendar() {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
    fillQuickPicks();
  }

  function renderCalendar() {
    const label = document.getElementById('cal-month-year');
    const grid = document.getElementById('cal-days');
    if (!label || !grid) return;

    label.textContent = `${monthNames[calMonth]} ${calYear}`;
    grid.innerHTML = '';

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.className = 'cal-day';
      btn.textContent = d;
      btn.type = 'button';

      const thisDate = new Date(calYear, calMonth, d);
      thisDate.setHours(0,0,0,0);

      if (thisDate < today) btn.classList.add('past');
      if (thisDate.getTime() === today.getTime()) btn.classList.add('today');
      if (selectedDate && thisDate.getTime() === selectedDate.getTime()) btn.classList.add('selected');

      btn.addEventListener('click', () => {
        selectedDate = thisDate;
        const val = document.getElementById('when-value');
        if (val) val.textContent = `${d} ${shortMonths[calMonth]}`;
        renderCalendar();
        // Remove quick pick highlights
        document.querySelectorAll('.quick-pick').forEach(qp => qp.classList.remove('selected'));
      });

      grid.appendChild(btn);
    }
  }

  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

  function fillQuickPicks() {
    const now = new Date();
    const todayEl = document.getElementById('pick-today');
    const tomorrowEl = document.getElementById('pick-tomorrow');
    const weekendEl = document.getElementById('pick-weekend');

    if (todayEl) todayEl.textContent = `${now.getDate()} ${shortMonths[now.getMonth()]}`;

    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    if (tomorrowEl) tomorrowEl.textContent = `${tmrw.getDate()} ${shortMonths[tmrw.getMonth()]}`;

    // Find next Saturday
    const sat = new Date(now);
    sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7));
    const sun = new Date(sat);
    sun.setDate(sun.getDate() + 1);
    if (weekendEl) weekendEl.textContent = `${sat.getDate()}–${sun.getDate()} ${shortMonths[sat.getMonth()]}`;
  }

  document.querySelectorAll('.quick-pick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pick = btn.dataset.pick;
      const val = document.getElementById('when-value');
      document.querySelectorAll('.quick-pick').forEach(qp => qp.classList.remove('selected'));
      btn.classList.add('selected');

      const now = new Date();
      if (pick === 'today') {
        selectedDate = new Date(now);
        if (val) val.textContent = `${now.getDate()} ${shortMonths[now.getMonth()]}`;
      } else if (pick === 'tomorrow') {
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        selectedDate = tmrw;
        if (val) val.textContent = `${tmrw.getDate()} ${shortMonths[tmrw.getMonth()]}`;
      } else if (pick === 'weekend') {
        const sat = new Date(now);
        sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7));
        const sun = new Date(sat); sun.setDate(sun.getDate() + 1);
        selectedDate = sat;
        if (val) val.textContent = `${sat.getDate()}–${sun.getDate()} ${shortMonths[sat.getMonth()]}`;
      }
      // Re-render calendar to show selection
      calYear = selectedDate.getFullYear();
      calMonth = selectedDate.getMonth();
      renderCalendar();
    });
  });

  // ── WHO: guest counters ──
  const guests = { adults: 0, children: 0, infants: 0 };

  function updateGuestDisplay() {
    Object.keys(guests).forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = guests[key];
      // Toggle disabled class on dec button
      const decBtn = document.querySelector(`.counter-btn[data-guest="${key}"][data-action="dec"]`);
      if (decBtn) decBtn.classList.toggle('disabled', guests[key] === 0);
    });

    const val = document.getElementById('who-value');
    if (!val) return;
    const parts = [];
    if (guests.adults) parts.push(`${guests.adults} Adult${guests.adults > 1 ? 's' : ''}`);
    if (guests.children) parts.push(`${guests.children} Child${guests.children > 1 ? 'ren' : ''}`);
    if (guests.infants) parts.push(`${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`);
    val.textContent = parts.length ? parts.join(', ') : 'Add guests';
  }

  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.guest;
      const action = btn.dataset.action;
      if (action === 'inc') guests[key]++;
      if (action === 'dec' && guests[key] > 0) guests[key]--;
      updateGuestDisplay();
    });
  });

  // Init disabled states
  updateGuestDisplay();
})();