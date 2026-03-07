// Переключение темы
let styleMode = localStorage.getItem('styleMode') || 'dark';
const styleToggles = document.querySelectorAll('.toggle-theme');

const updateThemeImages = (theme) => {
    document.querySelectorAll('[data-theme-image]').forEach((img) => {
        try {
            const sources = JSON.parse(img.dataset.themeImage);
            if (sources[theme]) {
                img.src = sources[theme];

                if (img.srcset) {
                    const srcsetSources = JSON.parse(img.dataset.themeImageSrcset || '{}');
                    if (srcsetSources[theme]) {
                        img.srcset = srcsetSources[theme];
                    }
                }
            }
        } catch (e) {
            console.error('Ошибка парсинга data-theme-image:', e);
        }
    });
};

const updateAllToggleButtons = (theme) => {
    styleToggles.forEach((toggle) => {
        if (theme === 'light') {
            toggle.setAttribute('data-theme', 'light');
            toggle.setAttribute('aria-label', 'Включить тёмную тему');
            toggle.setAttribute('title', 'Включить тёмную тему');
            toggle.setAttribute('aria-pressed', 'false');

            const buttonText = toggle.querySelector('.header-theme__button-text');
            const authButtonText = document.querySelector('.auth-theme__button-text');
            if (buttonText) {
                buttonText.textContent = 'Dark';
            }
            if (authButtonText) {
                authButtonText.textContent = 'Dark';
            }
        } else {
            toggle.setAttribute('data-theme', 'dark');
            toggle.setAttribute('aria-label', 'Включить светлую тему');
            toggle.setAttribute('title', 'Включить светлую тему');
            toggle.setAttribute('aria-pressed', 'true');

            const buttonText = toggle.querySelector('.header-theme__button-text');
            const authButtonText = document.querySelector('.auth-theme__button-text');
            if (buttonText) {
                buttonText.textContent = 'Light';
            }
            if (authButtonText) {
                authButtonText.textContent = 'Light';
            }
        }
    });
};

// Включение светлой темы
const enableLightStyle = () => {
    document.body.classList.add('light-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('styleMode', 'light');

    updateThemeImages('light');
    updateAllToggleButtons('light');
};

// Включение темной темы
const enableDarkStyle = () => {
    document.body.classList.remove('light-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('styleMode', 'dark');

    updateThemeImages('dark');
    updateAllToggleButtons('dark');
};

styleToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        styleMode = localStorage.getItem('styleMode') || 'dark';

        if (styleMode !== 'light') {
            enableLightStyle();
        } else {
            enableDarkStyle();
        }

        document.dispatchEvent(
            new CustomEvent('themechange', {
                detail: { theme: styleMode === 'light' ? 'dark' : 'light' },
            })
        );
    });
});

if (styleMode === 'light') {
    enableLightStyle();
} else {
    enableDarkStyle();
}

// Инпут в шапке на комп версии + адаптивное меню
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.header-bottom__input');
    const resultElement = document.querySelector('.header-bottom__result');
    const menuContainer = document.querySelector('.header-bottom__menu');

    if (!searchInput) return;

    let resizeTimeout;
    let blurTimeout;
    let realMenuItems = [];
    let manualCollapse = false;
    let moreButtonClicked = false;

    function getMinWidth() {
        const screenWidth = window.innerWidth;
        return screenWidth < 1215 ? 215 : 294;
    }

    function getMaxWidth() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1920) return 620;
        if (screenWidth >= 1635) return 560;
        if (screenWidth >= 1570) return 500;
        return 460;
    }

    function getMaxVisibleItems() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1500) return 9;
        if (screenWidth >= 1440) return 8;
        return 7;
    }

    function cleanupMenu() {
        if (menuContainer) {
            const items = menuContainer.querySelectorAll('li');
            items.forEach((item) => {
                item.style.display = '';
            });

            const moreBtn = menuContainer.querySelector('.header-bottom__more-btn');
            if (moreBtn) {
                moreBtn.closest('li').remove();
            }
        }
    }

    function adaptMenu() {
        if (manualCollapse || moreButtonClicked) return;

        if (window.innerWidth > 1500) {
            cleanupMenu();
            return;
        }

        if (!menuContainer) return;

        const hasFocus = document.activeElement === searchInput;
        const hasValue = searchInput.value.trim().length > 0;
        const inputExpanded = hasFocus || hasValue;

        if (!inputExpanded) {
            cleanupMenu();
            return;
        }

        const maxVisibleItems = getMaxVisibleItems();
        const allItems = menuContainer.querySelectorAll('li');
        realMenuItems = Array.from(allItems).filter((item) => {
            const btn = item.querySelector('.header-bottom__more-btn');
            return !btn;
        });

        const oldMoreBtn = menuContainer.querySelector('.header-bottom__more-btn');
        if (oldMoreBtn) {
            oldMoreBtn.closest('li').remove();
        }

        realMenuItems.forEach((item, index) => {
            if (index < maxVisibleItems) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        if (realMenuItems.length > maxVisibleItems) {
            createMoreButton();
        }
    }

    function createMoreButton() {
        const moreButton = document.createElement('li');
        moreButton.innerHTML = `
            <button class="header-bottom__more-btn" aria-label="Показать все пункты меню"></button>`;

        menuContainer.appendChild(moreButton);

        const moreBtn = moreButton.querySelector('.header-bottom__more-btn');
        moreBtn.addEventListener('click', function (e) {
            e.stopPropagation();

            manualCollapse = true;
            moreButtonClicked = true;

            const currentMinWidth = getMinWidth();
            searchInput.style.width = currentMinWidth + 'px';
            searchInput.style.transition = 'none';

            searchInput.blur();

            showAllMenuItems();

            moreButton.remove();

            if (resultElement) {
                resultElement.classList.remove('header-bottom__result--active');
            }

            clearTimeout(blurTimeout);
            clearTimeout(resizeTimeout);

            setTimeout(() => {
                searchInput.style.transition = '';
            }, 10);

            setTimeout(() => {
                manualCollapse = false;
                moreButtonClicked = false;
            }, 300);
        });
    }

    function showAllMenuItems() {
        if (menuContainer) {
            realMenuItems.forEach((item) => {
                item.style.display = '';
            });
        }
    }

    function updateInputWidth() {
        if (manualCollapse || moreButtonClicked) return;

        const hasValue = searchInput.value.trim().length > 0;
        const hasFocus = document.activeElement === searchInput;
        const currentMinWidth = getMinWidth();
        const currentMaxWidth = getMaxWidth();

        if (hasFocus || hasValue) {
            searchInput.style.width = currentMaxWidth + 'px';
        } else {
            searchInput.style.width = currentMinWidth + 'px';
        }
    }

    function updateResultState() {
        if (!resultElement) return;
        const hasValue = searchInput.value.trim().length > 0;
        const hasFocus = document.activeElement === searchInput;

        if (hasValue && hasFocus) {
            resultElement.classList.add('header-bottom__result--active');
        } else {
            resultElement.classList.remove('header-bottom__result--active');
        }
    }

    function initialize() {
        adaptMenu();
        updateInputWidth();
        if (searchInput.value.trim()) {
            const currentMaxWidth = getMaxWidth();
            searchInput.style.width = currentMaxWidth + 'px';
        }
    }

    searchInput.addEventListener('input', function () {
        manualCollapse = false;
        moreButtonClicked = false;
        updateInputWidth();
        updateResultState();
        adaptMenu();
    });

    searchInput.addEventListener('focus', function () {
        manualCollapse = false;
        moreButtonClicked = false;
        const currentMaxWidth = getMaxWidth();
        this.style.width = currentMaxWidth + 'px';

        if (this.value.trim() && resultElement) {
            resultElement.classList.add('header-bottom__result--active');
        }

        adaptMenu();
        clearTimeout(blurTimeout);
    });

    searchInput.addEventListener('blur', function () {
        clearTimeout(blurTimeout);

        if (moreButtonClicked) return;

        blurTimeout = setTimeout(() => {
            if (document.activeElement !== this && !manualCollapse && !moreButtonClicked) {
                updateInputWidth();
                updateResultState();
                adaptMenu();
            }
        }, 200);
    });

    searchInput.addEventListener('keydown', function (e) {
        if (!resultElement) return;
        if (e.key === 'Escape') {
            this.blur();
            resultElement.classList.remove('header-bottom__result--active');
        }

        if (e.key === 'Enter' && !this.closest('form')) {
            resultElement.classList.remove('header-bottom__result--active');
        }
    });

    if (resultElement) {
        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !resultElement.contains(e.target)) {
                resultElement.classList.remove('header-bottom__result--active');
                updateInputWidth();
                document.querySelector('.header-bottom__input').value = '';
            }
        });
    }

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);

        if (!moreButtonClicked) {
            adaptMenu();
        }

        const hasValue = searchInput.value.trim().length > 0;
        const hasFocus = document.activeElement === searchInput;
        const currentMinWidth = getMinWidth();
        const currentMaxWidth = getMaxWidth();

        resizeTimeout = setTimeout(() => {
            if (!moreButtonClicked) {
                if (hasFocus || hasValue) {
                    searchInput.style.width = currentMaxWidth + 'px';
                } else {
                    searchInput.style.width = currentMinWidth + 'px';
                }
            }
        }, 150);
    });

    initialize();
});

// Открытие и закрытие мобильного меню
document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.header-mobile__button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuButton || !mobileMenu) return;

    const openMobileMenu = () => {
        mobileMenu.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Закрыть меню');
        menuButton.setAttribute('title', 'Нажмите чтобы закрыть меню');
        menuButton.classList.add('header-mobile__button--active');
        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', handleEscapeKey);
    };

    const closeMobileMenu = () => {
        mobileMenu.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
        menuButton.setAttribute('title', 'Нажмите чтобы открыть меню');
        menuButton.classList.remove('header-mobile__button--active');
        document.body.style.overflow = '';

        closeAllSubmenus();
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const closeAllSubmenus = () => {
        const mainMenu = mobileMenu.querySelector('.header-mobile__main-menu');
        const allSubmenus = mobileMenu.querySelectorAll('.header-mobile__submenu-nav');
        const openButtons = mobileMenu.querySelectorAll('.header-mobile__open-btn');

        if (mainMenu) {
            mainMenu.removeAttribute('hidden');
        }

        allSubmenus.forEach((sub) => {
            sub.setAttribute('hidden', '');
        });

        openButtons.forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
        });
    };

    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    };

    menuButton.addEventListener('click', () => {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (!link.classList.contains('header-mobile__open-btn')) {
                closeMobileMenu();
            }
        });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1150) {
            closeMobileMenu();
        }
    });

    closeMobileMenu();
});

// Мобильное меню - открытие подменю
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.querySelector('.header-mobile__menu');
    if (!mobileMenu) return;

    const mainMenu = mobileMenu.querySelector('.header-mobile__main-menu');
    const allSubmenus = mobileMenu.querySelectorAll('.header-mobile__submenu-nav');
    const openButtons = mobileMenu.querySelectorAll('.header-mobile__open-btn');
    const searchForm = document.querySelector('.header-mobile__search-form');

    const toggleSearchForm = (show) => {
        if (searchForm) {
            if (show) {
                searchForm.removeAttribute('hidden');
            } else {
                searchForm.setAttribute('hidden', '');
            }
        }
    };

    openButtons.forEach((button) => {
        button.addEventListener('click', function () {
            const submenuId = this.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);

            if (!submenu) return;

            allSubmenus.forEach((sub) => {
                sub.setAttribute('hidden', '');
            });

            if (mainMenu) {
                mainMenu.setAttribute('hidden', '');
            }

            submenu.removeAttribute('hidden');
            toggleSearchForm(false);

            this.setAttribute('aria-expanded', 'true');

            openButtons.forEach((btn) => {
                if (btn !== this) {
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    const backButtons = mobileMenu.querySelectorAll('.header-mobile__back-btn');

    backButtons.forEach((button) => {
        button.addEventListener('click', function () {
            const submenu = this.closest('.header-mobile__submenu-nav');

            if (!submenu) return;

            submenu.setAttribute('hidden', '');

            if (mainMenu) {
                mainMenu.removeAttribute('hidden');
                toggleSearchForm(true);
            }

            const submenuId = submenu.id;
            const openButton = mobileMenu.querySelector(`[aria-controls="${submenuId}"]`);
            if (openButton) {
                openButton.setAttribute('aria-expanded', 'false');
            }
        });
    });

    mobileMenu.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const visibleSubmenu = mobileMenu.querySelector('.header-mobile__submenu-nav:not([hidden])');

            if (visibleSubmenu) {
                const backButton = visibleSubmenu.querySelector('.header-mobile__back-btn');
                if (backButton) {
                    backButton.click();
                }
            } else if (mainMenu && mainMenu.hasAttribute('hidden')) {
                allSubmenus.forEach((submenu) => {
                    if (!submenu.hasAttribute('hidden')) {
                        const backButton = submenu.querySelector('.header-mobile__back-btn');
                        if (backButton) backButton.click();
                    }
                });
            }
        }
    });

    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function () {
            allSubmenus.forEach((sub) => {
                sub.setAttribute('hidden', '');
            });

            if (mainMenu) {
                mainMenu.removeAttribute('hidden');
                toggleSearchForm(true);
            }

            openButtons.forEach((button) => {
                button.setAttribute('aria-expanded', 'false');
            });
        });
    }

    toggleSearchForm(true);
});

// Плавно выезжающий заголовок
document.addEventListener('DOMContentLoaded', function () {
    const triggers = document.querySelectorAll('[data-scroll-trigger]');

    if (triggers.length === 0) return;

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const title = entry.target.closest('.info-column')?.querySelector('[data-scroll-title]');

                    if (title && !title.classList.contains('title-visible')) {
                        setTimeout(function () {
                            title.classList.add('title-visible');
                        }, 200);

                        observer.unobserve(entry.target);
                    }
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px',
        }
    );

    triggers.forEach(function (trigger) {
        observer.observe(trigger);

        const title = trigger.closest('.info-column')?.querySelector('[data-scroll-title]');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            title.style.transition = 'all 0.6s ease';
        }
    });

    function checkInitialVisibility() {
        triggers.forEach(function (trigger) {
            const rect = trigger.getBoundingClientRect();
            const title = trigger.closest('.info-column')?.querySelector('[data-scroll-title]');

            if (title && !title.classList.contains('title-visible') && rect.top < window.innerHeight && rect.bottom > 0) {
                setTimeout(function () {
                    title.classList.add('title-visible');
                }, 100);
            }
        });
    }

    checkInitialVisibility();
});

// Слайдер
document.addEventListener('DOMContentLoaded', function () {
    const sliders = document.querySelectorAll('.blocks-swiper');
    if (sliders.length === 0) {
        return;
    }

    const swiperInstances = [];

    sliders.forEach((sliderElement, index) => {
        try {
            const swiperConfig = {
                speed: 500,
                slidesPerView: 'auto',
                spaceBetween: 12,
                observer: true,
                preventInteractionOnTransition: true,

                breakpoints: {
                    1405: {
                        slidesPerView: 3,
                        spaceBetween: 18,
                    },
                },
            };

            const swiperInstance = new Swiper(sliderElement, swiperConfig);

            swiperInstances.push({
                element: sliderElement,
                instance: swiperInstance,
                index: index,
            });
        } catch (error) {
            console.error(`Ошибка при инициализации Swiper ${index + 1}:`, error);
        }
    });

    window.swiperInstances = swiperInstances;
});

// Функция для lazy loading background images
function lazyLoadBackgroundImages() {
    // Находим все элементы с data-bg атрибутом
    const lazyBackgrounds = document.querySelectorAll('[data-bg]');

    if (lazyBackgrounds.length === 0) return;

    // Создаем Intersection Observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bgUrl = element.dataset.bg;

                    // Загружаем изображение
                    loadBackgroundImage(element, bgUrl);

                    // Перестаем наблюдать после загрузки
                    observer.unobserve(element);
                }
            });
        },
        {
            rootMargin: '50px 0px', // Начинаем загрузку за 50px до попадания в viewport
            threshold: 0.01,
        }
    );

    // Начинаем наблюдение
    lazyBackgrounds.forEach((element) => {
        observer.observe(element);
    });
}

// Функция загрузки фонового изображения (loading=lazy)
function loadBackgroundImage(element, url) {
    const img = new Image();

    img.onload = function () {
        element.style.backgroundImage = `url('${url}')`;
        element.classList.add('bg-loaded'); // Добавляем класс для анимации
    };

    img.onerror = function () {
        console.error('Ошибка загрузки фонового изображения:', url);

        const fallbackUrl = element.getAttribute('data-bg-fallback');
        if (fallbackUrl && fallbackUrl !== url) {
            loadBackgroundImage(element, fallbackUrl);
        }
    };

    img.src = url;
}

document.addEventListener('DOMContentLoaded', lazyLoadBackgroundImages);

// Background изображения для различных версий (темная комп, моб) и (светлая комп, моб)
function initBackgroundImages() {
    function loadBg(element) {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const isMobile = window.innerWidth <= 480;

        let imageUrl;

        if (isMobile) {
            imageUrl = element.getAttribute(`data-bg-mobile-${theme}`);
        } else {
            imageUrl = element.getAttribute(`data-bg-desktop-${theme}`);
        }

        if (!imageUrl) imageUrl = element.getAttribute('data-bg');

        if (imageUrl) {
            const img = new Image();
            img.onload = () => (element.style.backgroundImage = `url('${imageUrl}')`);
            img.src = imageUrl;
        }
    }

    const elements = document.querySelectorAll('[data-bg-desktop-dark], [data-bg-mobile-dark]');
    elements.forEach(loadBg);

    document.addEventListener('themechange', () => {
        elements.forEach(loadBg);
    });

    window.addEventListener('resize', () => {
        elements.forEach(loadBg);
    });
}

document.addEventListener('DOMContentLoaded', initBackgroundImages);

//Открытие закрытие вопроса
document.addEventListener('DOMContentLoaded', function () {
    const faqButtons = document.querySelectorAll('.faq-item__button');

    faqButtons.forEach((button) => {
        const answer = button.closest('.faq-item').querySelector('.faq-item__answer');

        answer.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        answer.style.overflow = 'hidden';
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';

        button.addEventListener('click', function () {
            if (answer.classList.contains('open')) {
                answer.style.maxHeight = '0';
                answer.style.opacity = '0';
                answer.classList.remove('open');
                button.classList.remove('faq-item__button--active');
                button.setAttribute('aria-expanded', 'false');

                setTimeout(() => {
                    answer.hidden = true;
                }, 300);
            } else {
                answer.hidden = false;

                setTimeout(() => {
                    const height = answer.scrollHeight + 'px';
                    answer.style.maxHeight = height;
                    answer.style.opacity = '1';
                    answer.classList.add('open');
                    button.classList.add('faq-item__button--active');
                    button.setAttribute('aria-expanded', 'true');
                }, 10);
            }
        });
    });
});

//Кастомный селект
const selectElements = document.querySelectorAll('[data-select]');

selectElements.forEach((selectElement) => {
    new Choices(selectElement, {
        searchEnabled: false,
        itemSelectText: '',
        placeholder: true,
        placeholderValue: 'Сортировка',
        shouldSort: false,
    });
});

//Модальное окно для изображений в отзыве
const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,

    openEffect: 'fade',
    closeEffect: 'fade',
    slideEffect: 'slide',

    moreLength: 60,

    arrows: true,
    closeButton: true,
});

//Скрытие табов, если их больше 5
document.addEventListener('DOMContentLoaded', function () {
    const tabsContainer = document.querySelector('nav[aria-label="Фильтры вопросов"]');
    if (!tabsContainer) return;

    const tabsList = tabsContainer.querySelector('.tabs');
    const tabsItems = Array.from(tabsList.querySelectorAll('li'));
    const breakpoint = 991;
    const visibleLimit = 3;

    let toggleButton, toggleBtn, hiddenContainer, hiddenElementsContainer;
    let isMobileMode = false;

    function initMobileMode() {
        if (isMobileMode) return;

        toggleButton = document.createElement('li');
        toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Развернуть все темы';
        toggleBtn.className = 'tabs-toggle';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('type', 'button');
        toggleBtn.setAttribute('aria-controls', 'tabs-content');

        toggleButton.appendChild(toggleBtn);
        toggleButton.style.display = '';

        tabsList.appendChild(toggleButton);

        if (tabsItems.length > visibleLimit) {
            hiddenElementsContainer = document.createElement('div');
            hiddenElementsContainer.className = 'tabs-hidden-container';
            hiddenElementsContainer.style.cssText = `
                width: 100%;
                overflow: hidden;
                transition: height 0.3s ease;
            `;

            for (let i = visibleLimit; i < tabsItems.length; i++) {
                hiddenElementsContainer.appendChild(tabsItems[i]);
            }

            // Добавляем контейнер обратно в список
            if (hiddenElementsContainer.children.length > 0) {
                const containerWrapper = document.createElement('li');
                containerWrapper.style.cssText = `
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                `;
                containerWrapper.appendChild(hiddenElementsContainer);
                tabsList.insertBefore(containerWrapper, toggleButton);
            }

            hiddenContainer = tabsList.querySelector('.tabs-hidden-container');

            window.isTabsExpanded = false;
            if (hiddenContainer) {
                collapseTabs();
            }

            toggleBtn.addEventListener('click', handleToggleClick);
            toggleBtn.addEventListener('keydown', handleKeydown);

            isMobileMode = true;
        } else {
            toggleButton.style.display = 'none';
        }
    }

    function destroyMobileMode() {
        if (!isMobileMode) return;

        if (toggleBtn) {
            toggleBtn.removeEventListener('click', handleToggleClick);
            toggleBtn.removeEventListener('keydown', handleKeydown);
        }

        if (hiddenContainer && hiddenElementsContainer) {
            const containerItems = Array.from(hiddenElementsContainer.children);
            const containerWrapper = hiddenContainer.parentElement;

            containerItems.forEach((item, index) => {
                tabsList.insertBefore(item, containerWrapper);
            });

            if (containerWrapper) {
                containerWrapper.remove();
            }
        }

        if (toggleButton && toggleButton.parentNode) {
            toggleButton.remove();
        }

        toggleButton = null;
        toggleBtn = null;
        hiddenContainer = null;
        hiddenElementsContainer = null;
        isMobileMode = false;
        window.isTabsExpanded = false;
    }

    // Свернуть табы
    async function collapseTabs() {
        if (!hiddenContainer) return;

        toggleBtn.disabled = true;

        try {
            const startHeight = hiddenContainer.scrollHeight;
            hiddenContainer.style.height = `${startHeight}px`;
            hiddenContainer.style.overflow = 'hidden';

            requestAnimationFrame(() => {
                hiddenContainer.style.height = '0px';
                hiddenContainer.style.opacity = '0';
            });

            await new Promise((resolve) => {
                setTimeout(() => {
                    hiddenContainer.style.display = 'none';
                    toggleBtn.textContent = 'Развернуть все темы';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    window.isTabsExpanded = false;
                    resolve();
                }, 300);
            });
        } finally {
            toggleBtn.disabled = false;
        }
    }

    // Развернуть все табы
    async function expandTabs() {
        if (!hiddenContainer) return;

        toggleBtn.disabled = true;

        try {
            hiddenContainer.style.display = '';
            hiddenContainer.style.opacity = '0';
            hiddenContainer.style.height = '0px';
            hiddenContainer.style.overflow = 'hidden';

            const endHeight = hiddenContainer.scrollHeight;

            requestAnimationFrame(() => {
                hiddenContainer.style.height = `${endHeight}px`;
                hiddenContainer.style.opacity = '1';
            });

            await new Promise((resolve) => {
                setTimeout(() => {
                    hiddenContainer.style.height = '';
                    hiddenContainer.style.overflow = '';
                    toggleBtn.textContent = 'Свернуть все темы';
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    window.isTabsExpanded = true;
                    resolve();
                }, 300);
            });
        } finally {
            toggleBtn.disabled = false;
        }
    }

    function handleToggleClick(e) {
        e.preventDefault();

        if (window.innerWidth > breakpoint) return;

        if (window.isTabsExpanded) {
            collapseTabs();
        } else {
            expandTabs();
        }
    }

    function handleKeydown(e) {
        if ((e.key === 'Enter' || e.key === ' ') && window.innerWidth <= breakpoint) {
            e.preventDefault();
            handleToggleClick(e);
        }
    }

    function checkAndToggleMode() {
        const isMobile = window.innerWidth <= breakpoint;
        const hasManyTabs = tabsItems.length > visibleLimit;

        if (isMobile && hasManyTabs) {
            if (!isMobileMode) {
                initMobileMode();
            }
        } else {
            if (isMobileMode) {
                destroyMobileMode();
            }
        }
    }

    checkAndToggleMode();

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            checkAndToggleMode();
        }, 250);
    });

    window.tabsExpand = expandTabs;
    window.tabsCollapse = collapseTabs;
});

//Кастомный скролл
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.custom-scroll').forEach((element) => {
        new SimpleBar(element, {
            autoHide: true,
            forceVisible: 'y',
        });
    });
});

// Все слайды
document.addEventListener('DOMContentLoaded', function () {
    initSliders();
});

function initSliders() {
    const allSliders = document.querySelectorAll('.slider');

    allSliders.forEach((sliderElement) => {
        const swiperContainer = sliderElement.querySelector('.swiper');

        if (!swiperContainer) return;

        const wrapper = swiperContainer.querySelector('.swiper-wrapper');
        const slides = swiperContainer.querySelectorAll('.swiper-slide');

        if (!wrapper || slides.length === 0) return;

        const nextButton = sliderElement.querySelector('.slider-button--next');
        const prevButton = sliderElement.querySelector('.slider-button--prev');

        const swiper = new Swiper(swiperContainer, {
            slidesPerView: 'auto',
            spaceBetween: 12,
            watchOverflow: true,
            resistance: true,
            resistanceRatio: 0,
            loop: false,
            navigation:
                nextButton && prevButton
                    ? {
                          nextEl: nextButton,
                          prevEl: prevButton,
                      }
                    : false,
            breakpoints: {
                1405: {
                    slidesPerView: 4,
                    spaceBetween: 18,
                },
            },
            speed: 300,
        });
    });
}

// ОТЗЫВЫ И ВОПРОС-ОТВЕТЫ - модалки
function initSimpleBar(el) {
    if (!el) return;

    if (el.SimpleBar) {
        el.SimpleBar.recalculate();
        return;
    }

    new SimpleBar(el, {
        autoHide: true,
        forceVisible: 'y',
    });
}

let savedScrollTop = 0;
let isScrollLocked = false;

function lockPageScroll() {
    if (isScrollLocked) return;

    savedScrollTop = window.scrollY || document.documentElement.scrollTop;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'relative';
    document.documentElement.style.height = '100%';

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollTop}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    isScrollLocked = true;

    // Уведомляем другие компоненты о блокировке скролла
    document.documentElement.setAttribute('data-scroll-locked', 'true');
}

function unlockPageScroll() {
    if (!isScrollLocked) return;

    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.documentElement.style.height = '';

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    window.scrollTo(0, savedScrollTop);

    isScrollLocked = false;

    document.documentElement.removeAttribute('data-scroll-locked');
}

function initLightbox() {
    if (window.reviewLightbox) {
        window.reviewLightbox.destroy();
    }

    window.reviewLightbox = GLightbox({
        selector: '#universalModal .glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'slide',
        moreLength: 60,
        arrows: true,
        closeButton: true,
    });
}

function getModal() {
    let modal = document.getElementById('universalModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'universalModal';
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="full-modal">
            <button type="button" class="full-modal__close" aria-label="Закрыть"></button>
            <div class="full-modal__content"></div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    modal.querySelector('.full-modal__close').addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
            closeModal();
        }
    });

    return modal;
}

function openModal(contentNode, onShown, options = {}) {
    const modal = getModal();
    const content = modal.querySelector('.full-modal__content');
    const fullModal = modal.querySelector('.full-modal');

    fullModal.classList.remove('full-modal--faq');
    if (options.type === 'faq') {
        fullModal.classList.add('full-modal--faq');
    }

    content.innerHTML = '';
    content.appendChild(contentNode);

    modal.style.display = 'flex';

    requestAnimationFrame(() => {
        modal.classList.add('is-visible');
        requestAnimationFrame(() => onShown?.(modal));
    });

    lockPageScroll();
}

function closeModal() {
    const modal = document.getElementById('universalModal');
    if (!modal) return;

    modal.classList.remove('is-visible');

    setTimeout(() => {
        modal.style.display = 'none';
        unlockPageScroll();
    }, 300);
}

function isOverflowing(el) {
    const style = getComputedStyle(el);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    const availableHeight = el.clientHeight - paddingTop - paddingBottom;

    return el.scrollHeight > availableHeight + 1;
}

function updateReview(review) {
    const desc = review.querySelector('.review-description');
    if (!desc) return;
    if (desc.closest('#universalModal')) return;

    const btn = review.querySelector('.show-full-btn');

    if (isOverflowing(desc)) {
        if (!btn) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'show-full-btn';
            button.textContent = 'Показать весь отзыв';

            const btnContainer = document.createElement('div');
            btnContainer.className = 'show-full-btn-container';
            btnContainer.appendChild(button);

            desc.after(btnContainer);
            button.addEventListener('click', () => openReviewModal(review));

            desc.classList.add('has-overflow');
        }
    } else {
        btn?.remove();
        desc.classList.remove('has-overflow');
        const container = review.querySelector('.show-full-btn-container');
        container?.remove();
    }
}

function checkReviewsOverflow() {
    document.querySelectorAll('.review').forEach(updateReview);
}

function openReviewModal(review) {
    const clone = review.cloneNode(true);
    clone.querySelector('.show-full-btn')?.remove();

    openModal(clone, (modal) => {
        const desc = modal.querySelector('.review-description');
        if (!desc) return;

        desc.style.webkitLineClamp = 'unset';
        desc.style.overflow = 'auto';
        desc.classList.add('custom-scroll');

        initSimpleBar(desc);

        initLightbox();
    });
}

function getLineHeight(el) {
    const style = getComputedStyle(el);
    let lh = parseFloat(style.lineHeight);
    if (isNaN(lh)) lh = parseFloat(style.fontSize) * 1.4;
    return lh;
}

function updateFaq(slide) {
    if (slide.closest('#universalModal')) return;

    const question = slide.querySelector('.faq-slide__question p');
    const wrap = slide.querySelector('.faq-slide__answer-text');
    const answer = wrap?.querySelector('p');
    if (!question || !wrap || !answer) return;

    const MAX_LINES = 11;

    const lh = getLineHeight(answer);
    const qLines = Math.ceil(question.scrollHeight / lh);
    const aLines = Math.ceil(answer.scrollHeight / lh);

    let btn = slide.querySelector('.show-full-faq-btn');

    if (qLines + aLines > MAX_LINES) {
        const maxAnswerLines = Math.max(0, MAX_LINES - qLines);
        wrap.style.maxHeight = `${maxAnswerLines * lh}px`;
        wrap.style.overflow = 'hidden';

        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'show-full-faq-btn';
            btn.textContent = 'Весь ответ';

            wrap.after(btn);
            btn.addEventListener('click', () => openFaqModal(slide));
        }
    } else {
        wrap.style.maxHeight = '';
        wrap.style.overflow = '';
        btn?.remove();
    }
}

function limitFaqText() {
    document.querySelectorAll('.faq-slide').forEach(updateFaq);
}

function openFaqModal(slide) {
    const clone = slide.cloneNode(true);
    clone.querySelector('.show-full-faq-btn')?.remove();

    openModal(
        clone,
        (modal) => {
            const wrap = modal.querySelector('.faq-slide__answer-text');
            if (!wrap) return;

            wrap.style.maxHeight = '';
            wrap.style.overflow = 'auto';
            wrap.classList.add('custom-scroll');

            initSimpleBar(wrap);
        },
        { type: 'faq' }
    );
}

document.addEventListener('DOMContentLoaded', () => {
    checkReviewsOverflow();
    limitFaqText();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            checkReviewsOverflow();
            limitFaqText();
        }, 200);
    });
});

function closeFaqModal() {}

let faqResizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(faqResizeTimeout);
    faqResizeTimeout = setTimeout(limitFaqText, 250);
});

const faqObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const faqSlide = mutation.target.closest('.faq-slide');
            if (faqSlide) {
                setTimeout(limitFaqText, 10);
            }
        }
    });
});

document.querySelectorAll('.faq-slide').forEach((slide) => {
    faqObserver.observe(slide, {
        childList: true,
        subtree: true,
        characterData: true,
    });
});

window.closeFaqModal = closeFaqModal;

//Открытие закрытие компонентов фильтра
document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = document.querySelectorAll('.filter-group__toggle');

    toggleButtons.forEach((button) => {
        const targetId = button.getAttribute('aria-controls');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (targetElement.hasAttribute('hidden')) {
            targetElement.removeAttribute('hidden');
        }

        targetElement.setAttribute('aria-hidden', !isExpanded);

        if (isExpanded) {
            button.classList.add('filter-group__toggle--active');

            targetElement.classList.remove('filter-group__content--open');
            targetElement.style.maxHeight = '0';

            setTimeout(() => {
                const height = targetElement.scrollHeight;
                targetElement.classList.add('filter-group__content--open');
                targetElement.style.maxHeight = height + 'px';

                setTimeout(() => {
                    targetElement.style.maxHeight = 'none';
                }, 300);
            }, 50);
        } else {
            button.classList.remove('filter-group__toggle--active');
            targetElement.classList.remove('filter-group__content--open');
            targetElement.style.maxHeight = '0';
        }

        button.addEventListener('click', function () {
            const isCurrentlyExpanded = this.getAttribute('aria-expanded') === 'true';
            const newExpandedState = !isCurrentlyExpanded;

            this.setAttribute('aria-expanded', newExpandedState);
            targetElement.setAttribute('aria-hidden', !newExpandedState);

            if (newExpandedState) {
                this.classList.add('filter-group__toggle--active');

                const height = targetElement.scrollHeight;
                targetElement.style.maxHeight = '0';
                targetElement.classList.add('filter-group__content--open');

                setTimeout(() => {
                    targetElement.style.maxHeight = height + 'px';

                    setTimeout(() => {
                        targetElement.style.maxHeight = 'none';
                    }, 300);
                }, 10);
            } else {
                this.classList.remove('filter-group__toggle--active');

                const height = targetElement.scrollHeight;
                targetElement.style.maxHeight = height + 'px';

                setTimeout(() => {
                    targetElement.classList.remove('filter-group__content--open');
                    targetElement.style.maxHeight = '0';
                }, 10);
            }
        });
    });
});

//Появление кнопок "применить" и "сбросить" на странице каталога
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('filters-form');

    if (!form) return;

    const filterInputs = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    const filterActions = form.querySelector('.filter-actions');

    if (!filterActions || filterInputs.length === 0) return;

    function hasSelectedFilters() {
        return Array.from(filterInputs).some((input) => input.checked);
    }

    function updateFilterActionsVisibility() {
        if (hasSelectedFilters()) {
            filterActions.style.display = 'block';
            filterActions.removeAttribute('hidden');
            filterActions.setAttribute('aria-hidden', 'false');
        } else {
            filterActions.style.display = 'none';
            filterActions.setAttribute('hidden', '');
            filterActions.setAttribute('aria-hidden', 'true');
        }
    }

    filterInputs.forEach((input) => {
        input.addEventListener('change', updateFilterActionsVisibility);
    });

    const resetButton = form.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            setTimeout(() => {
                updateFilterActionsVisibility();
            }, 0);
        });
    }

    updateFilterActionsVisibility();
});

//Клики по табам в товаре
document.addEventListener('DOMContentLoaded', function () {
    const optionGroups = document.querySelectorAll('.product-option__list');

    optionGroups.forEach((group) => {
        const buttons = group.querySelectorAll('.product-option__button');

        buttons.forEach((button) => {
            button.addEventListener('click', function () {
                const isActive = this.classList.contains('product-option__button--active');

                if (isActive) {
                    this.classList.remove('product-option__button--active');
                    this.setAttribute('aria-pressed', 'false');

                    group.closest('.product-option')?.removeAttribute('data-selected');
                } else {
                    buttons.forEach((btn) => {
                        btn.classList.remove('product-option__button--active');
                        btn.setAttribute('aria-pressed', 'false');
                    });

                    this.classList.add('product-option__button--active');
                    this.setAttribute('aria-pressed', 'true');

                    const selectedValue = this.textContent;
                    group.closest('.product-option')?.setAttribute('data-selected', selectedValue);
                }
            });
        });
    });
});

//Слайдер категорий
document.addEventListener('DOMContentLoaded', function () {
    const categorySliders = document.querySelectorAll('.categories.swiper');
    const STORAGE_KEY = 'active-category';

    categorySliders.forEach((slider, sliderIndex) => {
        const swiperInstance = new Swiper(slider, {
            slidesPerView: 'auto',
            freeMode: true,
            grabCursor: true,
            breakpoints: {
                769: { freeMode: true },
            },
            on: {
                init: function () {
                    restoreActiveSlide(this, sliderIndex);
                },
            },
        });

        const categoryTabs = slider.querySelectorAll('.categories-tab');

        categoryTabs.forEach((tab, tabIndex) => {
            if (!tab.dataset.tabId) {
                tab.dataset.tabId = `tab-${sliderIndex}-${tabIndex}`;
            }

            tab.addEventListener('click', function (e) {
                const isLink = tab.tagName === 'A';

                if (isLink) {
                    e.preventDefault();
                    saveActiveCategory(this, sliderIndex, tabIndex);
                    centerActiveSlide(swiperInstance, sliderIndex);
                    updateActiveState(this, categoryTabs);

                    setTimeout(() => {
                        window.location.href = this.href;
                    }, 50);
                } else {
                    centerActiveSlide(swiperInstance, sliderIndex);
                    updateActiveState(this, categoryTabs);
                    showTabContent(tabIndex);
                }
            });
        });

        slider.swiperInstance = swiperInstance;
    });

    function saveActiveCategory(tab, sliderIndex, tabIndex) {
        if (tab.tagName !== 'A') return;

        const categoryData = {
            text: tab.querySelector('.categories-tab__text')?.textContent || tab.textContent,
            sliderIndex: sliderIndex,
            tabIndex: tabIndex,
            isLink: true,
            timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categoryData));
    }

    function restoreActiveSlide(swiper, sliderIndex) {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            initFirstTabIfNeeded(sliderIndex);
            return;
        }

        try {
            const categoryData = JSON.parse(savedData);

            if (categoryData.sliderIndex !== sliderIndex || !categoryData.isLink) {
                initFirstTabIfNeeded(sliderIndex);
                return;
            }

            const sliderElement = document.querySelectorAll('.categories.swiper')[sliderIndex];
            if (!sliderElement) {
                initFirstTabIfNeeded(sliderIndex);
                return;
            }

            const categoryTabs = sliderElement.querySelectorAll('.categories-tab');
            let targetTab = null;

            if (categoryData.tabIndex !== undefined && categoryTabs[categoryData.tabIndex]) {
                targetTab = categoryTabs[categoryData.tabIndex];
            }

            if (!targetTab && categoryData.text) {
                targetTab = Array.from(categoryTabs).find((tab) => {
                    const textEl = tab.querySelector('.categories-tab__text');
                    return (textEl?.textContent || tab.textContent) === categoryData.text;
                });
            }

            if (targetTab && targetTab.tagName === 'A') {
                updateActiveState(targetTab, categoryTabs);

                setTimeout(() => {
                    centerActiveSlide(swiper, sliderIndex);
                }, 100);
            } else {
                initFirstTabIfNeeded(sliderIndex);
            }
        } catch (error) {
            console.error('Ошибка при восстановлении категории:', error);
            localStorage.removeItem(STORAGE_KEY);
            initFirstTabIfNeeded(sliderIndex);
        }
    }

    function updateActiveState(activeTab, allTabs) {
        allTabs.forEach((t) => {
            t.classList.remove('categories-tab--active');
            t.setAttribute('aria-selected', 'false');

            if (t.tagName !== 'A') {
                t.removeAttribute('aria-current');
            }
        });

        activeTab.classList.add('categories-tab--active');
        activeTab.setAttribute('aria-selected', 'true');

        if (activeTab.tagName !== 'A') {
            activeTab.setAttribute('aria-current', 'page');
        }
    }

    function showTabContent(tabIndex) {
        const contents = document.querySelectorAll('.catalog-tabs__content');

        if (contents.length === 0) return;

        contents.forEach((content) => {
            content.style.display = 'none';
            content.setAttribute('aria-hidden', 'true');
        });

        if (contents[tabIndex]) {
            contents[tabIndex].style.display = 'block';
            contents[tabIndex].setAttribute('aria-hidden', 'false');
        }

        initSliderInActiveTab(tabIndex);
    }

    function initSliderInActiveTab(tabIndex) {
        const activeContent = document.querySelectorAll('.catalog-tabs__content')[tabIndex];
        if (!activeContent) return;

        const slider = activeContent.querySelector('.slider .swiper');
        if (slider && !slider.swiperInstance) {
            const sliderButtons = activeContent.querySelector('.slider-buttons');
            const prevButton = sliderButtons?.querySelector('.slider-button--prev');
            const nextButton = sliderButtons?.querySelector('.slider-button--next');

            slider.swiperInstance = new Swiper(slider, {
                slidesPerView: 'auto',
                spaceBetween: 12,
                watchOverflow: true,
                resistance: true,
                resistanceRatio: 0,
                loop: false,
                navigation:
                    nextButton && prevButton
                        ? {
                              nextEl: nextButton,
                              prevEl: prevButton,
                          }
                        : false,
                breakpoints: {
                    1405: {
                        slidesPerView: 4,
                        spaceBetween: 18,
                    },
                },
                speed: 300,
            });
        }
    }

    function centerActiveSlide(swiper, sliderIndex) {
        const sliderElement = document.querySelectorAll('.categories.swiper')[sliderIndex];
        if (!sliderElement) return;

        const activeTab = sliderElement.querySelector('.categories-tab--active');
        if (!activeTab) return;

        const activeSlide = activeTab.closest('.swiper-slide');
        if (!activeSlide) return;

        const slides = Array.from(swiper.slides);
        const activeIndex = slides.indexOf(activeSlide);

        if (activeIndex >= 0) {
            swiper.slideTo(activeIndex, 300);
        }
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            categorySliders.forEach((slider, index) => {
                if (slider.swiperInstance) {
                    slider.swiperInstance.update();
                    centerActiveSlide(slider.swiperInstance, index);
                }
            });
        }, 250);
    });

    function loadStateFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');

        if (categoryId) {
            // Ищем таб с таким data-tab-id
            const targetTab = document.querySelector(`.categories-tab[data-tab-id="${categoryId}"]`);
            if (targetTab) {
                const slider = targetTab.closest('.categories.swiper');
                if (slider && slider.swiperInstance) {
                    const allTabs = slider.querySelectorAll('.categories-tab');
                    const tabIndex = Array.from(allTabs).indexOf(targetTab);
                    const sliderIndex = Array.from(categorySliders).indexOf(slider);

                    updateActiveState(targetTab, allTabs);
                    centerActiveSlide(slider.swiperInstance, sliderIndex);

                    if (targetTab.tagName === 'A') {
                        saveActiveCategory(targetTab, sliderIndex, tabIndex);
                    }
                }
            }
        }
    }

    loadStateFromUrl();

    function cleanupOldStorageData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        try {
            const categoryData = JSON.parse(savedData);
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

            if (categoryData.timestamp && categoryData.timestamp < weekAgo) {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function initFirstTabIfNeeded(sliderIndex) {
        const slider = document.querySelectorAll('.categories.swiper')[sliderIndex];
        if (!slider) return;

        const firstTab = slider.querySelector('.categories-tab');
        if (firstTab) {
            const categoryTabs = slider.querySelectorAll('.categories-tab');
            updateActiveState(firstTab, categoryTabs);

            if (firstTab.tagName !== 'A') {
                showTabContent(0);
            }
        }
    }

    cleanupOldStorageData();
});

//Открытие закрытие фильтров в моб версии
document.addEventListener('DOMContentLoaded', function () {
    const filterButton = document.querySelector('.catalog-container__filters');
    const closeButton = document.querySelector('.catalog-aside__close');
    const asideElement = document.querySelector('.catalog-aside');

    if (!filterButton || !closeButton || !asideElement) return;

    function isMobileDevice() {
        return window.innerWidth <= 991;
    }

    function openFilters() {
        if (!isMobileDevice()) return;

        asideElement.classList.add('catalog-aside--active');

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
    }

    function closeFilters() {
        asideElement.classList.remove('catalog-aside--active');

        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    filterButton.addEventListener('click', function () {
        openFilters();
    });

    closeButton.addEventListener('click', function () {
        closeFilters();
    });

    document.addEventListener('click', function (event) {
        if (!asideElement.classList.contains('catalog-aside--active')) return;

        const isClickInsideAside = asideElement.contains(event.target);
        const isClickOnFilterButton = filterButton.contains(event.target);

        if (!isClickInsideAside && !isClickOnFilterButton) {
            closeFilters();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && asideElement.classList.contains('catalog-aside--active')) {
            closeFilters();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 991 && asideElement.classList.contains('catalog-aside--active')) {
                closeFilters();
            }
        }, 250);
    });
});

//Открытие закрытие модального окна при нажатии на кнопку "в корзину"
document.addEventListener('DOMContentLoaded', function () {
    let activeModal = null;
    let activeSwiper = null;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-open="modal-add-product"]')) {
            openModal('modal-add-product');
        }
        if (e.target.closest('[data-open="modal-add-review"]')) {
            if (e.target.closest('input')) {
                setTimeout(() => {
                    openModal('modal-add-review');

                    const value = e.target.getAttribute('value');
                    const modal = document.querySelector('.modal--add-review');
                    const inputs = modal.querySelectorAll('.rating-star input');
                    inputs.forEach((input) => {
                        if (input.value === value) {
                            input.checked = true;
                        }
                    });
                }, 400);
            } else {
                openModal('modal-add-review');
            }
        }
        if (e.target.closest('[data-open="modal-delete-review"]')) {
            openModal('modal-delete-review');
        }
        if (e.target.closest('[data-open="modal-delete-question"]')) {
            openModal('modal-delete-question');
        }
        if (e.target.closest('[data-open="modal-edit-question"]')) {
            openModal('modal-edit-question');
        }
        if (e.target.closest('[data-open="modal-add-question"]')) {
            openModal('modal-add-question');
        }
        if (e.target.closest('[data-open="auth-modal"]')) {
            openModal('auth-modal');
        }

        if (e.target.closest('.modal-close') || e.target.classList.contains('modal-bg-close') || e.target.closest('[data-close-modal]')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeModal) {
            closeModal();
        }
    });

    function openModal(modalId) {
        if (activeModal) {
            closeModal();
        }

        const modal = document.getElementById(modalId);
        if (!modal) return;

        const scrollY = window.scrollY;

       
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.overflow = 'hidden';
        document.body.style.width = '100%';
        document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        
        activeModal = modal;
        activeModal.dataset.scrollY = scrollY; 

        initSwiper();
    }

    function closeModal() {
        if (!activeModal) return;

        if (activeSwiper) {
            activeSwiper.destroy(true, true);
            activeSwiper = null;
        }

        activeModal.classList.remove('is-open');
        activeModal.setAttribute('aria-hidden', 'true');

        const scrollY = parseInt(activeModal.dataset.scrollY || '0');

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.overflow = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';

        window.scrollTo(0, scrollY);

        activeModal = null;
    }

    function initSwiper() {
        const swiperContainer = document.querySelector('#modal-add-product .recommendation.swiper');
        if (!swiperContainer) return;

        activeSwiper = new Swiper(swiperContainer, {
            slidesPerView: 'auto',
            speed: 500,
            breakpoints: {
                992: {
                    slidesPerView: 3,
                },
            },
        });
    }
});

//Слайдер для изображений товара на странице товара
document.addEventListener('DOMContentLoaded', () => {
    const sliderEl = document.querySelector('.product-item__image-slider');
    const mainImage = document.querySelector('.product-item__image-main img');

    if (!sliderEl || !mainImage) return;

    let swiper = null;
    let currentMode = null;

    const DESKTOP_VISIBLE_COUNT = 4.93;
    const mobileMQ = window.matchMedia('(max-width: 768px)');

    function destroySwiper() {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }
    }

    function getSlideFullHeight(slide) {
        const styles = window.getComputedStyle(slide);

        const marginTop = parseFloat(styles.marginTop) || 0;
        const marginBottom = parseFloat(styles.marginBottom) || 0;

        const rectHeight = slide.getBoundingClientRect().height;

        return rectHeight + marginTop + marginBottom;
    }

    function setDesktopWrapperHeight(slides) {
        if (!slides.length) return;

        const slideHeight = getSlideFullHeight(slides[0]);
        const totalHeight = slideHeight * DESKTOP_VISIBLE_COUNT;

        sliderEl.style.height = `${totalHeight}px`;
    }

    function initSwiper() {
        const isMobile = mobileMQ.matches;
        if (currentMode === isMobile) return;
        currentMode = isMobile;

        destroySwiper();

        sliderEl.style.height = '';

        swiper = new Swiper(sliderEl, {
            direction: isMobile ? 'horizontal' : 'vertical',
            slidesPerView: isMobile ? 'auto' : DESKTOP_VISIBLE_COUNT,

            simulateTouch: true,
            grabCursor: !isMobile,

            slideToClickedSlide: false,
            freeMode: false,

            observer: true,
            observeParents: true,
        });

        const slides = Array.from(sliderEl.querySelectorAll('.swiper-slide'));

        if (!isMobile) {
            setDesktopWrapperHeight(slides);
            swiper.update();
        }

        function setActiveSlide(index, withScroll = true) {
            const slide = slides[index];
            if (!slide) return;

            const img = slide.querySelector('img');
            if (!img) return;

            mainImage.src = img.src;
            mainImage.alt = img.alt || '';

            slides.forEach((s) => s.classList.remove('active'));
            slide.classList.add('active');

            if (!isMobile && withScroll) {
                centerDesktopSlide(index);
            }
        }

        function centerDesktopSlide(index) {
            const total = slides.length;

            if (total <= DESKTOP_VISIBLE_COUNT) {
                swiper.slideTo(0, 300);
                return;
            }

            const offset = Math.floor(DESKTOP_VISIBLE_COUNT / 2);
            let target = index - offset;

            target = Math.max(0, target);
            target = Math.min(total - DESKTOP_VISIBLE_COUNT, target);

            swiper.slideTo(target, 300);
        }

        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                setActiveSlide(index);
            });
        });

        setActiveSlide(0, false);
        swiper.slideTo(0, 0);
        swiper.update();
    }

    initSwiper();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initSwiper, 200);
    });

    mobileMQ.addEventListener('change', initSwiper);
});

//Слайдер табов "описание, состав ..." на странице товара
document.addEventListener('DOMContentLoaded', function () {
    let isMobile = window.innerWidth < 580;
    let allowCentering = false;

    const tabsContainer = document.querySelector('.product-item__tabs');
    if (!tabsContainer) return;

    const swiper = new Swiper('.product-item__tabs', {
        slidesPerView: 'auto',
        freeMode: true,
        simulateTouch: true,
        touchStartPreventDefault: false,
        touchMoveStopPropagation: false,

        centeredSlides: false,
        slideToClickedSlide: false,
        centeredSlidesBounds: false,
        centerInsufficientSlides: false,
    });

    const tabs = document.querySelectorAll('.product-item__tab');
    const contents = document.querySelectorAll('.product-item__tabs-content');

    function activateTab(tabIndex, preventCenter = false) {
        tabs.forEach((tab) => tab.classList.remove('active'));
        contents.forEach((content) => content.classList.remove('active'));

        tabs[tabIndex]?.classList.add('active');
        contents[tabIndex]?.classList.add('active');

        if (!preventCenter) {
            moveToTab(tabIndex);
        }
    }

    function enableCentering() {
        if (!allowCentering && isMobile) {
            allowCentering = true;

            swiper.params.centeredSlides = true;
            swiper.params.slideToClickedSlide = true;
            swiper.params.centeredSlidesBounds = true;
            swiper.params.centerInsufficientSlides = true;

            swiper.update();
        }
    }

    function moveToTab(index) {
        if (!isMobile) {
            swiper.slideTo(index, 300);
            return;
        }

        // первый таб — ВСЕГДА без центрирования
        if (index === 0) {
            swiper.slideTo(0, 0);
            return;
        }

        // включаем центрирование ТОЛЬКО после первого клика
        enableCentering();
        swiper.slideTo(index, 300);
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            activateTab(index);
        });
    });

    swiper.on('slideChange', function () {
        activateTab(this.activeIndex);
    });

    // 👉 стартовое состояние — БЕЗ центрирования
    activateTab(0, true);
    swiper.slideTo(0, 0);

    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth < 580;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            allowCentering = false;

            swiper.params.centeredSlides = false;
            swiper.params.slideToClickedSlide = false;
            swiper.params.centeredSlidesBounds = false;
            swiper.params.centerInsufficientSlides = false;

            swiper.update();
            swiper.slideTo(0, 0);
        }
    });
});

//Фиксированная цена на странице товара
document.addEventListener('DOMContentLoaded', () => {
    const mq = window.matchMedia('(max-width: 540px)');
    let cleanup = null;

    function init() {
        if (!mq.matches) return;

        const bottom = document.querySelector('.product-item__bottom');
        const content = document.querySelector('.product-item__content');
        if (!bottom || !content) return;

        let lastScroll = window.pageYOffset;
        let state = null;
        let raf = null;

        // placeholder — место в потоке
        const placeholder = document.createElement('div');
        placeholder.className = 'product-item__bottom-placeholder';
        placeholder.style.height = `${bottom.offsetHeight}px`;
        bottom.after(placeholder);

        function contentBottomY() {
            return content.offsetTop + content.offsetHeight;
        }

        function setState(next) {
            if (state === next) return;
            state = next;

            bottom.classList.remove('product-item__bottom--visible', 'product-item__bottom--hiding', 'product-item__bottom--not-fixed');

            if (state === 'fixed-visible') {
                bottom.classList.add('product-item__bottom--visible');
            }

            if (state === 'fixed-hidden') {
                bottom.classList.add('product-item__bottom--hiding');
            }

            if (state === 'absolute') {
                bottom.classList.add('product-item__bottom--not-fixed');
            }
        }

        function isBottomVisibleInFlow() {
            const rect = placeholder.getBoundingClientRect();
            return rect.top < window.innerHeight;
        }

        function onScroll() {
            // Пропускаем обработку если скролл заблокирован
            if (document.documentElement.hasAttribute('data-scroll-locked')) {
                return;
            }

            const scroll = window.pageYOffset;
            const dir = scroll > lastScroll ? 'down' : 'up';
            lastScroll = scroll;

            const viewportBottom = scroll + window.innerHeight;
            const contentBottom = contentBottomY();
            const bottomHeight = bottom.offsetHeight;

            const enterAbsoluteAt = contentBottom - bottomHeight;
            const exitAbsoluteAt = enterAbsoluteAt - 40; // dead zone

            // 🔒 ABSOLUTE ZONE
            if (viewportBottom >= enterAbsoluteAt) {
                if (state !== 'absolute') {
                    setState('absolute');
                }
                return;
            }

            // 🔓 EXIT ABSOLUTE
            if (state === 'absolute') {
                if (viewportBottom < exitAbsoluteAt) {
                    setState('fixed-visible');
                }
                return;
            }

            // 🎬 FIXED ANIMATION
            if (dir === 'down') {
                setState('fixed-hidden');
            } else {
                setState('fixed-visible');
            }
        }

        function onScrollRaf() {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                onScroll();
            });
        }

        // 🔥 ПРАВИЛЬНОЕ НАЧАЛЬНОЕ СОСТОЯНИЕ
        if (isBottomVisibleInFlow()) {
            setState('absolute');
        } else {
            setState('fixed-visible');
        }

        window.addEventListener('scroll', onScrollRaf, { passive: true });
        window.addEventListener('resize', onScrollRaf);

        cleanup = () => {
            window.removeEventListener('scroll', onScrollRaf);
            window.removeEventListener('resize', onScrollRaf);
            if (raf) cancelAnimationFrame(raf);
            placeholder.remove();
            bottom.classList.remove('product-item__bottom--visible', 'product-item__bottom--hiding', 'product-item__bottom--not-fixed');
            cleanup = null;
        };
    }

    mq.addEventListener('change', (e) => {
        if (!e.matches && cleanup) cleanup();
        if (e.matches) init();
    });

    init();
});

//Слайдер блоков на странице корзины
document.addEventListener('DOMContentLoaded', function () {
    let cartSwiper = null;
    const cartBlocksElement = document.querySelector('.cart-blocks--slider');
    const breakpoint = 1025;

    function initSwiper() {
        if (cartSwiper) {
            cartSwiper.destroy(true, true);
            cartSwiper = null;
        }

        if (window.innerWidth < breakpoint && cartBlocksElement) {
            cartSwiper = new Swiper('.cart-blocks--slider', {
                slidesPerView: 'auto',
                loop: false,
                speed: 300,
            });
        }
    }

    function handleResize() {
        const shouldBeActive = window.innerWidth < breakpoint;
        const isActive = cartSwiper !== null;

        if (shouldBeActive && !isActive) {
            initSwiper();
        } else if (!shouldBeActive && isActive) {
            cartSwiper.destroy(true, true);
            cartSwiper = null;

            if (cartBlocksElement) {
                cartBlocksElement.classList.remove('swiper', 'swiper-initialized');
            }
        }
    }

    initSwiper();

    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });
});

//Плавное открытие и закрытие toggle элементов в карточке "сумма заказа" , "ваш заказ", "мини корзина"
document.addEventListener('DOMContentLoaded', function () {
    function slideToggle(element, duration = 300) {
        return new Promise((resolve) => {
            if (element.offsetHeight === 0 || element.style.height === '0px' || element.hidden) {
                element.hidden = false;
                element.style.overflow = 'hidden';
                element.style.height = '0px';
                element.classList.add('is-open');

                const fullHeight = element.scrollHeight;

                element.style.height = fullHeight + 'px';

                setTimeout(() => {
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve('opened');
                }, duration);
            } else {
                const fullHeight = element.scrollHeight;
                element.style.height = fullHeight + 'px';
                element.style.overflow = 'hidden';

                element.offsetHeight;

                element.style.height = '0px';

                setTimeout(() => {
                    element.classList.remove('is-open');
                    element.style.height = '';
                    element.style.overflow = '';
                    element.hidden = true;
                    resolve('closed');
                }, duration);
            }
        });
    }

    // Обработка кнопок в карточке
    const toggleButtons = document.querySelectorAll('.card-info--toggle .card-toggle__button');
    toggleButtons.forEach((button) => {
        button.addEventListener('click', function () {
            const content = this.nextElementSibling;
            if (!content || !content.classList.contains('card-toggle__hidden')) return;

            const isCurrentlyOpen = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isCurrentlyOpen);
            slideToggle(content, 300);
        });
    });

    // Обработка кнопки "Выгода"
    const discountToggleButtons = document.querySelectorAll('.discount-toggle__button');
    discountToggleButtons.forEach((button) => {
        button.addEventListener('click', function () {
            const discountItem = this.closest('.card-list__item--discount');
            const discountDetails = discountItem.querySelector('.discount-details');

            if (!discountDetails) return;

            const isCurrentlyOpen = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isCurrentlyOpen);
            slideToggle(discountDetails, 300);
        });
    });
});

//модальное окно куки
function initCookiesModal() {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');

    if (cookiesAccepted === 'true') {
        return;
    }

    const cookiesModal = document.querySelector('.cookies-modal');
    const acceptButton = document.querySelector('[data-cookies-accept]');

    if (!cookiesModal || !acceptButton) {
        return;
    }

    function showCookiesModal() {
        setTimeout(() => {
            cookiesModal.classList.add('cookies-modal--show');
        }, 100);
    }

    function hideCookiesModal() {
        cookiesModal.classList.remove('cookies-modal--show');

        setTimeout(() => {
            cookiesModal.style.display = 'none';
        }, 500);
    }

    function acceptCookies() {
        localStorage.setItem('cookiesAccepted', 'true');

        hideCookiesModal();
    }

    setTimeout(showCookiesModal, 5000);

    acceptButton.addEventListener('click', acceptCookies);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && cookiesModal.classList.contains('cookies-modal--show')) {
            acceptCookies();
        }
    });
}
document.addEventListener('DOMContentLoaded', initCookiesModal);

//номер телефона со страной
function initPhoneInput(phoneInput, wrapper) {
    const fullInput = wrapper.querySelector('.phone-full');

    if (!fullInput) return;

    const iti = window.intlTelInput(phoneInput, {
        initialCountry: 'ru',
        preferredCountries: ['ru', 'ua', 'by', 'kz', 'uz', 'tj', 'tm', 'kg', 'md', 'az', 'am', 'ge'],
        separateDialCode: true,
        nationalMode: false,
        autoPlaceholder: 'polite',
        placeholderNumberType: 'MOBILE',
        utilsScript: './js/utils.js',
    });

    let cleave = null;

    function getFormatDigits() {
        const example = phoneInput.placeholder || '';
        return example.replace(/\D/g, '');
    }

    function getBlocksAuto() {
        const digits = getFormatDigits();
        const len = digits.length;

        if (len <= 6) return [len];
        if (len === 10) return [3, 3, 2, 2];
        if (len === 9) return [2, 3, 2, 2];
        if (len === 8) return [2, 3, 3];
        if (len === 11) return [3, 3, 3, 2];

        return [3, 3, 3, 3, 3].filter((_, i) => i * 3 < len);
    }

    function getRaw() {
        return phoneInput.value.replace(/\D/g, '');
    }

    function updateFull() {
        const c = iti.getSelectedCountryData();
        fullInput.value = '+' + c.dialCode + getRaw();
    }

    function validate() {
        if (!cleave) return false;
        updateFull();
        return true;
    }

    function applyMask(reset = true) {
        if (reset) phoneInput.value = '';
        if (cleave) cleave.destroy();

        cleave = new Cleave(phoneInput, {
            numericOnly: true,
            blocks: getBlocksAuto(),
            delimiter: ' ',
            onValueChanged: updateFull,
        });

        updateFull();
    }

    phoneInput.addEventListener('countrychange', () => applyMask(true));
    phoneInput.addEventListener('input', updateFull);
    phoneInput.addEventListener('blur', validate);

    setTimeout(() => applyMask(false), 200);

    phoneInput._phone = { iti, cleave: () => cleave, validate };
    return phoneInput._phone;
}
function setupAllPhoneInputs() {
    document.querySelectorAll('input[data-phone]').forEach((input) => {
        const wrapper = input.closest('div.checkout-block__field--phone');
        if (wrapper) initPhoneInput(input, wrapper);
    });
}

function initWhenReady() {
    if (window.intlTelInput && window.Cleave) {
        setupAllPhoneInputs();
    } else {
        setTimeout(initWhenReady, 100);
    }
}

document.addEventListener('DOMContentLoaded', initWhenReady);

//Поиск страны с флагами на странице checkout
async function loadCountries() {
    try {
        const response = await fetch('js/locations.json');
        const countries = await response.json();
        return countries;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return [];
    }
}

function updateActiveClass(isOpen, countryBlock) {
    if (countryBlock) {
        if (isOpen) {
            countryBlock.classList.add('checkout-block__country--active');
        } else {
            countryBlock.classList.remove('checkout-block__country--active');
        }
    }
}

function updateFlag(inputValue, countries) {
    const flagContainer = document.querySelector('.flag-container .flag-icon, .flag-container .flag-placeholder');

    if (!flagContainer) return;

    if (!inputValue || !inputValue.trim()) {
        flagContainer.className = 'flag-placeholder';
        return;
    }

    const foundCountry = countries.find((country) => {
        const ruName = country.translations?.ru || '';
        const currentValue = inputValue.trim().toLowerCase();
        return ruName.toLowerCase() === currentValue || country.name.toLowerCase() === currentValue;
    });

    if (foundCountry && foundCountry.iso2) {
        flagContainer.className = `flag-icon flag-icon-${foundCountry.iso2.toLowerCase()}`;
    } else {
        flagContainer.className = 'flag-placeholder';
    }
}

function showAllCountries(countries, input, suggestionsDiv, countryBlock) {
    suggestionsDiv.innerHTML = '';

    const sortedCountries = [...countries].sort((a, b) => {
        const nameA = (a.translations?.ru || a.name).toLowerCase();
        const nameB = (b.translations?.ru || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedCountries.forEach((country) => {
        const div = document.createElement('div');
        div.className = 'checkout-block__country-item';

        const iso2 = country.iso2?.toLowerCase();
        const countryName = country.translations?.ru || country.name;

        if (iso2) {
            div.innerHTML = `<span class="flag-icon flag-icon-${iso2}"></span>${countryName}`;
        } else {
            div.innerHTML = `<span class="flag-placeholder"></span>${countryName}`;
        }

        div.onclick = () => {
            input.value = countryName;
            updateFlag(countryName, countries);
            suggestionsDiv.style.display = 'none';
            updateActiveClass(false, countryBlock);
        };
        suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = 'block';
    updateActiveClass(true, countryBlock);
}

function showFilteredSuggestions(countries, query, input, suggestionsDiv, countryBlock) {
    suggestionsDiv.innerHTML = '';

    if (!query.trim()) {
        showAllCountries(countries, input, suggestionsDiv, countryBlock);
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = countries
        .filter((country) => {
            const ruName = country.translations?.ru || '';
            return ruName.toLowerCase().includes(lowerQuery) || country.name.toLowerCase().includes(lowerQuery);
        })
        .slice(0, 20);

    if (filtered.length === 0) {
        suggestionsDiv.innerHTML = '<div class="checkout-block__country-item"><span class="flag-placeholder"></span>Страна не найдена</div>';
        suggestionsDiv.style.display = 'block';
        updateActiveClass(true, countryBlock);
        return;
    }

    filtered.forEach((country) => {
        const div = document.createElement('div');
        div.className = 'checkout-block__country-item';

        const iso2 = country.iso2?.toLowerCase();
        const countryName = country.translations?.ru || country.name;

        if (iso2) {
            div.innerHTML = `<span class="flag-icon flag-icon-${iso2}"></span>${countryName}`;
        } else {
            div.innerHTML = `<span class="flag-placeholder"></span>${countryName}`;
        }

        div.onclick = () => {
            input.value = countryName;
            updateFlag(countryName, countries);
            suggestionsDiv.style.display = 'none';
            updateActiveClass(false, countryBlock);
        };
        suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = 'block';
    updateActiveClass(true, countryBlock);
}

async function init() {
    const input = document.getElementById('country_input');
    const countryBlock = document.querySelector('.checkout-block__country');
    const suggestionsDiv = document.getElementById('suggestions');

    if (!input || !countryBlock || !suggestionsDiv) {
        return;
    }

    const countries = await loadCountries();

    updateFlag(input.value, countries);

    let listOpenedByClick = false;

    input.addEventListener('click', (e) => {
        e.stopPropagation();

        if (suggestionsDiv.style.display === 'block') {
            return;
        }

        listOpenedByClick = true;
        showAllCountries(countries, input, suggestionsDiv, countryBlock);
    });

    input.addEventListener('focus', (e) => {
        if (!listOpenedByClick) {
            setTimeout(() => {
                if (suggestionsDiv.style.display !== 'block') {
                    showAllCountries(countries, input, suggestionsDiv, countryBlock);
                }
            }, 100);
        }
        listOpenedByClick = false;
    });

    countryBlock.addEventListener('click', (e) => {
        if (e.target === input || e.target.classList.contains('flag-icon') || e.target.classList.contains('flag-placeholder')) {
            return;
        }

        if (suggestionsDiv.style.display === 'block') {
            suggestionsDiv.style.display = 'none';
            updateActiveClass(false, countryBlock);
        } else {
            showAllCountries(countries, input, suggestionsDiv, countryBlock);
        }
    });

    input.addEventListener('input', (e) => {
        showFilteredSuggestions(countries, e.target.value, input, suggestionsDiv, countryBlock);
        updateFlag(e.target.value, countries);
    });

    document.addEventListener('click', (e) => {
        if (!countryBlock.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
            updateActiveClass(false, countryBlock);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && suggestionsDiv.style.display === 'block') {
            suggestionsDiv.style.display = 'none';
            updateActiveClass(false, countryBlock);
            input.blur();
        }
    });

    input.addEventListener('keydown', () => {
        listOpenedByClick = false;
    });

    input.addEventListener('change', () => {
        updateFlag(input.value, countries);
    });
}

document.addEventListener('DOMContentLoaded', init);

//открытие закрытие оплаты по бонусам на странице checkout
document.addEventListener('DOMContentLoaded', function () {
    const bonusBlocks = document.querySelectorAll('.checkout-block__bonus');

    bonusBlocks.forEach((bonusBlock) => {
        // Находим input (radio или checkbox)
        const bonusInput = bonusBlock.querySelector('.checkout-block__bonus-checkbox input[type="radio"], .checkout-block__bonus-checkbox input[type="checkbox"]');
        const toggleBlock = bonusBlock.querySelector('.checkout-block__bonus-toggle');

        if (!bonusInput || !toggleBlock) return;

        toggleBlock.style.transition = 'opacity 0.3s ease, max-height 0.3s ease';
        toggleBlock.style.overflow = 'hidden';

        function showBonusBlock() {
            toggleBlock.hidden = false;

            const scrollHeight = toggleBlock.scrollHeight;

            toggleBlock.style.opacity = '0';
            toggleBlock.style.maxHeight = '0';

            requestAnimationFrame(() => {
                toggleBlock.style.opacity = '1';
                toggleBlock.style.maxHeight = scrollHeight + 'px';

                setTimeout(() => {
                    toggleBlock.style.maxHeight = 'none';
                }, 300);
            });
        }

        function hideBonusBlock() {
            const currentHeight = toggleBlock.scrollHeight;
            toggleBlock.style.maxHeight = currentHeight + 'px';

            requestAnimationFrame(() => {
                toggleBlock.style.opacity = '0';
                toggleBlock.style.maxHeight = '0';

                setTimeout(() => {
                    toggleBlock.hidden = true;
                }, 300);
            });
        }

        // Инициализация начального состояния
        if (bonusInput.checked) {
            showBonusBlock();
        } else {
            toggleBlock.hidden = true;
            toggleBlock.style.opacity = '0';
            toggleBlock.style.maxHeight = '0';
        }

        // Единый обработчик для обоих типов input
        bonusInput.addEventListener('change', function () {
            if (this.checked) {
                showBonusBlock();
            } else {
                hideBonusBlock();
            }
        });
    });
});

//открытие закрытие другого получателя на странице checkout
document.addEventListener('DOMContentLoaded', function () {
    const recipientCheckbox = document.querySelector('input[name="checkout_recipient"]');
    const recipientBlock = document.querySelector('.checkout-block__recipient');

    if (!recipientCheckbox || !recipientBlock) return;

    recipientBlock.classList.add('recipient-block');

    if (recipientCheckbox.checked) {
        showRecipientBlock();
    }

    recipientCheckbox.addEventListener('change', function () {
        if (this.checked) {
            showRecipientBlock();
        } else {
            hideRecipientBlock();
        }
    });

    function showRecipientBlock() {
        recipientBlock.removeAttribute('hidden');

        setTimeout(() => {
            recipientBlock.classList.add('recipient-block--visible');

            setTimeout(() => {
                recipientBlock.style.overflow = 'visible';
            }, 300);

            const parentBlock = recipientCheckbox.closest('.checkout-block__checkbox--custom');
            if (parentBlock) {
                parentBlock.classList.add('checkout-block__checkbox--active');
            }
        }, 10);
    }

    function hideRecipientBlock() {
        recipientBlock.style.overflow = 'hidden';

        recipientBlock.classList.remove('recipient-block--visible');

        setTimeout(() => {
            recipientBlock.setAttribute('hidden', 'hidden');

            const parentBlock = recipientCheckbox.closest('.checkout-block__checkbox--custom');
            if (parentBlock) {
                parentBlock.classList.remove('checkout-block__checkbox--active');
            }
        }, 300);
    }
});

//Открытие закрытие миникорзины в шапке
document.addEventListener('DOMContentLoaded', function () {
    let miniCartContainer = document.querySelector('.header-top__mini-cart');
    let cartPopup = document.querySelector('.header-top__card');
    let isOpen = false;
    let isHovering = false;
    let closeTimeout = null;
    let resizeTimeout = null;

    function isDesktop() {
        return window.innerWidth >= 1150;
    }

    function openCart() {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }

        if (!isOpen && isDesktop()) {
            cartPopup.style.display = 'block';
            cartPopup.hidden = false;
            setTimeout(() => {
                cartPopup.classList.add('is-visible');
                isOpen = true;
            }, 10);

            const searchResult = document.querySelector('.header-bottom__result');
            if (searchResult && searchResult.classList.contains('header-bottom__result--active')) {
                searchResult.classList.remove('header-bottom__result--active');
            }
        }
    }

    function closeCart() {
        if (isOpen) {
            cartPopup.classList.remove('is-visible');

            setTimeout(() => {
                if (!isHovering) {
                    cartPopup.style.display = 'none';
                    cartPopup.hidden = true;
                    isOpen = false;
                }
            }, 300);
        }
    }

    function resetCartState() {
        closeCart();
        isHovering = false;
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    }

    function initDiscountButtons() {
        const discountToggleButtons = document.querySelectorAll('.card--mini .discount-toggle__button');
        discountToggleButtons.forEach((button) => {
            button.addEventListener('click', function () {
                const discountItem = this.closest('.card--mini .card-list__item--discount');
                const discountDetails = discountItem.querySelector('.card--mini .discount-details');

                if (!discountDetails) return;

                const isCurrentlyOpen = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isCurrentlyOpen);
                slideToggle(discountDetails, 300);
            });
        });
    }

    function initCartEvents() {
        if (miniCartContainer) {
            miniCartContainer.replaceWith(miniCartContainer.cloneNode(true));
        }

        miniCartContainer = document.querySelector('.header-top__mini-cart');
        cartPopup = document.querySelector('.header-top__card');

        if (!miniCartContainer || !cartPopup || !isDesktop()) {
            if (cartPopup) {
                cartPopup.style.display = 'none';
                cartPopup.hidden = true;
            }
            return;
        }

        miniCartContainer.addEventListener('mouseenter', function () {
            if (!isDesktop()) return;
            isHovering = true;
            openCart();
        });

        miniCartContainer.addEventListener('mouseleave', function (e) {
            if (!isDesktop()) return;
            isHovering = false;

            const relatedTarget = e.relatedTarget;
            if (!miniCartContainer.contains(relatedTarget)) {
                closeTimeout = setTimeout(() => {
                    if (!isHovering && isOpen) {
                        closeCart();
                    }
                }, 150);
            }
        });

        const cartButton = miniCartContainer.querySelector('.header-top__button-cart');
        if (cartButton && isDesktop()) {
            cartButton.addEventListener('click', function (e) {
                e.stopPropagation();
                if (isOpen) {
                    closeCart();
                } else {
                    openCart();
                }
            });
        }

        document.addEventListener('click', function (e) {
            if (isDesktop() && isOpen && !miniCartContainer.contains(e.target)) {
                closeCart();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen && isDesktop()) {
                closeCart();
            }
        });

        initDiscountButtons();
    }

    function setupCart() {
        if (!miniCartContainer || !cartPopup) return;

        cartPopup.style.display = 'none';
        cartPopup.hidden = true;

        if (!isDesktop()) {
            return;
        }

        initCartEvents();
    }

    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const wasDesktop = isDesktop();

            if (!wasDesktop && isOpen) {
                resetCartState();
            } else if (wasDesktop) {
                initCartEvents();
            }

            if (!isDesktop() && cartPopup) {
                cartPopup.style.display = 'none';
                cartPopup.hidden = true;
            }
        }, 250);
    }

    initDiscountButtons();

    setupCart();

    window.addEventListener('resize', handleResize);

    window.addEventListener('orientationchange', function () {
        setTimeout(handleResize, 100);
    });

    window.addEventListener('beforeunload', function () {
        clearTimeout(closeTimeout);
        clearTimeout(resizeTimeout);
    });
});

function slideToggle(element, duration = 300) {
    if (!element) return;

    if (element.style.display === 'none' || !element.style.display) {
        element.style.display = 'block';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;

        const fullHeight = element.scrollHeight;

        setTimeout(() => {
            element.style.height = fullHeight + 'px';
        }, 10);

        setTimeout(() => {
            element.style.height = 'auto';
            element.style.transition = '';
        }, duration);
    } else {
        const fullHeight = element.scrollHeight;
        element.style.height = fullHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;

        element.offsetHeight;

        setTimeout(() => {
            element.style.height = '0';
        }, 10);

        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.transition = '';
            element.style.overflow = '';
        }, duration);
    }
}

//копирование кода заказа
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.order-code');
    buttons.forEach((button) => {
        button.addEventListener('click', async function () {
            try {
                navigator.clipboard.writeText(button.textContent);
                showNotification('copy');
            } catch (e) {}
        });
    });
});

//Появление/скрытие нотификации
function showNotification(attr) {
    const notification = document.querySelector(`[data-notification="${attr}"]`);
    if (notification) {
        notification.classList.add('notification--active');
        setTimeout(() => {
            notification.classList.remove('notification--active');
        }, 4000);
    }
}

// Табы на странице аккаунта - бонусы
document.addEventListener('DOMContentLoaded', function () {
    const accountTabs = document.querySelector('.account-tabs');
    if (accountTabs) {
        accountTabs.addEventListener('click', function (e) {
            const target = e.target;
            const tabContentId = target.getAttribute('data-account-tab');
            const tabContenElement = document.querySelector(`[data-account-content="${tabContentId}"]`);
            if (tabContenElement) {
                const accountTabs = document.querySelectorAll('.account-tab');
                accountTabs.forEach((el) => {
                    el.classList.remove('account-tab--active');
                });
                target.classList.add('account-tab--active');
                const tabContens = document.querySelectorAll('.account-tabs__content');
                tabContens.forEach((el) => {
                    el.hidden = true;
                    el.classList.remove('account-tabs__content--active');
                });
                tabContenElement.hidden = false;
                tabContenElement.classList.add('account-tabs__content--active');
            }
        });
    }
});

// слайдер на странице аккаунта
document.addEventListener('DOMContentLoaded', function () {
    const salesSlider = new Swiper('.sales-slider .swiper', {
        slidesPerView: 'auto',
        spaceBetween: 12,

        navigation: {
            nextEl: '.sales-slider__button-next',
            prevEl: '.sales-slider__button-prev',
        },

        breakpoints: {
            1571: {
                slidesPerView: 3,
                spaceBetween: 18,
            },
        },

        speed: 300,
    });
});

// копирование промокда при клике на кнопку "скопировать"
document.addEventListener('DOMContentLoaded', function () {
    const accountPromotionals = document.querySelector('.account-promotionals');
    if (accountPromotionals) {
        accountPromotionals.addEventListener('click', function (e) {
            const target = e.target;
            const clipboardText = target.getAttribute('data-clipboard-text');
            if (clipboardText) {
                navigator.clipboard.writeText(clipboardText);
                showNotification('copy');
            }
        });
    }
});

// дата рождения
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-validate="date"]').forEach((el) => {
        let isDeleting = false;

        el.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                isDeleting = true;
            }
        });

        el.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            let day = '';
            let month = '';
            let year = '';

            if (isDeleting) {
                if (value.length >= 2) {
                    day = value.slice(0, 2);
                    if (value.length >= 4) {
                        month = value.slice(2, 4);
                        if (value.length >= 6) {
                            year = value.slice(4, 8);
                        }
                    }
                }
                isDeleting = false;
            } else {
                if (value.length > 0) {
                    day = value.slice(0, 2);
                    if (parseInt(day) > 31) day = '31';

                    if (value.length >= 2) {
                        month = value.slice(2, 4);
                        if (parseInt(month) > 12) month = '12';
                    }

                    if (value.length >= 4) {
                        year = value.slice(4, 8);

                        if (year.length >= 3) {
                            const currentYear = new Date().getFullYear();
                            if (parseInt(year) > currentYear) {
                                year = currentYear.toString();
                            }
                            if (parseInt(year) < currentYear - 100) {
                                year = (currentYear - 100).toString();
                            }
                        }
                    }
                }
            }

            let formatted = '';
            if (day) formatted += day;
            if (month) formatted += '.' + month;
            if (year) formatted += '.' + year;

            e.target.value = formatted;
        });
    });
});

// добавление изображений в модальном окне отзыва
document.addEventListener('DOMContentLoaded', function () {
    const modalPhotos = document.querySelector('.modal-photos');
    if (!modalPhotos) return;

    const fileInput = modalPhotos.querySelector('input[type="file"]');
    const swiperWrapper = document.querySelector('.photo-swiper .swiper-wrapper');

    const MAX_FILES = 7;
    let selectedFiles = [];
    let existingFiles = [];
    let photoSwiper = null;

    function initPhotoSwiper() {
        if (photoSwiper) {
            photoSwiper.destroy(true, true);
        }

        photoSwiper = new Swiper('.photo-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 8,
            freeMode: true,
            speed: 500,
        });
    }

    function collectExistingFiles() {
        const existingSlides = swiperWrapper.querySelectorAll('.swiper-slide');
        existingFiles = [];

        existingSlides.forEach((slide) => {
            const removeBtn = slide.querySelector('.remove-btn');
            if (removeBtn) {
                const filename = removeBtn.dataset.filename;
                if (filename) {
                    existingFiles.push(filename);
                }
            }
        });
    }

    function initExistingRemoveButtons() {
        const removeButtons = document.querySelectorAll('.modal-photo-item .remove-btn');

        removeButtons.forEach((btn) => {
            btn.removeEventListener('click', handleRemoveClick);

            btn.addEventListener('click', handleRemoveClick);
        });
    }

    function handleRemoveClick(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const slide = btn.closest('.swiper-slide');
        const filename = btn.dataset.filename;

        if (slide && filename) {
            removeExistingFile(filename, slide);
        }
    }

    function removeExistingFile(filename, slide) {
        slide.remove();

        existingFiles = existingFiles.filter((f) => f !== filename);

        updateDeletedFilesAttribute(filename);

        if (photoSwiper) {
            photoSwiper.update();
        }
    }

    function updateDeletedFilesAttribute(filename) {
        const deletedInput = document.querySelector('.deleted-files-input');
        if (deletedInput) {
            let deletedFiles = deletedInput.value ? JSON.parse(deletedInput.value) : [];
            deletedFiles.push(filename);
            deletedInput.value = JSON.stringify(deletedFiles);
        }
    }

    function handleNewFiles(newFiles) {
        if (selectedFiles.length + existingFiles.length + newFiles.length > MAX_FILES) {
            showNotification('limit');
            return;
        }

        newFiles.forEach((file) => {
            if (file.type.startsWith('image/')) {
                selectedFiles.push(file);
                displayPreviewWithLoader(file);
            }
        });

        updateFileInput();
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach((file) => {
            dataTransfer.items.add(file);
        });
        fileInput.files = dataTransfer.files;
    }

    function displayPreviewWithLoader(file) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const photoItem = document.createElement('div');
        photoItem.className = 'modal-photo-item loading';

        photoItem.innerHTML = `
            <img src="" alt="${file.name}">
            <div class="photo-loader">
                <div class="loader-spinner"></div>
                <button type="button" class="remove-btn-loader" data-filename="${file.name}" aria-label="Удалить фотографию ${file.name}"></button>
            </div>
        `;

        slide.appendChild(photoItem);
        swiperWrapper.appendChild(slide);

        if (photoSwiper) {
            photoSwiper.update();
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = photoItem.querySelector('img');
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const removeBtnLoader = photoItem.querySelector('.remove-btn-loader');
        removeBtnLoader.addEventListener('click', function (e) {
            e.stopPropagation();
            removeNewFile(file, slide);
        });

        simulateLoaderRemoval(file, photoItem, slide);
    }

    function simulateLoaderRemoval(file, photoItem, slide) {
        setTimeout(() => {
            if (slide && slide.parentNode) {
                photoItem.classList.remove('loading');

                const loader = photoItem.querySelector('.photo-loader');
                if (loader) {
                    loader.remove();
                }

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-btn';
                removeBtn.setAttribute('data-filename', file.name);
                removeBtn.setAttribute('aria-label', `Удалить фотографию ${file.name}`);

                removeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    removeNewFile(file, slide);
                });

                photoItem.appendChild(removeBtn);

                if (photoSwiper) {
                    photoSwiper.update();
                }
            }
        }, 2000);
    }

    function removeNewFile(file, slide) {
        selectedFiles = selectedFiles.filter((f) => f.name !== file.name);
        slide.remove();
        updateFileInput();

        if (photoSwiper) {
            photoSwiper.update();
        }
    }

    collectExistingFiles();
    initPhotoSwiper();
    initExistingRemoveButtons();

    modalPhotos.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        handleNewFiles(newFiles);

        fileInput.value = '';
    });

    const observer = new MutationObserver(() => {
        initExistingRemoveButtons();
    });

    observer.observe(swiperWrapper, {
        childList: true,
        subtree: true,
    });
});

// слайдер в мод окне "Спасибо, что поделились впечатлением!"
document.addEventListener('DOMContentLoaded', function () {
    const othersSwiper = new Swiper('.others', {
        slidesPerView: 'auto',
    });
});

// кнопки редактировать отзыв/вопрос и удалить на странице аккаунта "отзывы и вопросы"
document.addEventListener('DOMContentLoaded', function () {
    const accountContentBlock = document.querySelector('.account-content__block');
    if (!accountContentBlock) return;

    accountContentBlock.addEventListener('click', function (e) {
        const target = e.target;
        if (target.closest('.account-block__toggle-button')) {
            const parent = target.closest('.account-block');
            if (!parent) return;
            const content = parent.querySelector('.account-block__toggle-content');
            if (!content.classList.contains('account-block__toggle-content--active')) {
                allToggleClose();
                target.classList.add('account-block__toggle-button--active');
                content.classList.add('account-block__toggle-content--active');
            } else {
                allToggleClose();
            }
        }
    });

    document.addEventListener('click', function (e) {
        const target = e.target;
        if (!target.closest('.account-block__buttons')) {
            allToggleClose();
        }
    });

    function allToggleClose() {
        const activeContents = document.querySelectorAll('.account-block__toggle-content--active');
        const activeButtons = document.querySelectorAll('.account-block__toggle-button--active');

        activeContents.forEach((content) => {
            content.classList.remove('account-block__toggle-content--active');
        });
        activeButtons.forEach((button) => {
            button.classList.remove('account-block__toggle-button--active');
        });
    }
});

// переворот модального окна авторизации
document.addEventListener('DOMContentLoaded', function () {
    const card = document.getElementById('flip-contents');
    const flipButtons = document.querySelectorAll('.flip-btn');
    if (!flipButtons) return;
    flipButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();

            const direction = button.dataset.flip;

            if (direction === 'auth-code') {
                card.classList.add('flipped');
            } else {
                card.classList.remove('flipped');
            }
        });
    });
});

// 4 инпута (код) в модальном окне авторищации
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.auth-form__inputs input');
    if (!inputs) return;
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.slice(-1);
            }

            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
});

// иммитация отправки номера телефона на странице authorization
document.addEventListener('DOMContentLoaded', function () {
    const elements = document.querySelectorAll('[data-auth]');
    const phoneForm = document.querySelector('.auth-form--phone');
    const codeForm = document.querySelector('.auth-form--code');

    if (!elements) return;
    elements.forEach((element) => {
        element.addEventListener('click', function () {
            const attr = element.getAttribute('data-auth');
            if (!attr && !phoneForm && !codeForm) return;
            if (attr === 'code') {
                phoneForm.style.display = 'none';
                codeForm.style.display = 'block';
            }
            if (attr === 'phone') {
                phoneForm.style.display = 'block';
                codeForm.style.display = 'none';
            }
        });
    });
});

// открытие/закрытие мини-аккаунта при наведении на кнопку "личный кабинет"
document.addEventListener('DOMContentLoaded', function () {
    const miniAccount = document.querySelector('.header-top__mini-account');
    const accountPopup = document.querySelector('.header-top__account');

    if (!miniAccount && !accountPopup) return;
    miniAccount.addEventListener('mouseenter', function () {
        accountPopup.classList.add('is-visible');
        accountPopup.hidden = false;
    });
    miniAccount.addEventListener('mouseleave', function () {
        accountPopup.classList.remove('is-visible');
        accountPopup.hidden = true;
    });
});

// плавный спуск по якорю на старнице товара
document.addEventListener('DOMContentLoaded', function () {
    const scrollLinks = document.querySelectorAll('.product-item__faqs-link, .product-item__rating-link');

    scrollLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });
});

// Выбрать все чекбоксы на странице корзины
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.cart-top__toggle');
    const checkboxes = document.querySelectorAll('.cart-product__checkbox input');
    if (!toggleButton || !checkboxes) return;
    toggleButton.addEventListener('click', function (e) {
        if (e.target.closest('input')) {
            checkboxes.forEach((checkbox) => {
                e.target.closest('input').checked === true ? (checkbox.checked = true) : (checkbox.checked = false);
            });
        }
    });
});
