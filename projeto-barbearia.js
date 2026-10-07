/* ============================================================
   ZYNTEK — Sistemas para Barbearias
   Núcleo compartilhado com o index (tradução, tema, sidebar, nav,
   fundo animado, footer) + comportamentos exclusivos desta página.
   ============================================================ */

/* ============================================================
   ZYNTEK — script.js
   Índice das áreas:
     1.  Google Translate (config + cookie + idioma)
     2.  Helpers
     3.  Header scroll
     4.  Menu ativo + indicador magnético
     5.  Theme + lang dropdown
     6.  Sidebar mobile
     7.  Vídeo hero
     8.  Scroll suave para âncoras
     9.  Reveal on scroll
     10. Prevenção de erros globais
     11. Injeção de cubos flutuantes (background decorativo)
     12. Utilitários (sistema de fundo — mesh/partículas)
     13. Mesh gradient — aurora + dot-grid system
     14. Partículas sutis
     15. Injeção do HTML estrutural do fundo
     16. Nav: entrada profissional escalonada
     17. Resposta ao toggle de tema
     18. Redução de movimento (a11y)
     19. Hero typing / glitch animation
     20. Equipe — troca de painel por membro
     21. Bootstrap
   ============================================================ */

'use strict';

/* ==========================================================
   1. GOOGLE TRANSLATE (CONFIGURAÇÃO + COOKIE + IDIOMA)
========================================================== */

const GOOGLE_TRANSLATE_STORAGE_KEY = 'zyntek-preferred-language';

const GOOGLE_LANGUAGE_MAP = {
    pt: 'pt', en: 'en', es: 'es',
    PT: 'pt', EN: 'en', ES: 'es'
};

const DISPLAY_LANGUAGE_MAP = { pt: 'PT', en: 'EN', es: 'ES' };

const setGoogleTranslateCookie = (targetLang) => {
    const domain = location.hostname === 'localhost' ? 'localhost' : location.hostname;
    if (targetLang === 'pt') {
        document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else {
        const val = `/pt/${targetLang}`;
        document.cookie = `googtrans=${val}; path=/`;
        document.cookie = `googtrans=${val}; path=/; domain=${domain}`;
    }
};

const applyGoogleLanguage = (languageCode) => {
    const normalized = GOOGLE_LANGUAGE_MAP[languageCode] || 'pt';
    const currentLang = document.getElementById('current-lang');
    if (currentLang) {
        currentLang.textContent = DISPLAY_LANGUAGE_MAP[normalized] || normalized.toUpperCase();
    }
    const select = document.querySelector('.goog-te-combo');
    if (select && select.value !== normalized) {
        select.value = normalized;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.documentElement.lang = normalized === 'pt' ? 'pt-BR' : normalized;
};

const setPreferredLanguage = (languageCode, options = {}) => {
    const normalized = GOOGLE_LANGUAGE_MAP[languageCode] || 'pt';
    localStorage.setItem(GOOGLE_TRANSLATE_STORAGE_KEY, normalized);
    setGoogleTranslateCookie(normalized);
    if (options.reloadPage) {
        setTimeout(() => location.reload(), 180);
    } else {
        applyGoogleLanguage(normalized);
    }
};

window.googleTranslateElementInit = function () {
    if (!window.google?.translate?.TranslateElement) return;
    new window.google.translate.TranslateElement({
        pageLanguage: 'pt',
        includedLanguages: 'pt,en,es',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
    const saved = localStorage.getItem(GOOGLE_TRANSLATE_STORAGE_KEY);
    setTimeout(() => applyGoogleLanguage(saved || 'pt'), 700);
};

const savedInitialLanguage = localStorage.getItem(GOOGLE_TRANSLATE_STORAGE_KEY);
if (savedInitialLanguage) {
    setGoogleTranslateCookie(savedInitialLanguage);
}

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       2. HELPERS
    ========================================================== */

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    /* ==========================================================
       3. HEADER SCROLL
    ========================================================== */

    (() => {

        const header = $('#header');

        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });

    })();

/* ==========================================================
   4. MENU ATIVO + INDICADOR MAGNÉTICO
========================================================== */

(() => {

    const navLinks = [...document.querySelectorAll('.nav-link')];
    const navIndicator = document.querySelector('.nav-indicator');
    const navContainer = document.querySelector('.main-nav ul');
    const sections = [...document.querySelectorAll('section[id]')];

    if (!navLinks.length || !navIndicator || !navContainer) return;

    let scrollSpyEnabled = true;
    let activeLink = navLinks.find(link => link.classList.contains('active')) || navLinks[0];

    const updateIndicator = (element) => {
        if (!element) return;
        requestAnimationFrame(() => {
            const containerRect = navContainer.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();
            navIndicator.style.left   = `${elemRect.left - containerRect.left}px`;
            navIndicator.style.top    = `${elemRect.top  - containerRect.top}px`;
            navIndicator.style.width  = `${elemRect.width}px`;
            navIndicator.style.height = `${elemRect.height}px`;
        });
    };

    const setActiveLink = (link) => {
        if (!link) return;
        navLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
        activeLink = link;
        updateIndicator(link);
    };

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateIndicator(link));
        link.addEventListener('focus',      () => updateIndicator(link));
        link.addEventListener('click', () => {
            setActiveLink(link);
            scrollSpyEnabled = false;
            setTimeout(() => { scrollSpyEnabled = true; }, 800);
        });
    });

    navContainer.addEventListener('mouseleave', () => {
        if (activeLink) updateIndicator(activeLink);
    });

    const observer = new IntersectionObserver((entries) => {
        if (!scrollSpyEnabled) return;
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = navLinks.find(l => l.getAttribute('href') === `#${visible.target.id}`);
        if (match) setActiveLink(match);
    }, { threshold: [0.3, 0.6], rootMargin: '-10% 0px -20% 0px' });

    sections.forEach(s => observer.observe(s));

    const syncIndicator = () => { if (activeLink) updateIndicator(activeLink); };

    window.addEventListener('resize', syncIndicator, { passive: true });
    window.addEventListener('load',   syncIndicator);
    setTimeout(syncIndicator, 150);
    setTimeout(syncIndicator, 500);

})();


/* ==========================================================
   5. THEME + LANG DROPDOWN
========================================================== */

(() => {

    const STORAGE_KEY = 'zyntek-theme';

    const themeToggle =
        $('#theme-toggle') ||
        $('.theme-toggle');

    const moonIcon = $('#moon-icon');
    const sunIcon = $('#sun-icon');

    const langBtn = $('#lang-btn');
    const langMenu = $('#lang-menu');
    const langDropdown = $('.lang-dropdown');

    const applyTheme = (theme) => {
        const isLight = theme === 'light';

        document.body.classList.toggle('light-mode', isLight);

        if (themeToggle) {
            themeToggle.classList.toggle('is-light', isLight);
            themeToggle.setAttribute('aria-pressed', String(isLight));
            themeToggle.setAttribute(
                'aria-label',
                isLight ? 'Alternar para modo escuro' : 'Alternar para modo claro'
            );
        }

        if (moonIcon) {
            moonIcon.style.opacity = isLight ? '0' : '1';
            moonIcon.style.transform = isLight
                ? 'rotate(-90deg) scale(0.4)'
                : 'rotate(0deg) scale(1)';
        }

        if (sunIcon) {
            sunIcon.style.opacity = isLight ? '1' : '0';
            sunIcon.style.transform = isLight
                ? 'rotate(360deg) scale(1)'
                : 'rotate(-90deg) scale(0.4)';
        }
    };

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-mode');
            const nextTheme = isLight ? 'dark' : 'light';

            localStorage.setItem(STORAGE_KEY, nextTheme);
            applyTheme(nextTheme);
        });
    }

    if (langBtn && langMenu && langDropdown) {
        const openMenu = () => {
            langMenu.classList.add('active');
            langDropdown.classList.add('open');
            langBtn.setAttribute('aria-expanded', 'true');
            langMenu.setAttribute('aria-hidden', 'false');
        };

        const closeMenu = () => {
            langMenu.classList.remove('active');
            langDropdown.classList.remove('open');
            langBtn.setAttribute('aria-expanded', 'false');
            langMenu.setAttribute('aria-hidden', 'true');
        };

        langBtn.addEventListener('click', (event) => {
            event.stopPropagation();

            const isOpen = langMenu.classList.contains('active');

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        langMenu.querySelectorAll('a').forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const language = item.dataset.lang || item.textContent.trim();
                const normalized = GOOGLE_LANGUAGE_MAP[language] || 'pt';
                const currentLangEl = document.getElementById('current-lang');
                if (currentLangEl) currentLangEl.textContent = DISPLAY_LANGUAGE_MAP[normalized] || normalized.toUpperCase();
                closeMenu();
                setPreferredLanguage(language, { reloadPage: true });
            });
        });

        document.addEventListener('click', (event) => {
            if (!langDropdown.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    /* Seletor de idioma dentro do menu lateral (mobile) —
       usa a mesma lógica de troca de idioma do dropdown do header. */
    const langMenuMobile = $('#lang-menu-mobile');
    if (langMenuMobile) {
        langMenuMobile.querySelectorAll('a[data-lang]').forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const language = item.dataset.lang;
                const normalized = GOOGLE_LANGUAGE_MAP[language] || 'pt';
                const currentLangEl = document.getElementById('current-lang');
                if (currentLangEl) currentLangEl.textContent = DISPLAY_LANGUAGE_MAP[normalized] || normalized.toUpperCase();
                setPreferredLanguage(language, { reloadPage: true });
            });
        });

        const savedLangMobile = GOOGLE_LANGUAGE_MAP[localStorage.getItem(GOOGLE_TRANSLATE_STORAGE_KEY)] || 'pt';
        langMenuMobile.querySelectorAll('a[data-lang]').forEach((item) => {
            const isActive = (GOOGLE_LANGUAGE_MAP[item.dataset.lang] || 'pt') === savedLangMobile;
            item.classList.toggle('active', isActive);
        });
    }

})();


    /* ==========================================================
       6. SIDEBAR MOBILE
    ========================================================== */

    (() => {

        const sidebar = $('#sidebar-lateral');
        const overlay = $('#sidebar-overlay');
        const menuToggle = $('#menu-toggle') || $('.menu-toggle');
        const closeSidebar = $('#close-sidebar') || $('.close-sidebar') || $('#close-sidebar-lateral') || $('.close-sidebar-lateral');

        if (!sidebar || !overlay || !menuToggle) return;

        const setBodyScroll = (locked) => {
            document.body.style.overflow = locked ? 'hidden' : '';
            document.documentElement.style.overflow = locked ? 'hidden' : '';
            document.body.classList.toggle('sidebar-open', locked);
        };

        const openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            menuToggle.classList.add('is-open');
            menuToggle.setAttribute('aria-expanded', 'true');
            sidebar.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
            setBodyScroll(true);
        };

        const hideSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            menuToggle.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            sidebar.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            setBodyScroll(false);
        };

        menuToggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('open');

            if (isOpen) {
                hideSidebar();
            } else {
                openSidebar();
            }
        });

        if (closeSidebar) {
            closeSidebar.addEventListener('click', hideSidebar);
        }

        overlay.addEventListener('click', hideSidebar);

        const sidebarLinks = $$('a', sidebar);
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                hideSidebar();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hideSidebar();
            }
        });

    })();


    /* ==========================================================
       7. VÍDEO HERO
    ========================================================== */

    (() => {

        const video =
            $('#hero-video') ||
            $('.hero-video') ||
            $('video');

        if (!video) return;

        const pauseBtn =
            $('#pause-video') ||
            $('.pause-btn');

        const playVideo = () => {

            const promise = video.play();

            if (promise !== undefined) {
                promise.catch(() => {});
            }

            updateButton();
        };

        const pauseVideo = () => {

            video.pause();
            updateButton();
        };

        const toggleVideo = () => {

            if (video.paused) {
                playVideo();
            } else {
                pauseVideo();
            }
        };

        const updateButton = () => {

            if (!pauseBtn) return;

            pauseBtn.innerHTML = video.paused
                ? '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                : '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        };

        if (pauseBtn) {
            pauseBtn.addEventListener('click', toggleVideo);
        }

        video.addEventListener('click', toggleVideo);

        video.addEventListener('play', updateButton);
        video.addEventListener('pause', updateButton);
        video.addEventListener('loadeddata', updateButton);

        updateButton();

    })();

    /* ==========================================================
       8. SCROLL SUAVE PARA ÂNCORAS
    ========================================================== */

    (() => {

        const anchorLinks =
            $$('a[href^="#"]');

        anchorLinks.forEach(link => {

            link.addEventListener('click', (event) => {

                const targetId =
                    link.getAttribute('href');

                if (
                    !targetId ||
                    targetId === '#'
                ) return;

                const target =
                    document.querySelector(targetId);

                if (!target) return;

                event.preventDefault();

                const header =
                    $('#header');

                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 80;

                const offsetTop =
                    target.offsetTop -
                    headerHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

            });

        });

    })();

    /* ==========================================================
       9. REVEAL ON SCROLL
    ========================================================== */

    (() => {

        const elements = $$(
            '.service-card, .step-card, .project-card, .team-member-btn, .cta-container, .contact-card'
        );

        if (!elements.length) return;

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.style.opacity = '1';
                            entry.target.style.transform =
                                'translateY(0)';

                            entry.target.classList.add('in-view');

                            observer.unobserve(
                                entry.target
                            );
                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );

        elements.forEach(element => {

            element.style.opacity = '0';
            element.style.transform =
                'translateY(30px)';

            element.style.transition =
                'opacity .6s ease, transform .6s ease';

            observer.observe(element);

        });

    })();

    /* ==========================================================
       9.1 PARALLAX DO VÍDEO NO CTA
       O vídeo se move dentro da moldura conforme a página rola,
       um efeito tipo "keyframe" amarrado ao scroll.
    ========================================================== */

    (() => {

        const stage = document.querySelector('.cta-video-stage');
        const video = document.querySelector('.cta-holo-video');

        if (!stage || !video) return;

        const RANGE = 34; // deslocamento máximo em px, pra cima e pra baixo
        let ticking = false;

        function updateParallax() {

            const rect = stage.getBoundingClientRect();
            const viewportH = window.innerHeight || document.documentElement.clientHeight;

            // progresso de -1 (seção acima da tela) a 1 (seção abaixo da tela), 0 = centralizada
            const centerOffset = (rect.top + rect.height / 2) - viewportH / 2;
            const progress = Math.max(-1, Math.min(1, centerOffset / viewportH));
            const offset = (-progress * RANGE).toFixed(1);

            video.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;

            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        updateParallax();

    })();

    /* ==========================================================
       10. PREVENÇÃO DE ERROS GLOBAIS
    ========================================================== */

    window.addEventListener('error', (event) => {
        console.warn('Zyntek Error:', event.message);
    });

    window.addEventListener(
        'unhandledrejection',
        (event) => {
            console.warn(
                'Zyntek Promise:',
                event.reason
            );
        }
    );

});

/* ==========================================================
   11. BACKGROUND — REDE DE PONTOS CONECTADOS
========================================================== */

function initHomeBackgroundParticles() {
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

/* ==========================================================
   12. UTILITÁRIOS (SISTEMA DE FUNDO — MESH/PARTÍCULAS)
========================================================== */

const rand = (min, max) => Math.random() * (max - min) + min;
const lerp = (a, b, t)  => a + (b - a) * t;

/* ==========================================================
   13. MESH GRADIENT — AURORA + DOT-GRID SYSTEM
========================================================== */

/* ==========================================================
   16. NAV: ENTRADA PROFISSIONAL ESCALONADA
========================================================== */

function initNavEntrance() {
    const header = document.querySelector('.zyntek-header');
    if (!header) return;

    /* Header: fade + slide suave de cima */
    header.style.transform  = 'translateY(-100%)';
    header.style.opacity    = '0';
    header.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease';

    /* Ao terminar a transição, removemos o transform residual.
       Um header com position:fixed que mantém um transform aplicado
       (mesmo translateY(0)) cria um novo "containing block"/stacking
       context e quebra o comportamento de "fixed" em navegadores mobile
       (principalmente iOS Safari) — foi isso que fazia o seletor de
       idioma renderizar atrás do vídeo do hero. */
    const clearHeaderTransform = (e) => {
        if (e.propertyName === 'transform') {
            header.style.transform = '';
            header.removeEventListener('transitionend', clearHeaderTransform);
        }
    };
    header.addEventListener('transitionend', clearHeaderTransform);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                header.style.transform = 'translateY(0)';
                header.style.opacity   = '1';
            }, 80);
        });
    });

    /* Nav links: fade + sobe com delay escalonado elegante */
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, i) => {
        link.style.opacity   = '0';
        link.style.transform = 'translateY(-6px)';
        link.style.transition =
            `opacity 0.38s ease ${250 + i * 55}ms, ` +
            `transform 0.38s cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 55}ms`;

        setTimeout(() => {
            link.style.opacity   = '1';
            link.style.transform = 'translateY(0)';
        }, 250 + i * 55);
    });

    /* Logo: fade-in levemente atrasado */
    const logo = document.querySelector('.logo-container');
    if (logo) {
        logo.style.opacity   = '0';
        logo.style.transform = 'translateX(-8px)';
        logo.style.transition = 'opacity 0.45s ease 180ms, transform 0.45s cubic-bezier(0.16,1,0.3,1) 180ms';
        setTimeout(() => {
            logo.style.opacity   = '1';
            logo.style.transform = 'translateX(0)';
        }, 180);
    }

    /* Header actions (idioma, tema, CTA): fade da direita */
    const actions = document.querySelector('.header-actions');
    if (actions) {
        actions.style.opacity   = '0';
        actions.style.transform = 'translateX(10px)';
        actions.style.transition = 'opacity 0.42s ease 320ms, transform 0.42s cubic-bezier(0.16,1,0.3,1) 320ms';
        setTimeout(() => {
            actions.style.opacity   = '1';
            actions.style.transform = 'translateX(0)';
        }, 320);
    }
}

/* ==========================================================
   17. RESPOSTA AO TOGGLE DE TEMA
========================================================== */

function watchThemeChanges() {
    /* Observa mudança de classe no body para reotimizar opacidades */
    const observer = new MutationObserver(() => {
        /* Os canvas já leem isLight() em runtime — nada a fazer aqui.
           Apenas dispara um resize suave para re-renderizar imediatamente. */
        window.dispatchEvent(new Event('resize'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

/* ==========================================================
   18. REDUÇÃO DE MOVIMENTO (A11Y)
========================================================== */

function respectReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyReducedMotion = (reduced) => {
        const root = document.getElementById('zyntek-bg-root');
        if (!root) return;
        root.style.display = reduced ? 'none' : '';
    };

    applyReducedMotion(mq.matches);
    mq.addEventListener('change', e => applyReducedMotion(e.matches));
}


(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Progresso de leitura na navbar */
  const bar = $('.nav-progress');
  if (bar) {
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* Cards expansíveis (toque/clique) + spotlight do mouse */
  const toggleCard = (card) => {
    const open = card.classList.toggle('open');
    card.setAttribute('aria-expanded', open);
  };
  $$('.about-card, .founder-card').forEach(card => {
    card.addEventListener('click', e => { if (!e.target.closest('a')) toggleCard(card); });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); toggleCard(card); }
    });
  });
  $$('.glass-card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* CTA: botão magnético + status rotativo */
  $$('.js-magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      b.style.setProperty('--bx', x + 'px'); b.style.setProperty('--by', y + 'px');
      b.style.transform = `translate(${(x - r.width / 2) * .12}px,${(y - r.height / 2) * .25}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
  const live = $('#cta-live-text');
  if (live) {
    const msgs = ['Agenda aberta para novos projetos', 'Resposta no WhatsApp em poucas horas', 'Orçamento sem compromisso'];
    let i = 0; live.style.transition = 'opacity .3s';
    setInterval(() => { live.style.opacity = 0; setTimeout(() => { i = (i + 1) % msgs.length; live.textContent = msgs[i]; live.style.opacity = 1; }, 300); }, 3500);
  }

  /* Reveal suave ao entrar na tela */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }), { threshold: .15 });
    $$('.reveal').forEach(el => io.observe(el));
  } else { $$('.reveal').forEach(el => el.classList.add('revealed')); }

  /* Footer: rede de nós animada */
  const cv = $('#footer-canvas');
  if (cv && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = cv.getContext('2d'); let w, h, nodes = [], run = false;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      nodes = Array.from({ length: Math.max(24, Math.round(w / 38)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
    };
    const draw = () => {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((a, i) => {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        ctx.fillStyle = 'rgba(167,139,250,.8)'; ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, 6.283); ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) { ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * .45})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      });
      requestAnimationFrame(draw);
    };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => { const was = run; run = e.isIntersecting; if (run && !was) draw(); }).observe(cv);
  }
})();

/* ==========================================================
   PÁGINA — Sistemas para Barbearias
========================================================== */
const PAGE = {"mini": "BARBEARIAS • AGENDAMENTO • FIDELIZAÇÃO", "words": ["cheia", "sem furo", "organizada", "que fideliza"], "sim": {"a": ["Atendimentos por mês", 80, 1500, 10, 300], "b": ["Ticket médio (R$)", 25, 200, 5, 50], "base": 10, "chips": [["Lembrete via WhatsApp", 8, 1], ["Cartão fidelidade", 7, 1], ["Assinaturas mensais", 9, 0], ["Venda de produtos", 5, 0]]}};

/* Hero: mini-título digitado + palavra com digitação/glitch (igual ao index) */
function initPageHero() {
    const glitchEl = document.getElementById('hero-typing');
    const mini = document.getElementById('hero-mini-title');
    const l1 = document.querySelector('.title-line-1'), l3 = document.querySelector('.title-line-3');
    if (!glitchEl) return;
    const SC = '!@#$%^&*<>?/\\|{}[]01';
    const heroTitle = glitchEl.closest('.hero-title');
    const setG = (on) => heroTitle && heroTitle.classList.toggle('is-glitching', on);
    const scr = (s) => s.split('').map(c => c === ' ' ? ' ' : SC[Math.floor(Math.random() * SC.length)]).join('');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        mini.textContent = PAGE.mini; glitchEl.textContent = PAGE.words[0];
        [l1, l3].forEach(el => el && el.classList.add('visible')); return;
    }
    const W = PAGE.words; let w = 0, c = 0, del = false;
    const tick = () => {
        const full = W[w];
        if (del) {
            c--; glitchEl.textContent = full.slice(0, c);
            if (c <= 0) { del = false; w = (w + 1) % W.length; setTimeout(tick, 380); } else setTimeout(tick, 28);
            return;
        }
        c++; glitchEl.textContent = full.slice(0, c);
        if (c > 2 && Math.random() < .18) { const s = glitchEl.textContent; glitchEl.textContent = scr(s); setG(true); setTimeout(() => { glitchEl.textContent = s; setG(false); }, 75); }
        if (c < full.length) return void setTimeout(tick, 52);
        setTimeout(() => { del = true; tick(); }, 2200);
    };
    const typeMini = (i) => {
        if (i <= PAGE.mini.length) { mini.textContent = PAGE.mini.slice(0, i); setTimeout(() => typeMini(i + 1), 28); }
        else setTimeout(() => { l1 && l1.classList.add('visible'); setTimeout(() => { l3 && l3.classList.add('visible'); setTimeout(tick, 350); }, 200); }, 300);
    };
    setTimeout(() => typeMini(0), 700);
}

/* ROI: contadores animados */
function initCounters() {
    const els = [...document.querySelectorAll('.js-count')];
    if (!els.length) return;
    const run = (el) => {
        const to = +el.dataset.to; if (!to) { el.textContent = '0'; return; }
        const t0 = performance.now();
        const step = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
    els.forEach(el => io.observe(el));
}

/* ROI: simulador de retorno */
function initSimulator() {
    const a = document.getElementById('sim-a'), b = document.getElementById('sim-b');
    if (!a || !b) return;
    const S = PAGE.sim, brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const $ = (id) => document.getElementById(id);
    const chips = [...document.querySelectorAll('#sim-chips input')];
    const calc = () => {
        const qa = +a.value, qb = +b.value, now = qa * qb;
        const pct = S.base + chips.reduce((s, c) => s + (c.checked ? +c.dataset.g : 0), 0);
        const nw = now * (1 + pct / 100);
        $('sim-a-val').textContent = qa.toLocaleString('pt-BR');
        $('sim-b-val').textContent = brl(qb);
        $('sim-pct').textContent = '+' + pct + '%';
        $('sim-ring').style.strokeDashoffset = 326.7 * (1 - Math.min(pct, 60) / 60);
        $('sim-now').textContent = brl(now); $('sim-new').textContent = brl(nw);
        $('sim-gain').textContent = brl(nw - now);
        $('sim-bar-now').style.width = (now / nw * 100) + '%'; $('sim-bar-new').style.width = '100%';
    };
    [a, b, ...chips].forEach(el => el.addEventListener('input', calc));
    calc();
}

/* Complementos: filtro por categoria */
function initFeatureFilter() {
    const group = document.getElementById('pj-filter'); if (!group) return;
    const cards = [...document.querySelectorAll('#pj-feats .pj-feat')];
    group.addEventListener('change', (e) => {
        const cat = e.target.value;
        cards.forEach((c, i) => {
            const show = cat === 'Todos' || c.dataset.cat === cat;
            c.classList.toggle('is-hidden', !show);
            if (show) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; c.style.animationDelay = (i * 40) + 'ms'; }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHomeBackgroundParticles();
    initNavEntrance();
    watchThemeChanges();
    respectReducedMotion();
    initPageHero();
    initCounters();
    initSimulator();
    initFeatureFilter();
});
