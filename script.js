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
    const ICONE_POR_TIPO = {};

    function montarMensagemWhatsApp() {
        const nome     = nomeInput.value.trim();
        const empresa  = empresaInput && empresaInput.value.trim() ? empresaInput.value.trim() : 'Não informado';
        const telefone = telefoneInput.value.trim();
        const mensagem = mensagemInput.value.trim();

        const tipoSelecionado = tipoRadios.find((radio) => radio.checked);
        const tipo = tipoSelecionado ? tipoSelecionado.value : 'Não especificado';
        

        const linhas = [
            '┏━━━━━━━━━━━━━━━━━━━━━┓',
            '        ZYNTEK.CONNECT',
            '┗━━━━━━━━━━━━━━━━━━━━━┛',
            '',
            `*NOME:* ${nome}`,
            `*EMPRESA:* ${empresa}`,
            `*TELEFONE:* ${telefone}`,
            `*TIPO DE SOLICITAÇÃO:* ${tipo}`,
            '━━━━━━━━━━━━━━━━━━━━━━━',
            `*DESCRIÇÃO DO PROJETO*`,
            mensagem,
            '━━━━━━━━━━━━━━━━━━━━━━━',
            `_Novo lead recebido através do site_`
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
/* ==========================================================
   AJUSTES v4 — progresso, cards, calculadora, CTA, footer
========================================================== */
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
      const r = b.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      b.style.setProperty('--bx', x + 'px'); b.style.setProperty('--by', y + 'px');
      b.style.transform = `translate(${(x - r.width / 2) * .12}px,${(y - r.height / 2) * .25}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
  const live = $('#cta-live-text');
  if (live) {
    const msgs = ['Agenda aberta para novos projetos', 'Resposta no WhatsApp em poucas horas', 'Orçamento sem compromisso'];
    let i = 0;
    setInterval(() => {
      live.style.opacity = 0;
      setTimeout(() => { i = (i + 1) % msgs.length; live.textContent = msgs[i]; live.style.opacity = 1; }, 300);
    }, 3500);
    live.style.transition = 'opacity .3s';
  }

  /* Calculadora: escolha da dor -> projeto indicado + estimativa de lucro (%) */
  const typeBox = $('#calc-type');
  if (typeBox) {
    const P = {
      users:   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      mega:    '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      cart:    '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
      bot:     '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 16h.01M16 16h.01"/>',
      utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
      scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
      dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
      zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      chat:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      card:    '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
      search:  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
      cpu:     '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
      chart:   '<path d="M18 20V10M12 20V4M6 20v-6"/>',
      phone:   '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>'
    };
    const ic = k => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
    // g = % de lucro a mais (estimativa), h = horas livres por mês
    const TYPES = {
      clientes:    { i: 'users',    n: 'Falta de clientes',                      t: 'Landing Page de alta conversão', g: 45, h: 0,  why: 'Indicamos uma landing page para atrair visitantes e transformar cada um em contato todos os dias.', s: ['Landing page', 'Captura de leads'] },
      alcance:     { i: 'mega',     n: 'Pouco alcance na internet',              t: 'Landing Page com SEO',           g: 40, h: 0,  why: 'Indicamos uma página otimizada para o Google, para o seu negócio ser encontrado por quem já procura.', s: ['Landing page', 'SEO', 'Analytics'] },
      loja:        { i: 'cart',     n: 'Quero vender pela internet',             t: 'Loja Virtual Completa',          g: 55, h: 10, why: 'Indicamos uma loja virtual para vender 24 horas por dia, com estoque e pagamentos integrados.', s: ['E-commerce', 'Gestão de estoque'] },
      chatbot:     { i: 'bot',      n: 'Atendimento lento ou fora do horário',   t: 'Chatbot de Fluxo Inteligente',   g: 35, h: 40, why: 'Indicamos um chatbot para responder na hora, triar clientes e não perder nenhum lead.', s: ['Chatbot 24h', 'Triagem de leads'] },
      restaurante: { i: 'utensils', n: 'Pedidos e mesas desorganizados',         t: 'Sistema para Restaurantes',      g: 40, h: 15, why: 'Indicamos um sistema com pedidos, mesas e cardápio digital para organizar a operação.', s: ['Pedidos e mesas', 'Cardápio digital'] },
      barbearia:   { i: 'scissors', n: 'Agenda bagunçada e clientes que somem',  t: 'Sistema para Barbearias',        g: 38, h: 15, why: 'Indicamos agendamento inteligente e fidelização para encher a agenda e fazer o cliente voltar.', s: ['Agendamento', 'Fidelização'] },
      academia:    { i: 'dumbbell', n: 'Alunos saindo e planos mal controlados', t: 'Sistema para Academias',         g: 35, h: 20, why: 'Indicamos um sistema de gestão de planos e acesso para aumentar a retenção de alunos.', s: ['Gestão de alunos', 'Retenção'] },
      processos:   { i: 'zap',      n: 'Muito trabalho manual e repetitivo',     t: 'Automação com IA',               g: 42, h: 30, why: 'Indicamos automações com IA para eliminar tarefas repetitivas e reduzir custos.', s: ['Automação', 'IA'] }
    };
    const FEATS = {
      wa:    { i: 'chat',   n: 'Integração WhatsApp',     g: 4, h: 8,  s: 'WhatsApp' },
      pay:   { i: 'card',   n: 'Pagamentos (Pix/cartão)', g: 4, h: 5,  s: 'Pix e cartão' },
      seo:   { i: 'search', n: 'SEO técnico',             g: 5, h: 0,  s: 'SEO' },
      ia:    { i: 'cpu',    n: 'Inteligência Artificial', g: 6, h: 20, s: 'IA' },
      admin: { i: 'chart',  n: 'Painel administrativo',   g: 3, h: 10, s: 'Painel admin' },
      pwa:   { i: 'phone',  n: 'App instalável (PWA)',    g: 3, h: 0,  s: 'App PWA' }
    };
    const mk = (box, name, type, obj, checked) => {
      box.innerHTML = Object.entries(obj).map(([k, v], i) =>
        `<label class="tile"><input type="${type}" name="${name}" value="${k}" ${checked && i === 0 ? 'checked' : ''}><span class="tile-in"><span class="tile-ico">${ic(v.i)}</span><span class="tile-tx">${v.n}</span><span class="tile-ck" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></span></label>`).join('');
    };
    mk(typeBox, 'ctype', 'radio', TYPES, true);
    mk($('#calc-feats'), 'cfeat', 'checkbox', FEATS, false);
    const ring = $('#calc-ring'), pctEl = $('#calc-days');
    let shown = 0;
    const countTo = (to) => {
      const from = shown, t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 500);
        shown = Math.round(from + (to - from) * k);
        pctEl.textContent = '+' + shown + '%';
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const pop = el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
    const calc = () => {
      const t = TYPES[$('input[name=ctype]:checked').value];
      const fs = $$('input[name=cfeat]:checked').map(i => FEATS[i.value]);
      const hi = Math.min(95, t.g + fs.reduce((a, x) => a + x.g, 0));
      const lo = Math.round(hi * .7);
      const h = t.h + fs.reduce((a, x) => a + x.h, 0);
      ring.style.strokeDashoffset = 326.7 * (1 - Math.min(1, hi / 100));
      countTo(hi);
      $('#calc-pick-icon').innerHTML = ic(t.i); $('#calc-pick-name').textContent = t.t; pop($('.calc-pick'));
      $('#calc-level').textContent = `De +${lo}% a +${hi}% de lucro`;
      $('#calc-range-txt').textContent = t.why + (h ? ` Cerca de ${h}h por mês livres da sua equipe.` : '');
      $('#calc-bar-now').style.width = (100 / (1 + hi / 100)) + '%'; $('#calc-bar-new').style.width = '100%';
      $('#calc-now-val').textContent = '100%'; $('#calc-new-val').textContent = (100 + hi) + '%';
      const stack = [...new Set([...t.s, ...fs.map(x => x.s)])];
      $('#calc-stack').innerHTML = stack.map(s => `<span>${s}</span>`).join('');
      const msg = `Olá, Zyntek! Fiz a simulação no site. Minha dificuldade hoje: ${t.n.toLowerCase()}. O projeto indicado foi: ${t.t}${fs.length ? ' com ' + fs.map(x => x.n.toLowerCase()).join(', ') : ''}. A estimativa foi de +${lo}% a +${hi}% de lucro. Podemos conversar?`;
      $('#calc-cta').href = 'https://wa.me/554488317870?text=' + encodeURIComponent(msg);
    };
    $('.calc-card').addEventListener('input', calc);
    calc();
  }

  /* Fundadores: ao clicar numa foto, o outro card escurece e recua; o texto do escolhido aparece por completo */
  const picks = $$('.fpick'), panels = $$('.fpanel'), stage = $('.founders-stage');
  const showPanel = id => panels.forEach(p => p.classList.toggle('active', p.id === id));
  picks.forEach(btn => btn.addEventListener('click', () => {
    const wasOn = btn.getAttribute('aria-pressed') === 'true';
    picks.forEach(x => { x.setAttribute('aria-pressed', 'false'); x.classList.remove('is-dim'); });
    if (wasOn) { stage.classList.remove('has-active'); return showPanel('fpanel-story'); }
    btn.setAttribute('aria-pressed', 'true');
    picks.forEach(x => { if (x !== btn) x.classList.add('is-dim'); });
    stage.classList.add('has-active');
    showPanel('fpanel-' + btn.dataset.who);
  }));

  /* Projetos: a página "trava" e o scroll vertical anda os cards para o lado até o último */
  const pin = $('.projects-pin');
  if (pin && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = $('.projects-grid', pin), cards = $$('.project-card', pin);
    const bar = $('.proj-bar b', pin), cnt = $('.proj-count', pin);
    pin.classList.add('is-scroll');
    pin.style.setProperty('--n', cards.length);
    cards.forEach(c => c.classList.add('in-view'));
    let queued = false;
    const upd = () => {
      queued = false;
      const total = pin.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -pin.getBoundingClientRect().top / total));
      const dist = Math.max(0, track.scrollWidth - innerWidth);
      track.style.transform = `translate3d(${-p * dist}px,0,0)`;
      bar.style.transform = `scaleX(${p})`;
      cnt.textContent = (Math.round(p * (cards.length - 1)) + 1) + ' / ' + cards.length;
      cards.forEach(c => {
        const r = c.getBoundingClientRect(), d = Math.min(1, Math.abs(r.left + r.width / 2 - innerWidth / 2) / innerWidth);
        c.style.opacity = 1 - d * .55; c.style.scale = 1 - d * .07;
      });
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }

  /* Reveal suave ao entrar na tela */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }), { threshold: .15 });
    $$('.founders-intro, .fcenter, .calc-intro, .calc-card').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }

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