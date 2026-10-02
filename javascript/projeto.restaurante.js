document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     TEMA CLARO / ESCURO
  --------------------------------------------------------- */
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('zyntek-theme');

  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    body.setAttribute('data-theme', 'light');
  }

  function updateThemeButton() {
    const isLight = body.getAttribute('data-theme') === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Alternar para modo escuro' : 'Alternar para modo claro');
  }
  updateThemeButton();

  themeToggle.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    localStorage.setItem('zyntek-theme', next);
    updateThemeButton();
  });

  /* ---------------------------------------------------------
     SIDEBAR LATERAL (MENU MOBILE)
  --------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar-lateral');
  const overlay = document.getElementById('sidebar-overlay');
  const closeSidebar = document.getElementById('close-sidebar');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    sidebar.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeSidebarMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    sidebar.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }

  menuToggle.addEventListener('click', openSidebar);
  closeSidebar.addEventListener('click', closeSidebarMenu);
  overlay.addEventListener('click', closeSidebarMenu);

  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebarMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebarMenu();
  });

  /* ---------------------------------------------------------
     NAV ATIVO CONFORME SCROLL
  --------------------------------------------------------- */
  const sections = ['home', 'beneficios', 'formatos', 'contato']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    let current = sections[0]?.id;
    const scrollPos = window.scrollY + 140;
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------------------------------------------------------
     FORMULÁRIO DE CONTATO -> ENVIA PARA O WHATSAPP
  --------------------------------------------------------- */
  const form = document.getElementById('zyntekForm');
  const WHATSAPP_NUMBER = '554488317870';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nome = form.nome.value.trim();
    const empresa = form.empresa.value.trim();
    const telefone = form.telefone.value.trim();
    const mensagem = form.mensagem.value.trim();
    const tipo = form.tipo_solicitacao.value;

    let texto = `Olá, equipe Zyntek! 🍽️\n\n`;
    texto += `Tenho interesse em um *Sistema para Restaurante*.\n\n`;
    texto += `*Nome:* ${nome}\n`;
    if (empresa) texto += `*Empresa:* ${empresa}\n`;
    texto += `*Telefone:* ${telefone}\n`;
    texto += `*Tipo de solicitação:* ${tipo}\n`;
    texto += `*Mensagem:* ${mensagem}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* ---------------------------------------------------------
     FUNDO — REDE DE PONTOS CONECTADOS (CANVAS)
  --------------------------------------------------------- */
  const canvas = document.getElementById('bg-particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

});