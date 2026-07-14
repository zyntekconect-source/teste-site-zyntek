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
                ? '▶'
                : '❚❚';
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

/* ==========================================================
   19. HERO TYPING / GLITCH ANIMATION
========================================================== */

function initHeroTyping() {

    /* ── Elementos ── */
    const glitchEl  = document.getElementById('hero-typing');   /* linha 2: glitch */
    const miniTitle = document.getElementById('hero-mini-title'); /* subtítulo */
    const line1     = document.querySelector('.title-line-1');  /* "Construindo o" */
    const line3     = document.querySelector('.title-line-3');  /* "das empresas" */

    if (!glitchEl) return;

    /* ── Variantes do texto glitch (linha 2) — "bug proposital" ── */
    const PHRASES = [
        { text: 'futuro digital',   glitch: false },
        { text: 'futuro.exe',       glitch: true  },
        { text: 'futuro.window',    glitch: true  },
        { text: 'futu!u d1g!ta!',   glitch: true  },
        { text: '01001110011',      glitch: true  },
        { text: 'futuro digital',   glitch: false },
        { text: 'fu7uro_d1g1t4l',   glitch: true  },
        { text: 'futuro.exe',       glitch: true  },
        { text: 'futuro digital',   glitch: false },
    ];

    const SCRAMBLE = '!@#$%^&*<>?/\\|{}[]01';

    const SPEED = {
        mini:       28,   /* ms/char para o mini-título */
        type:       52,   /* ms/char digitando */
        del:        28,   /* ms/char apagando */
        pause:    2400,   /* pausa frase normal */
        pauseG:    650,   /* pausa frase glitch */
        glitchF:     5,   /* frames scramble final */
    };

    const heroTitle = glitchEl.closest('.hero-title');
    const setGlitch = (on) => heroTitle && heroTitle.classList.toggle('is-glitching', on);
    const rand      = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const scramble  = (s) => s.split('').map(c => c === ' ' ? ' ' : rand(SCRAMBLE.split(''))).join('');

    /* ── Reduced motion: mostra tudo estático ── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (miniTitle) miniTitle.textContent = 'SOFTWARE HOUSE • AUTOMAÇÕES • IA • LANDING PAGES';
        glitchEl.textContent = 'futuro digital';
        [line1, line3].forEach(el => el && el.classList.add('visible'));
        return;
    }

    /* ───────────────────────────────────────────
       FASE 1: digita o mini-título (subtítulo)
    ─────────────────────────────────────────── */
    const MINI_TEXT = 'SOFTWARE HOUSE • AUTOMAÇÕES • IA • LANDING PAGES';

    function typeMini(i) {
        if (!miniTitle) { startLines(); return; }
        if (i <= MINI_TEXT.length) {
            miniTitle.textContent = MINI_TEXT.slice(0, i);
            setTimeout(() => typeMini(i + 1), SPEED.mini);
        } else {
            setTimeout(startLines, 300);
        }
    }

    /* ───────────────────────────────────────────
       FASE 2: fade-in de "Construindo o" e "das empresas"
    ─────────────────────────────────────────── */
    function startLines() {
        if (line1) line1.classList.add('visible');
        setTimeout(() => {
            if (line3) line3.classList.add('visible');
            setTimeout(startGlitchLoop, 350);
        }, 200);
    }

    /* ───────────────────────────────────────────
       FASE 3: loop de digitação + glitch na linha 2
    ─────────────────────────────────────────── */
    let pIdx = 0, cIdx = 0, deleting = false, gCount = 0;

    function tick() {
        const phrase = PHRASES[pIdx];
        const full   = phrase.text;

        /* --- apagando --- */
        if (deleting) {
            cIdx--;
            glitchEl.textContent = full.slice(0, cIdx);
            if (cIdx <= 0) {
                deleting = false; gCount = 0;
                setGlitch(false);
                pIdx = (pIdx + 1) % PHRASES.length;
                setTimeout(tick, 380);
            } else {
                setTimeout(tick, SPEED.del);
            }
            return;
        }

        /* --- digitando --- */
        cIdx++;
        glitchEl.textContent = full.slice(0, cIdx);

        /* scramble inline durante digitação de frases com bug */
        if (phrase.glitch && cIdx > 2 && Math.random() < 0.22) {
            const stable = glitchEl.textContent;
            glitchEl.textContent = scramble(stable);
            setGlitch(true);
            setTimeout(() => { glitchEl.textContent = stable; setGlitch(false); }, 75);
        }

        if (cIdx < full.length) {
            setTimeout(tick, SPEED.type);
            return;
        }

        /* --- texto completo: scramble final --- */
        if (phrase.glitch && gCount < SPEED.glitchF) {
            gCount++;
            setGlitch(true);
            const stable = full;
            glitchEl.textContent = scramble(stable);
            setTimeout(() => { glitchEl.textContent = stable; tick(); }, 85);
            return;
        }

        setGlitch(false); gCount = 0;
        const pause = phrase.glitch ? SPEED.pauseG : SPEED.pause;
        setTimeout(() => { deleting = true; tick(); }, pause);
    }

    function startGlitchLoop() { tick(); }

    /* ── Arranca tudo ── */
    setTimeout(() => typeMini(0), 700);
}

/* ==========================================================
   20. EQUIPE — TROCA DE PAINEL POR MEMBRO
========================================================== */

function initTeamMembers() {
    const buttons    = document.querySelectorAll('.team-member-btn');
    const defaultPanel = document.getElementById('content-default');
    if (!buttons.length || !defaultPanel) return;

    function showPanel(targetId) {
        document.querySelectorAll('.team-panel').forEach(panel => {
            const isTarget = panel.id === targetId;
            panel.classList.toggle('active', isTarget);
            panel.hidden = !isTarget;
        });
    }

    function resetToDefault() {
        buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        showPanel('content-default');
    }

    /* Estado inicial: painel padrão visível */
    showPanel('content-default');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');

            if (isActive) {
                /* Clicou de novo no mesmo membro já selecionado → volta ao texto original */
                resetToDefault();
                return;
            }

            buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            showPanel(btn.getAttribute('data-target'));
        });
    });
}

/* ==========================================================
   22. FORMULÁRIO DE CONTATO -> WHATSAPP
========================================================== */

function initContactForm() {
    const form = document.getElementById('zyntekForm');
    if (!form) return;

    const WHATSAPP_NUMBER = '554488317870';

    const nomeInput     = document.getElementById('nome');
    const empresaInput  = document.getElementById('empresa');
    const telefoneInput = document.getElementById('telefone');
    const mensagemInput = document.getElementById('mensagem');

    const requiredFields = [nomeInput, telefoneInput, mensagemInput].filter(Boolean);
    const tipoRadios = Array.from(form.querySelectorAll('input[name="tipo_solicitacao"]'));
    const tipoGroupEl = document.getElementById('tipoSolicitacaoGroup');

    function setFieldInvalid(field, invalid) {
        const wrapper = field.closest('.input-wrapper');
        const group   = field.closest('.input-group');
        if (wrapper) wrapper.classList.toggle('invalid', invalid);
        if (group)   group.classList.toggle('invalid', invalid);
    }

    function validateField(field) {
        const isEmpty = field.value.trim().length === 0;
        setFieldInvalid(field, isEmpty);
        return !isEmpty;
    }

    function validateTipoSolicitacao() {
        const algumSelecionado = tipoRadios.some((radio) => radio.checked);
        if (tipoGroupEl) tipoGroupEl.classList.toggle('invalid', !algumSelecionado);
        return algumSelecionado;
    }

    /* Remove o estado de erro assim que a pessoa começa a corrigir */
    requiredFields.forEach((field) => {
        field.addEventListener('input', () => {
            if (field.value.trim().length > 0) setFieldInvalid(field, false);
        });
        field.addEventListener('blur', () => validateField(field));
    });

    tipoRadios.forEach((radio) => {
        radio.addEventListener('change', () => validateTipoSolicitacao());
    });

    /* Ícones em escape Unicode (\u{codigo}) — evitam o caractere "�" que pode
       aparecer quando emojis são salvos/lidos com uma codificação incorreta */
    const ICONES = {
        pessoa:   '\u{1F464}', // 👤
        empresa:  '\u{1F3E2}', // 🏢
        telefone: '\u{1F4F1}', // 📱
        descricao:'\u{1F4DD}', // 📝
        check:    '\u{2705}',  // ✅
        verde:    '\u{1F7E2}', // 🟢
        amarelo:  '\u{1F7E1}', // 🟡
        vermelho: '\u{1F534}'  // 🔴
    };

    const ICONE_POR_TIPO = {
        'Orçamento de novo projeto':      ICONES.verde,
        'Reajuste em site já existente':  ICONES.amarelo,
        'Urgente / Prioridade Alta':      ICONES.vermelho
    };

    function montarMensagemWhatsApp() {
        const nome     = nomeInput.value.trim();
        const empresa  = empresaInput && empresaInput.value.trim() ? empresaInput.value.trim() : 'Não informado';
        const telefone = telefoneInput.value.trim();
        const mensagem = mensagemInput.value.trim();

        const tipoSelecionado = tipoRadios.find((radio) => radio.checked);
        const tipo = tipoSelecionado ? tipoSelecionado.value : 'Não especificado';
        const iconeTipo = ICONE_POR_TIPO[tipo] || '\u{26AA}';

        const linhas = [
            '┏━━━━━━━━━━━━━━━━━━━━━┓',
            '        ZYNTEK.CONNECT',
            '┗━━━━━━━━━━━━━━━━━━━━━┛',
            '',
            `${ICONES.pessoa} *NOME:* ${nome}`,
            `${ICONES.empresa} *EMPRESA:* ${empresa}`,
            `${ICONES.telefone} *TELEFONE:* ${telefone}`,
            `${iconeTipo} *TIPO DE SOLICITAÇÃO:* ${tipo}`,
            '━━━━━━━━━━━━━━━━━━━━━━━',
            `${ICONES.descricao} *DESCRIÇÃO DO PROJETO*`,
            mensagem,
            '━━━━━━━━━━━━━━━━━━━━━━━',
            `${ICONES.check} _Novo lead recebido através do site_`
        ];

        return linhas.join('\n');
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let formValido = true;
        requiredFields.forEach((field) => {
            if (!validateField(field)) formValido = false;
        });
        if (!validateTipoSolicitacao()) formValido = false;

        if (!formValido) {
            const primeiroInvalido =
                requiredFields.find((field) => field.closest('.input-wrapper')?.classList.contains('invalid')) ||
                (tipoGroupEl && tipoGroupEl.classList.contains('invalid') ? tipoGroupEl : null);

            if (primeiroInvalido) {
                if (typeof primeiroInvalido.focus === 'function') primeiroInvalido.focus();
                primeiroInvalido.closest('.contact-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const texto = montarMensagemWhatsApp();
        const url   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

        window.open(url, '_blank', 'noopener,noreferrer');

        form.reset();
        requiredFields.forEach((field) => setFieldInvalid(field, false));
        if (tipoGroupEl) tipoGroupEl.classList.remove('invalid');
    });
}

/* ==========================================================
   21. BOOTSTRAP
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initHomeBackgroundParticles();
    initNavEntrance();
    watchThemeChanges();
    respectReducedMotion();
    initHeroTyping();        /* ← typing/glitch do hero */
    initTeamMembers();       /* ← troca de painel da equipe */
    initContactForm();       /* ← validação + envio do formulário via WhatsApp */
});