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
            '.service-card, .step-card, .team-member-btn, .cta-container, .contact-card'
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
    const DENSITY = 24000;   // px² por ponto — maior = menos pontos
    const LINK_DIST = 120;   // distância máxima para desenhar uma linha
    const SPEED = 0.18;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        const total = Math.max(24, Math.min(60, Math.round((width * height) / DENSITY)));
        points = Array.from({ length: total }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
        }));
    }

    let lastTs = 0;
    function step(ts) {
        requestAnimationFrame(step);
        if (document.hidden || ts - lastTs < 33) return;
        lastTs = ts;
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

  /* Monte o seu site: simulador interativo (ramo + poderes + cor + tela -> prévia ao vivo) */
  const mkR = $('#mk-ramos');
  if (mkR) {
    const P = {
      scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
      utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
      bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
      dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
      wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
      chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
      cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
      bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/>',
      video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4z"/>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
      pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
      laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
      phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>'
    };
    const ic = k => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
    const RAMOS = {
      barb: { ic: 'scissors', n: 'Barbearia', url: 'sua-barbearia.com.br', title: 'Seu estilo, no horário certo', sub: 'Escolha o serviço e reserve em segundos.', btn: 'Agendar agora', agT: 'HORÁRIOS DE HOJE', slots: ['09:00', '10:30', '14:00', '16:30'], prods: ['Corte', 'Barba', 'Combo'], pbtn: 'Escolher', chat: ['Oi! Posso te ajudar a agendar?', ['Quero agendar', 'Onde fica?'], ['Show! Escolha um horário acima.', 'Te envio a localização agora.']],
        vid: ['Tour pela barbearia', 'Corte ao vivo', 'Clientes'], rev: [['Lucas M.', 'Agendei em 10 segundos. Atendimento nota 10!'], ['Rafael P.', 'Saí de lá outro homem. Voltarei sempre.']], gal: ['Degradê', 'Barba', 'Navalhado', 'Pigmentação'], addr: 'Rua das Flores, 123 · Centro', hrs: 'Aberto até 20h' },
      rest: { ic: 'utensils', n: 'Restaurante', url: 'seu-restaurante.com.br', title: 'Fome? Peça sem sair do lugar', sub: 'Cardápio digital com pedido direto.', btn: 'Ver cardápio', agT: 'RESERVAR MESA', slots: ['19:00', '20:00', '21:00', '22:00'], prods: ['Burger', 'Pizza', 'Suco'], pbtn: 'Adicionar', chat: ['Oi! Já quer fazer seu pedido?', ['Ver cardápio', 'Tem entrega?'], ['Abrindo o cardápio pra você!', 'Me passa seu endereço e eu confirmo.']],
        vid: ['Tour pela cozinha', 'Prato do dia', 'Clientes'], rev: [['Camila R.', 'Pedi pelo site e chegou quentinho!'], ['Bruno T.', 'Cardápio fácil, entrega no horário.']], gal: ['Burgers', 'Pizzas', 'Sobremesas', 'Bebidas'], addr: 'Av. Brasil, 450 · Centro', hrs: 'Aberto até 23h' },
      loja: { ic: 'bag', n: 'Loja', url: 'sua-loja.com.br', title: 'Sua loja aberta 24 horas', sub: 'Produtos, pagamento e entrega num só lugar.', btn: 'Comprar agora', agT: 'RETIRADA NA LOJA', slots: ['Hoje', 'Amanhã', 'Sábado'], prods: ['Camiseta', 'Tênis', 'Boné'], pbtn: 'Adicionar', chat: ['Oi! Procurando algum produto?', ['Ver novidades', 'Formas de pagar'], ['Separei as novidades pra você!', 'Pix e cartão, como preferir.']],
        vid: ['Conheça a loja', 'Novidades', 'Unboxing'], rev: [['Marina S.', 'Comprei por Pix e chegou rapidinho.'], ['Diego L.', 'Site rápido e produto igual à foto.']], gal: ['Camisetas', 'Tênis', 'Acessórios', 'Promoções'], addr: 'Rua do Comércio, 80', hrs: 'Aberto até 19h' },
      acad: { ic: 'dumbbell', n: 'Academia', url: 'sua-academia.com.br', title: 'Treine mais, falte menos', sub: 'Planos, aulas e acesso na palma da mão.', btn: 'Aula experimental', agT: 'AULA EXPERIMENTAL', slots: ['07:00', '12:00', '18:00', '19:30'], prods: ['Mensal', 'Trimestral', 'Anual'], pbtn: 'Escolher', chat: ['Oi! Quer conhecer a academia?', ['Ver planos', 'Aula grátis?'], ['Temos plano pra cada perfil.', 'Reserve o horário aqui em cima!']],
        vid: ['Tour pela academia', 'Aula em ação', 'Alunos'], rev: [['Paula G.', 'Reservei a aula pelo site, super fácil.'], ['André C.', 'Ambiente ótimo e treinos que funcionam.']], gal: ['Musculação', 'Funcional', 'Spinning', 'Alongamento'], addr: 'Av. Paraná, 900', hrs: 'Aberto das 6h às 22h' },
      serv: { ic: 'wrench', n: 'Serviços', url: 'seu-nome.com.br', title: 'Seu trabalho, bem apresentado', sub: 'Mostre o que faz e receba pedidos de orçamento.', btn: 'Pedir orçamento', agT: 'AGENDAR VISITA', slots: ['Seg', 'Ter', 'Qua', 'Qui'], prods: ['Orçamento', 'Visita', 'Serviço'], pbtn: 'Escolher', chat: ['Oi! Como posso ajudar?', ['Pedir orçamento', 'Ver trabalhos'], ['Me conta o que você precisa.', 'Já te mostro alguns trabalhos!']],
        vid: ['Nosso trabalho', 'Passo a passo', 'Clientes'], rev: [['Sérgio N.', 'Orçamento no mesmo dia, serviço impecável.'], ['Helena F.', 'Profissional pontual e caprichoso.']], gal: ['Projeto 1', 'Projeto 2', 'Antes e depois', 'Entrega'], addr: 'Atendemos toda a região', hrs: 'Segunda a sábado' }
    };
    const POW = {
      wa: ['chat', 'WhatsApp', 'Cliente chama com 1 toque'], agenda: ['calendar', 'Agendamento', 'Horários sem vai e volta'],
      loja: ['cart', 'Vendas online', 'Produtos e carrinho'], chat: ['bot', 'Chatbot', 'Responde sozinho, 24h'],
      video: ['video', 'Vídeos', 'Mostre seu trabalho'], reviews: ['star', 'Avaliações', 'Prova social'],
      galeria: ['image', 'Galeria', 'Fotos do seu trabalho'], mapa: ['pin', 'Localização', 'Como chegar']
    };
    const COLORS = [['Violeta', '#8b5cf6', '#6d28d9'], ['Azul', '#3b82f6', '#1d4ed8'], ['Rosa', '#ec4899', '#be185d'], ['Laranja', '#f97316', '#c2410c'], ['Verde', '#22c55e', '#15803d']];
    const KEYS = Object.keys(POW), TOTAL = KEYS.length;
    let ramo = 'barb', touched = false, cart = 0, vi = 0;
    const on = {}; KEYS.forEach(k => on[k] = false);

    mkR.innerHTML = Object.entries(RAMOS).map(([k, v], i) => `<label class="mk-ramo"><input type="radio" name="mkr" value="${k}" ${i === 0 ? 'checked' : ''}><span>${ic(v.ic)}<b>${v.n}</b></span></label>`).join('');
    $('#mk-powers').innerHTML = Object.entries(POW).map(([k, v]) => `<label class="mk-pow" title="${v[2]}"><input type="checkbox" name="mkp" value="${k}"><i class="mk-pow-ic">${ic(v[0])}</i><span><b>${v[1]}</b></span><em class="mk-sw" aria-hidden="true"></em></label>`).join('');
    $('#mk-colors').innerHTML = COLORS.map((c, i) => `<label class="mk-col" title="${c[0]}"><input type="radio" name="mkc" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="${c[0]}"><span style="--a:${c[1]};--b:${c[2]}"></span></label>`).join('');
    $('#mk-dev').innerHTML = [['desk', 'laptop', 'Computador'], ['phone', 'phone', 'Celular']].map(([v, i, t], n) => `<label><input type="radio" name="mkd" value="${v}" ${n === 0 ? 'checked' : ''}><span>${ic(i)}${t}</span></label>`).join('');

    const stage = $('.mk-stage'), br = $('#mk-browser'), pg = $('#mk-pg');
    const pop = el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

    const playVid = (go) => { const v = $('#mk-vid'); v.classList.remove('playing'); if (go) { void v.offsetWidth; v.classList.add('playing'); } $('#mk-play').setAttribute('aria-label', go ? 'Pausar vídeo' : 'Reproduzir vídeo'); };
    const renderVid = () => {
      const v = RAMOS[ramo];
      $('#mk-vid-list').innerHTML = v.vid.map((t, i) => `<button type="button" data-i="${i}" class="${i === vi ? 'sel' : ''}"><i>${i + 1}</i>${t}</button>`).join('');
      $('#mk-vid-cap').textContent = v.vid[vi]; $('#mk-vid').dataset.v = vi;
    };
    const renderRamo = () => {
      const v = RAMOS[ramo]; vi = 0;
      $('#mk-url').textContent = v.url; $('#mk-tag').textContent = v.n.toUpperCase();
      $('#mk-title').textContent = v.title; $('#mk-sub').textContent = v.sub; $('#mk-btn').textContent = v.btn;
      $('#mk-art').innerHTML = ic(v.ic); $('#mk-agenda-t').textContent = v.agT;
      $('#mk-slots').innerHTML = v.slots.map((s, i) => `<button type="button" class="mk-slot${i === 1 ? ' sel' : ''}">${s}</button>`).join('');
      $('#mk-prods').innerHTML = v.prods.map(p => `<div class="mk-prod"><div class="mk-prod-img">${ic(v.ic)}</div><b>${p}</b><i class="mk-prod-line"></i><button type="button" class="mk-add">${v.pbtn}</button></div>`).join('');
      $('#mk-gal').innerHTML = v.gal.map((g, i) => `<button type="button" class="mk-g g${i}${i === 0 ? ' sel' : ''}">${ic(i % 2 ? 'image' : v.ic)}<span>${g}</span></button>`).join('');
      $('#mk-rev').innerHTML = v.rev.map(r => `<div class="mk-r"><i>${r[0][0]}</i><div><b>${r[0]}</b><span class="mk-stars" aria-hidden="true">★★★★★</span><p>${r[1]}</p></div></div>`).join('');
      $('#mk-addr').textContent = v.addr; $('#mk-hrs').textContent = v.hrs;
      $('#mk-chat-b').innerHTML = `<div class="mk-m bot">${v.chat[0]}</div>`;
      $('#mk-chat-q').innerHTML = v.chat[1].map((q, i) => `<button type="button" data-i="${i}">${q}</button>`).join('');
      $$('#mk-rate button').forEach(b => b.classList.remove('sel')); $('#mk-rate-t').textContent = 'Toque para avaliar';
      cart = 0; $('#mk-cart-n').textContent = '0';
      renderVid(); playVid(false); pg.scrollTo({ top: 0, behavior: 'smooth' });
      pop($('.mk-hero-tx')); pop($('#mk-art'));
    };
    const sync = () => {
      const n = KEYS.filter(k => on[k]).length;
      KEYS.forEach(k => {
        br.querySelectorAll(`[data-mod="${k}"]`).forEach(el => el.classList.toggle('on', on[k]));
        const i = $(`input[name=mkp][value=${k}]`); if (i) i.checked = on[k];
      });
      $('#mk-count').textContent = n === TOTAL ? 'Completo!' : n + '/' + TOTAL + ' poderes';
      $('#mk-bar').style.width = (n * 100 / TOTAL) + '%';
      stage.classList.toggle('full', n === TOTAL);
      $('#mk-cart').classList.toggle('on', on.loja);
      const names = KEYS.filter(k => on[k]).map(k => POW[k][1].toLowerCase());
      const msg = `Olá, Zyntek! Montei o meu site no simulador. Ramo: ${RAMOS[ramo].n}. Poderes: ${names.length ? names.join(', ') : 'ainda não escolhi'}. Quero conversar sobre ele!`;
      const url = 'https://wa.me/554488317870?text=' + encodeURIComponent(msg);
      $('#mk-cta').href = url; $('.mk-wa', br).href = url;
    };
    const goTo = k => {
      const m = $(`.mk-mod[data-mod="${k}"]`, br); if (!m) return;
      setTimeout(() => pg.scrollTo({ top: Math.max(0, m.offsetTop - 10), behavior: 'smooth' }), 150);
    };

    mkR.addEventListener('change', e => { touched = true; ramo = e.target.value; renderRamo(); sync(); });
    $('#mk-powers').addEventListener('change', e => { touched = true; on[e.target.value] = e.target.checked; sync(); if (e.target.checked) goTo(e.target.value); });
    $('#mk-colors').addEventListener('change', e => { touched = true; const c = COLORS[+e.target.value]; br.style.setProperty('--mk-a', c[1]); br.style.setProperty('--mk-b', c[2]); });
    $('#mk-dev').addEventListener('change', e => { touched = true; br.classList.toggle('is-phone', e.target.value === 'phone'); });
    br.addEventListener('click', e => {
      const sl = e.target.closest('.mk-slot');
      if (sl) { $$('.mk-slot', br).forEach(x => x.classList.toggle('sel', x === sl)); return; }
      const ad = e.target.closest('.mk-add');
      if (ad) {
        cart++; $('#mk-cart-n').textContent = cart; pop($('#mk-cart'));
        ad.classList.add('added'); ad.textContent = 'Adicionado';
        setTimeout(() => { ad.classList.remove('added'); ad.textContent = RAMOS[ramo].pbtn; }, 1200);
        return;
      }
      if (e.target.closest('#mk-play')) { playVid(!$('#mk-vid').classList.contains('playing')); return; }
      const vb = e.target.closest('#mk-vid-list button');
      if (vb) { vi = +vb.dataset.i; renderVid(); playVid(true); return; }
      const g = e.target.closest('.mk-g');
      if (g) { $$('.mk-g', br).forEach(x => x.classList.toggle('sel', x === g)); return; }
      const st = e.target.closest('#mk-rate button');
      if (st) {
        const bs = $$('#mk-rate button'), i = bs.indexOf(st);
        bs.forEach((b, j) => b.classList.toggle('sel', j <= i));
        $('#mk-rate-t').textContent = 'Obrigado pela avaliação!'; return;
      }
      const q = e.target.closest('.mk-chat-q button');
      if (q) {
        const i = +q.dataset.i, b = $('#mk-chat-b');
        b.insertAdjacentHTML('beforeend', `<div class="mk-m me">${RAMOS[ramo].chat[1][i]}</div>`);
        q.remove(); b.scrollTop = b.scrollHeight;
        setTimeout(() => { b.insertAdjacentHTML('beforeend', `<div class="mk-m bot">${RAMOS[ramo].chat[2][i]}</div>`); b.scrollTop = b.scrollHeight; }, 500);
      }
    });
    br.addEventListener('click', e => { if (e.target.closest('.mk-wa')) e.preventDefault(); });

    renderRamo(); sync();
    /* Demonstração automática: os poderes ligam um a um quando a seção aparece (só se a pessoa ainda não mexeu) */
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return; io.disconnect();
        KEYS.forEach((k, i) => setTimeout(() => { if (touched) return; on[k] = true; sync(); goTo(k); }, 600 + i * 900));
      }, { threshold: .45 });
      io.observe(stage);
    }
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

  /* Projetos: a página "trava" e o scroll vertical anda os cards para o lado.
     Otimizado: 1 leitura de layout por frame; destaque do card ativo via classe (sem opacity/scale por frame). */
  const pin = $('.projects-pin');
  if (pin && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = $('.projects-grid', pin), cards = $$('.project-card', pin);
    const bar = $('.proj-bar b', pin), cnt = $('.proj-count', pin);
    pin.classList.add('is-scroll');
    pin.style.setProperty('--n', cards.length);
    cards.forEach(c => c.classList.add('in-view'));
    let total = 1, dist = 0, cur = -1, queued = false;
    const upd = () => {
      queued = false;
      const p = Math.max(0, Math.min(1, -pin.getBoundingClientRect().top / total));
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      const idx = Math.round(p * (cards.length - 1));
      if (idx !== cur) {
        cur = idx;
        cnt.textContent = (idx + 1) + ' / ' + cards.length;
        cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
      }
    };
    const measure = () => { total = Math.max(1, pin.offsetHeight - innerHeight); dist = Math.max(0, track.scrollWidth - innerWidth); upd(); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', measure); addEventListener('load', measure); measure();
  }

  /* Reveal suave ao entrar na tela */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }), { threshold: .15 });
    $$('.founders-intro, .fcenter, .mk-intro, .mk-stage').forEach(el => { el.classList.add('reveal'); io.observe(el); });
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


/* ==========================================================
   v7 — vídeos só tocam quando visíveis + botão flutuante
========================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    }), { rootMargin: '150px' });
    document.querySelectorAll('video').forEach(v => { if (v.id === 'hero-video') return; v.muted = true; vio.observe(v); });
  }

  const fab = $('#zfab'); if (!fab) return;
  const pill = $('#zpill'), panel = $('#zpanel'), body = $('#zpanel-body');
  const msgs = $('#zfaq-msgs'), qbox = $('#zfaq-q');
  const WA = 'https://wa.me/554488317870?text=';
  const IMG = 'zynk-mascote.png';

  const FAQ = [
    ['Quais serviços vocês fazem?', 'Desenvolvemos software e sistemas sob medida, automações e chatbots com IA, landing pages, lojas virtuais e UI/UX.'],
    ['Quanto custa um projeto?', 'O valor depende do que você precisa. Veja a página de <a href="precos.html">Planos</a> ou peça um orçamento pelo WhatsApp.'],
    ['Como peço um orçamento?', 'Pelo botão de WhatsApp aqui no painel ou pelo <a href="#contatos">formulário de contato</a>. Conte rapidamente a sua ideia.'],
    ['Posso ver exemplos de projetos?', 'Claro! Role até a seção <a href="#projetos">Projetos</a> e clique em "Veja exemplo" em cada card.'],
    ['Quem vai me atender?', 'Os dois fundadores, Henrique (CTO) e Levy (COO &amp; CDO). O contato é direto, sem intermediários.'],
    ['Vocês ajudam depois da entrega?', 'Sim. O mesmo time acompanha o projeto depois da entrega e, se algo quebrar, a gente resolve.']
  ];
  const add = (who, html, typing) => {
    const d = document.createElement('div'); d.className = 'zmsg ' + who + (typing ? ' typing' : '');
    d.innerHTML = who === 'bot' ? `<img src="${IMG}" alt=""><div>${typing ? '<span class="zdots"><i></i><i></i><i></i></span>' : html}</div>` : `<div>${html}</div>`;
    msgs.appendChild(d); d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return d;
  };
  const greet = () => { if (!msgs.children.length) add('bot', 'Olá! Sou o Zynk, assistente da Zyntek. Selecione uma pergunta abaixo para ver a resposta imediata:'); };
  const setOpen = on => {
    fab.classList.toggle('open', on);
    pill.setAttribute('aria-expanded', on); panel.setAttribute('aria-hidden', !on);
    pill.setAttribute('aria-label', on ? 'Fechar atendimento Zyntek' : 'Abrir atendimento Zyntek');
    if (on) greet();
  };
  FAQ.forEach(([q, a]) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = q;
    b.addEventListener('click', () => {
      add('me', q);
      const t = add('bot', '', true);
      setTimeout(() => { t.classList.remove('typing'); t.lastElementChild.innerHTML = a; t.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 550);
    });
    qbox.appendChild(b);
  });
  pill.addEventListener('click', () => setOpen(!fab.classList.contains('open')));
  $('#zpanel-x').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  panel.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) setOpen(false); });
})();