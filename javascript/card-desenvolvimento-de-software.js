document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     HERO — compatibilidade vídeo/foto
     Se o vídeo não existir ou não conseguir carregar, o box
     mostra a foto (poster) no lugar, preenchendo o mesmo
     espaço, sem quebrar o layout.
  --------------------------------------------------------- */
  const heroVideoBox = document.querySelector('.hero-video-box');
  const heroVideo = heroVideoBox ? heroVideoBox.querySelector('[data-hero-video]') : null;

  if (heroVideoBox && heroVideo) {
    const switchToPhoto = () => heroVideoBox.classList.add('is-photo-mode');
    const switchToVideo = () => heroVideoBox.classList.remove('is-photo-mode');

    heroVideo.addEventListener('error', switchToPhoto);
    heroVideo.querySelectorAll('source').forEach(src => src.addEventListener('error', switchToPhoto));
    heroVideo.addEventListener('playing', switchToVideo);
    heroVideo.addEventListener('stalled', switchToPhoto);

    // Se em 2.5s o vídeo não tiver dados suficientes pra tocar, assume modo foto
    setTimeout(() => {
      if (heroVideo.readyState < 2) switchToPhoto();
    }, 2500);
  }

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

  /* ---------------------------------------------------------
     FUNDO — rede de pontos conectados (canvas)
  --------------------------------------------------------- */
  initBackgroundParticles();

});

/* ==============================================================
   FUNDO — REDE DE PONTOS CONECTADOS
   (mesma animação da página inicial)
   ============================================================== */
function initBackgroundParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width, height, points;
  const DENSITY = 14000;   // px² por ponto — maior = menos pontos
  const LINK_DIST = 150;   // distância máxima para desenhar uma linha
  const SPEED = 0.18;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    const total = Math.max(24, Math.min(90, Math.round((width * height) / DENSITY)));
    points = Array.from({ length: total }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(124, 58, 237, ${1 - dist / LINK_DIST})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    points.forEach((p) => {
      ctx.fillStyle = 'rgba(196, 181, 253, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  requestAnimationFrame(step);
}