document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     NAV ATIVO CONFORME SCROLL (seções desta página)
  --------------------------------------------------------- */
  const sections = ['home', 'fundamentos', 'processo', 'operacao', 'comparativo', 'contato']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-lateral-link, .page-toc a');

  function setActiveLink() {
    if (!sections.length) return;
    let current = sections[0].id;
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) current = section.id;
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
      link.classList.toggle('is-active', isActive);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     CONTADORES ANIMADOS (bloco de estatísticas)
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      const prefix = el.getAttribute('data-count-prefix') || '';
      const decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals'), 10) : 0;
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(el => counterIo.observe(el));
  }

  /* ---------------------------------------------------------
     BARRAS DO MOCKUP DE SISTEMA — alturas aleatórias sutis
  --------------------------------------------------------- */
  document.querySelectorAll('.sw-dashboard-chart i').forEach(bar => {
    const h = 35 + Math.random() * 55;
    bar.style.height = `${h}%`;
  });

});