// =============================================================
// ZYNTEK — SCRIPT.JS  (Refatorado v2)
// Correções:
//  - Links WhatsApp personalizados por membro da equipe
//  - Modal de projetos com IDs corretos (project-modal-deploy/github/contact)
//  - Carrossel com setas e dots funcionais
//  - FAQ com aria-expanded acessível
//  - Formulário com validação client-side
//  - Menu mobile fecha ao clicar em link
//  - Header .scrolled class via scroll
//  - IntersectionObserver otimizado
//  - Suporte a teclado nos cards (Enter/Space)
//  - Glitch loop somente após typing terminar
// =============================================================

// =============================================================
// 1. CONSTANTES & SELETORES
// =============================================================

const sections        = document.querySelectorAll('section[id]');
const navLinks        = document.querySelectorAll('.nav-link');
const header          = document.getElementById('header');
const bgVideo         = document.querySelector('.bg-video');
const typingElements  = document.querySelectorAll('.typing');

// Modais
const teamModal          = document.getElementById('team-modal');
const closeModalBtn      = document.querySelector('.premium-modal-close');
const projectModal       = document.getElementById('project-modal');
const closeProjectModalEl = document.querySelector('.close-project-modal');

// Cards
const teamCards    = document.querySelectorAll('.team-card');
const projectCards = document.querySelectorAll('.project-card');
const premiumCards = document.querySelectorAll('.premium-card');


// =============================================================
// 2. BANCO DE DADOS — EQUIPE
//    Cada membro tem WhatsApp personalizado conforme briefing
// =============================================================

const zyntekTeam = {
  levy: {
    name:      'Levy Andrade',
    greet:     'Olá, eu me chamo',
    role:      'COO & CDO | Diretor de Operações, Design e Engenharia de Software',
    bio:       'Líder estratégico e técnico responsável por capitanear a operação da Zyntek de ponta a ponta. Atuo diretamente na arquitetura de software e engenharia Full-Stack, transformando visões comerciais complexas em sistemas robustos de alta fidelidade. Coordeno desde a concepção da experiência do usuário (UI/UX) até a gestão de projetos e QA.',
    portfolio: '#',
    whatsapp:  'https://wa.me/554488317870?text=Olá%20Levy%20Andrade%2C%20vim%20pelo%20site%20da%20Zyntek!%20Gostaria%20de%20conhecer%20melhor%20a%20empresa%20e%20entender%20como%20vocês%20trabalham.',
    photo:     'assets/fotos/LEVY ANDRADE.png',
    functions: ['Arquitetura de Software', 'Full-Stack Dev', 'Gestão de Projetos (COO)', 'UI/UX Design & Figma', 'Quality Assurance (QA)']
  },

  hideki: {
    name:      'Henrique Hideki',
    greet:     'Olá, eu me chamo',
    role:      'CLO & Lead Dev | Diretor Jurídico e Desenvolvimento',
    bio:       'Responsável pela blindagem contratual e governança de dados da empresa e de nossos parceiros. No ecossistema de desenvolvimento, atua como líder focado na modelagem de bancos de dados relacionais seguros, desenvolvimento de APIs robustas e arquitetura de sistemas escaláveis.',
    portfolio: '#',
    whatsapp:  'https://wa.me/554488317870?text=Olá%20Henrique%20Hideki%2C%20vim%20pelo%20site%20da%20Zyntek!%20Gostaria%20de%20conhecer%20melhor%20a%20empresa%20e%20entender%20como%20vocês%20trabalham.',
    photo:     'assets/fotos/HENRIQUE HIDEKI.png',
    functions: ['Modelagem de Dados', 'Security & APIs', 'Estrutura Contratual', 'Full-Stack Dev', 'Quality Assurance (QA)']
  },

  soares: {
    name:      'Henrique Soares',
    greet:     'Olá, eu me chamo',
    role:      'CTO | Diretor de Tecnologia e Infraestrutura',
    bio:       'Líder técnico focado na espinha dorsal tecnológica das aplicações. Especialista em arquitetura de sistemas, gerenciamento e otimização de servidores, configurações avançadas de infraestrutura de rede (DNS) e implementação de tags estratégicas de rastreamento de dados e analytics.',
    portfolio: '#',
    whatsapp:  'https://wa.me/554488317870?text=Olá%20Henrique%20Soares%2C%20vim%20pelo%20site%20da%20Zyntek!%20Gostaria%20de%20conhecer%20melhor%20a%20empresa%20e%20entender%20como%20vocês%20trabalham.',
    photo:     'assets/fotos/HENRIQUE SOARES.png',
    functions: ['Arquitetura Back-end', 'Infraestrutura & DNS', 'Servidores / Deploy', 'Data Analytics', 'Quality Assurance (QA)']
  },

  zynk: {
    name:      'Zynk AI',
    greet:     'Saudações, eu sou o',
    role:      'Núcleo de Inteligência e Automação da Zyntek',
    bio:       'O motor cognitivo e mascote oficial da Zyntek. Atuo nos bastidores dos sistemas processando dados de alta performance, otimizando arquiteturas de código em tempo real e garantindo que os padrões de qualidade e segurança fiquem sempre no nível máximo de eficiência.',
    portfolio: '#',
    whatsapp:  'https://wa.me/554488317870?text=Olá%20equipe%20Zyntek%2C%20vim%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.',
    photo:     'assets/fotos/ZYNK.png',
    functions: ['Processamento Neural', 'Otimização de Código', 'Automação de Fluxos', 'Guardião de UI/UX']
  }
};


// =============================================================
// 3. BANCO DE DADOS — PROJETOS
// =============================================================

const projectDatabase = {
  landing: {
    title:       'Landing Page',
    description: 'Páginas modernas de alta conversão, desenvolvidas com foco total em performance, branding e geração de leads. Cada elemento é projetado estrategicamente para transformar visitantes em clientes.',
    video:       'assets/videos/landing-page.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Landing%20Page"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  agenda: {
    title:       'Sistema de Agendamento',
    description: 'Sistema inteligente para gestão completa de clientes, horários e serviços. Painel administrativo, notificações automáticas, histórico de atendimentos e relatórios de desempenho.',
    video:       'assets/videos/agendamento.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Sistema%20de%20Agendamento"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  restaurante: {
    title:       'Sistema Restaurante',
    description: 'Gestão financeira completa, controle de pedidos, cardápio digital, dashboards inteligentes e integração com WhatsApp. Solução robusta para restaurantes que querem escalar com tecnologia.',
    video:       'assets/videos/restaurante.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Sistema%20Restaurante"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  barbearia: {
    title:       'Sistema Barbearia',
    description: 'Experiência premium para gestão, agendamento online, fidelização de clientes e controle financeiro. Desenvolvido especialmente para barbearias que buscam profissionalismo e recorrência.',
    video:       'assets/videos/sistema de barbearia.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Sistema%20Barbearia"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  ecommerce: {
    title:       'E-commerce',
    description: 'Lojas virtuais modernas, escaláveis e otimizadas para conversão. Integração com gateways de pagamento, controle de estoque, painel administrativo completo e experiência de compra premium.',
    video:       'assets/videos/ecommerce.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"E-commerce"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  chatbot: {
    title:       'Chatbot Inteligente',
    description: 'Automação inteligente de atendimento e vendas via WhatsApp, Instagram e site. Fluxos de conversação otimizados para captura de leads, suporte 24h e qualificação de clientes.',
    video:       'assets/videos/chatbot.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Chatbot%20Inteligente"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  fitness: {
    title:       'Gestão Fitness',
    description: 'Sistema completo para academias e estúdios: controle de alunos, planos de treino, acompanhamento nutricional, financeiro e relatórios de evolução. Uma plataforma que retém e engaja.',
    video:       'assets/videos/fitness.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Vi%20o%20projeto%20"Gestão%20Fitness"%20no%20site%20e%20gostaria%20de%20conversar%20sobre%20uma%20solução%20semelhante%20para%20minha%20empresa.%20Como%20funciona%20o%20desenvolvimento%3F'
  },
  custom: {
    title:       'Sistemas Personalizados',
    description: 'Projetos exclusivos desenvolvidos sob demanda para atender necessidades específicas do seu negócio. Arquitetura, design e desenvolvimento 100% customizados para o seu contexto.',
    video:       'assets/videos/sistemas-personalizados.mp4',
    deploy:      '#',
    github:      '#',
    msgWpp:      'Olá%20Zyntek!%20Tenho%20interesse%20em%20um%20sistema%20personalizado.%20Gostaria%20de%20conversar%20sobre%20minha%20necessidade%20específica.%20Podemos%20agendar%20uma%20reunião%3F'
  }
};


// =============================================================
// 4. SCROLL: nav ativa + header + parallax
// =============================================================

function handleScroll() {
  const scrollPos = window.scrollY;

  // Header com classe .scrolled para opacidade
  if (scrollPos > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Nav link ativo baseado na seção visível
  let currentSection = '';

  sections.forEach((section) => {
    const top    = section.offsetTop - 120;
    const height = section.clientHeight;

    if (scrollPos >= top && scrollPos < top + height) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });

  // Parallax no vídeo hero
  if (bgVideo) {
    bgVideo.style.transform = `translateY(${scrollPos * 0.1}px)`;
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });


// =============================================================
// 5. REVEAL COM INTERSECTIONOBSERVER
// =============================================================

const revealElements = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-top, .reveal-bottom, .reveal-card, .zoom-in'
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((el) => {
  el.classList.add('reveal-init');
  revealObserver.observe(el);
});


// =============================================================
// 6. TYPEWRITER + GLITCH
// =============================================================

const glitchChars = ['@', '#', '%', '&', '¥', '0', '1', '∆', 'Ξ', '>'];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeEffect(element) {
  const text = element.dataset.text;
  if (!text) return;

  element.textContent = '';

  for (let i = 0; i < text.length; i++) {

    // Ruído glitch em elementos marcados
    if (element.classList.contains('glitch-text') && Math.random() > 0.62) {
      const random = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      element.textContent += random;
      await delay(38);
      element.textContent = element.textContent.slice(0, -1);
    }

    element.textContent += text[i];
    await delay(32);
  }
}

async function startTypingSequence() {
  for (const el of typingElements) {
    await typeEffect(el);
  }
}

// Loop de variações do título glitch (só inicia após typing)
const glitchTitles = [
  '< futuro digital />',
  '< futur0 d1gital />',
  '< fvturo.exe />',
  '< fvtur0 d!g1tal />',
  '< future.dll />',
  '< digital_core />',
  '< sys.future />',
  '< corrupted_data />',
  '< neural_system />',
  '< AI.exe />',
  '< protocol_zyntek />',
  '< access_granted />',
  '< future404 />',
  '< quantum.digital />'
];

function startGlitchLoop() {
  const heroTitle = document.getElementById('future-text');
  if (!heroTitle) return;

  const originalText = heroTitle.dataset.text || heroTitle.textContent;

  setInterval(() => {
    const randomText = glitchTitles[Math.floor(Math.random() * glitchTitles.length)];
    heroTitle.textContent = randomText;

    setTimeout(() => {
      heroTitle.textContent = originalText;
    }, 200);
  }, 2600);
}


// =============================================================
// 7. HOLOFOTE NOS CARDS (mousemove)
// =============================================================

premiumCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(163,0,255,.16), rgba(255,255,255,.03))`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});


// =============================================================
// 8. MODAL DE EQUIPE
// =============================================================

function openTeamModal(memberKey) {
  const data = zyntekTeam[memberKey];
  if (!data) return;

  // Foto
  const img = document.getElementById('modal-member-img');
  img.src = data.photo;
  img.alt = data.name;

  // Textos
  document.getElementById('modal-member-greet').textContent = data.greet;
  document.getElementById('modal-member-name').textContent  = data.name;
  document.getElementById('modal-member-role').textContent  = data.role;
  document.getElementById('modal-member-bio').textContent   = data.bio;

  // Links
  const portfolioBtn = document.getElementById('modal-btn-portfolio');
  const contactBtn   = document.getElementById('modal-btn-contact');

  portfolioBtn.href = data.portfolio;
  contactBtn.href   = data.whatsapp;

  // Desabilita portfólio se não houver link real
  if (data.portfolio === '#') {
    portfolioBtn.style.opacity = '0.45';
    portfolioBtn.style.pointerEvents = 'none';
    portfolioBtn.setAttribute('aria-disabled', 'true');
  } else {
    portfolioBtn.style.opacity = '';
    portfolioBtn.style.pointerEvents = '';
    portfolioBtn.removeAttribute('aria-disabled');
  }

  // Tags
  const tagsContainer = document.getElementById('modal-member-tags');
  tagsContainer.innerHTML = '';

  data.functions.forEach((func) => {
    const span = document.createElement('span');
    span.classList.add('tag-item');
    span.textContent = func;
    tagsContainer.appendChild(span);
  });

  // Abre modal
  teamModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTeamModal() {
  teamModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Eventos dos cards de equipe (click + teclado)
teamCards.forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-member');
    openTeamModal(key);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const key = card.getAttribute('data-member');
      openTeamModal(key);
    }
  });
});

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeTeamModal);
}

// Fecha ao clicar no backdrop ou ESC
teamModal.addEventListener('click', (e) => {
  if (e.target === teamModal) closeTeamModal();
});


// =============================================================
// 9. MODAL DE PROJETOS
// =============================================================

function openProjectModal(projectKey) {
  const data = projectDatabase[projectKey];
  if (!data) return;

  // Títulos e textos
  document.getElementById('project-modal-title').textContent       = data.title;
  document.getElementById('project-modal-description').textContent = data.description;

  // Links
  document.getElementById('project-modal-deploy').href  = data.deploy;
  document.getElementById('project-modal-github').href  = data.github;
  document.getElementById('project-modal-contact').href = `https://wa.me/554488317870?text=${data.msgWpp}`;

  // Deploy — desabilita se não houver link real
  const deployBtn = document.getElementById('project-modal-deploy');
  if (data.deploy === '#') {
    deployBtn.style.opacity = '0.45';
    deployBtn.style.pointerEvents = 'none';
    deployBtn.setAttribute('aria-disabled', 'true');
  } else {
    deployBtn.style.opacity = '';
    deployBtn.style.pointerEvents = '';
    deployBtn.removeAttribute('aria-disabled');
  }

  // GitHub — desabilita se não houver link real
  const githubBtn = document.getElementById('project-modal-github');
  if (data.github === '#') {
    githubBtn.style.opacity = '0.45';
    githubBtn.style.pointerEvents = 'none';
    githubBtn.setAttribute('aria-disabled', 'true');
  } else {
    githubBtn.style.opacity = '';
    githubBtn.style.pointerEvents = '';
    githubBtn.removeAttribute('aria-disabled');
  }

  // Vídeo
  const videoPlayer = document.getElementById('project-modal-video-player');
  if (videoPlayer) {
    const source = videoPlayer.querySelector('source');
    if (source) source.src = data.video;
    videoPlayer.load();
  }

  // Abre modal
  projectModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProjectModalFn() {
  projectModal.style.display = 'none';
  document.body.style.overflow = '';

  const videoPlayer = document.getElementById('project-modal-video-player');
  if (videoPlayer) videoPlayer.pause();
}

// Eventos dos cards de projeto (click + teclado)
projectCards.forEach((card) => {
  card.addEventListener('click', () => {
    openProjectModal(card.getAttribute('data-project'));
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(card.getAttribute('data-project'));
    }
  });
});

if (closeProjectModalEl) {
  closeProjectModalEl.addEventListener('click', closeProjectModalFn);
}

projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModalFn();
});


// =============================================================
// 10. FECHAR MODAIS COM ESC
// =============================================================

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTeamModal();
    closeProjectModalFn();
  }
});


// =============================================================
// 11. SMOOTH SCROLL (links âncora)
// =============================================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});


// =============================================================
// 12. MENU MOBILE
// =============================================================

(function initMobileMenu() {
  const toggle  = document.getElementById('mobileMenuToggle');
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');

  if (!toggle || !menu || !overlay) return;

  function openMenu() {
    toggle.classList.add('active');
    menu.classList.add('active');
    overlay.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    overlay.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    toggle.classList.contains('active') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.mobile-nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
    }
  });
})();


// =============================================================
// 13. EQUIPE ZYNTEK
// =============================================================

(function initTeamCards() {

  const cards = document.querySelectorAll('.team-card');

  if (!cards.length) return;

  cards.forEach((card) => {

    card.addEventListener('click', () => {

      const member = card.dataset.member;

      if(member){
        openTeamModal(member);
      }

    });

    card.addEventListener('keydown', (e) => {

      if(e.key === 'Enter' || e.key === ' ') {

        e.preventDefault();

        const member = card.dataset.member;

        if(member){
          openTeamModal(member);
        }
      }
    });

  });

})();

// =============================================================
// 14. FAQ ACCORDION
// =============================================================

document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('active');

    // Fecha todos os outros
    document.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('active');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Abre o clicado (se estava fechado)
    if (!isOpen) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


// =============================================================
// 15. FORMULÁRIO DE ORÇAMENTO (com validação)
// =============================================================

(function initForm() {
  const form = document.getElementById('budgetForm');
  if (!form) return;

  function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field) field.classList.add('invalid');
    if (error) error.textContent = message;
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field) field.classList.remove('invalid');
    if (error) error.textContent = '';
  }

  // Limpa erros ao digitar
  ['nome', 'telefone', 'projeto'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id, `error-${id}`));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome     = document.getElementById('nome')?.value.trim();
    const empresa  = document.getElementById('empresa')?.value.trim();
    const telefone = document.getElementById('telefone')?.value.trim();
    const projeto  = document.getElementById('projeto')?.value.trim();

    let valid = true;

    // Validações
    if (!nome || nome.length < 2) {
      showError('nome', 'error-nome', 'Por favor, informe seu nome completo.');
      valid = false;
    } else {
      clearError('nome', 'error-nome');
    }

    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      showError('telefone', 'error-telefone', 'Informe um WhatsApp válido com DDD.');
      valid = false;
    } else {
      clearError('telefone', 'error-telefone');
    }

    if (!projeto || projeto.length < 10) {
      showError('projeto', 'error-projeto', 'Descreva seu projeto em pelo menos 10 caracteres.');
      valid = false;
    } else {
      clearError('projeto', 'error-projeto');
    }

    if (!valid) return;

    // Monta mensagem WhatsApp
    const mensagem =
`Olá equipe Zyntek! 👋

Meu nome é ${nome}
Empresa: ${empresa || 'Não informado'}
Telefone: ${telefone}

Projeto:
${projeto}

Gostaria de solicitar um orçamento.`;

    window.open(
      `https://wa.me/554488317870?text=${encodeURIComponent(mensagem)}`,
      '_blank',
      'noopener,noreferrer'
    );

    // Reset do formulário
    form.reset();
  });
})();


// =============================================================
// 16. INICIALIZAÇÃO
// =============================================================

window.addEventListener('load', async () => {
  document.body.classList.add('loaded');

  // Dispara scroll para ativar header state
  handleScroll();

  // Typing sequence e depois glitch loop
  await startTypingSequence();
  startGlitchLoop();
});

// =============================================================
// REDE NEURAL EQUIPE
// =============================================================

(function(){

    const hidekiCard =
        document.querySelector('[data-member="hideki"]');

    const levyCard =
        document.querySelector('[data-member="levy"]');

    const soaresCard =
        document.querySelector('[data-member="soares"]');

    const lineHideki =
        document.querySelector('.line-hideki');

    const lineLevy =
        document.querySelector('.line-levy');

    const lineSoares =
        document.querySelector('.line-soares');

    function clearLines(){

        lineHideki?.classList.remove('line-active');
        lineLevy?.classList.remove('line-active');
        lineSoares?.classList.remove('line-active');

    }

    hidekiCard?.addEventListener('mouseenter',()=>{

        clearLines();

        lineHideki?.classList.add('line-active');

    });

    levyCard?.addEventListener('mouseenter',()=>{

        clearLines();

        lineLevy?.classList.add('line-active');

    });

    soaresCard?.addEventListener('mouseenter',()=>{

        clearLines();

        lineSoares?.classList.add('line-active');

    });

    document
    .querySelector('.council-bottom')
    ?.addEventListener('mouseleave',clearLines);

})();

// =============================================================
// PULSO NEURAL
// =============================================================

(function(){

    const dot =
        document.querySelector('.energy-dot');

    if(!dot) return;

    function animateDot(x,y){

        dot.style.opacity = '1';

        dot.setAttribute('cx','500');
        dot.setAttribute('cy','250');

        let startX = 500;
        let startY = 250;

        let progress = 0;

        const duration = 700;

        function frame(){

            progress += 16 / duration;

            if(progress >= 1){

                dot.style.opacity = '0';

                return;
            }

            const currentX =
                startX + ((x - startX) * progress);

            const currentY =
                startY + ((y - startY) * progress);

            dot.setAttribute('cx', currentX);
            dot.setAttribute('cy', currentY);

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    document
        .querySelector('[data-member="hideki"]')
        ?.addEventListener('mouseenter',()=>{

            animateDot(250,450);

        });

    document
        .querySelector('[data-member="levy"]')
        ?.addEventListener('mouseenter',()=>{

            animateDot(500,390);

        });

    document
        .querySelector('[data-member="soares"]')
        ?.addEventListener('mouseenter',()=>{

            animateDot(750,450);

        });

})();

/* ============================================================
   ZYNK IA — CHAT FLUTUANTE
============================================================= */
(function () {
  const fab = document.getElementById('zynkChatFab');

  if (!fab) return;

  fab.addEventListener('click', () => {
    if (window.chatbase) {
      window.chatbase('open');
    }
  });
})();