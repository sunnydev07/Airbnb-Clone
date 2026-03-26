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