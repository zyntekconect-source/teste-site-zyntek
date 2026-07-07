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
  const sections = ['home', 'beneficios', 'planos', 'contato']
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
     SWITCHER DE PLANOS (VENDA FECHADA x VENDA HÍBRIDA)
  --------------------------------------------------------- */
  const btnFechada = document.getElementById('btn-fechada');
  const btnHibrida = document.getElementById('btn-hibrida');
  const gridFechada = document.getElementById('grid-fechada');
  const gridHibrida = document.getElementById('grid-hibrida');

  function toggleModel(model) {
    const showEl = model === 'fechada' ? gridFechada : gridHibrida;
    const hideEl = model === 'fechada' ? gridHibrida : gridFechada;
    const showBtn = model === 'fechada' ? btnFechada : btnHibrida;
    const hideBtn = model === 'fechada' ? btnHibrida : btnFechada;

    if (!showEl.hasAttribute('hidden')) return;

    hideEl.classList.add('is-hiding');

    window.setTimeout(() => {
      hideEl.setAttribute('hidden', '');
      showEl.removeAttribute('hidden');
      // força reflow para reiniciar a transição de entrada
      void showEl.offsetWidth;
      showEl.classList.remove('is-hiding');
    }, 250);

    showBtn.classList.add('active');
    hideBtn.classList.remove('active');
    showBtn.setAttribute('aria-selected', 'true');
    hideBtn.setAttribute('aria-selected', 'false');
  }

  btnFechada.addEventListener('click', () => toggleModel('fechada'));
  btnHibrida.addEventListener('click', () => toggleModel('hibrida'));

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

    let texto = `Olá, equipe Zyntek! 🚀\n\n`;
    texto += `*Nome:* ${nome}\n`;
    if (empresa) texto += `*Empresa:* ${empresa}\n`;
    texto += `*Telefone:* ${telefone}\n`;
    texto += `*Tipo de solicitação:* ${tipo}\n`;
    texto += `*Mensagem:* ${mensagem}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

});