(function () {
  "use strict";

  const LANGUAGE_STORAGE_KEY = "vitagen_language";
  const FALLBACK_LANGUAGE = "de";
  const ROUTES = {
    cv: "/bewerbungs-generator/lebenslauf/lebensformular.html",
    motivation: "/bewerbungs-generator/motivation/formular.html",
  };
  const LABELS = {
    de: {
      "nav.cv": "Lebenslauf",
      "nav.motivation": "Motivation",
      "nav.save": "Speichern",
      "nav.preview": "Vollbild-Vorschau",
    },
    en: {
      "nav.cv": "CV",
      "nav.motivation": "Motivation",
      "nav.save": "Save",
      "nav.preview": "Full preview",
    },
  };

  function normalizeLanguage(language) {
    return language === "en" ? "en" : FALLBACK_LANGUAGE;
  }

  function getStoredLanguage() {
    try {
      return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    } catch {
      return FALLBACK_LANGUAGE;
    }
  }

  function getActivePage(mount) {
    if (mount.dataset.active === "motivation") {
      return "motivation";
    }
    if (mount.dataset.active === "cv") {
      return "cv";
    }
    return window.location.pathname.includes("/motivation/") ? "motivation" : "cv";
  }

  function navTemplate(activePage) {
    const cvActive = activePage === "cv" ? " class=\"active\"" : "";
    const motivationActive = activePage === "motivation" ? " class=\"active\"" : "";

    return `
      <nav class="topbar" data-vitagen-shared-navbar>
        <a class="brand" href="${ROUTES.cv}" aria-label="VitaGen">
          <img src="/bewerbungs-generator/assets/vitagen-logo.png" alt="VitaGen Logo" class="brand-img" />
          <span class="brand-mark">VG</span>
          <span>VitaGen</span>
        </a>
        <div class="product-switch" aria-label="Generator wechseln">
          <a${cvActive} href="${ROUTES.cv}" data-i18n="nav.cv">Lebenslauf</a>
          <a${motivationActive} href="${ROUTES.motivation}" data-i18n="nav.motivation">Motivation</a>
        </div>
        <div class="topbar-actions">
          <div class="lang-switch" aria-label="Sprache waehlen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lang-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <div class="lang-options">
              <button type="button" class="lang-btn" data-lang="de" aria-pressed="true">DE</button>
              <button type="button" class="lang-btn muted" data-lang="en" aria-pressed="false">EN</button>
            </div>
          </div>
          <button type="button" id="saveBtn" class="secondary-button" data-i18n="nav.save">Speichern</button>
          <button type="button" id="previewBtn" class="primary-button" data-i18n="nav.preview">Vollbild-Vorschau</button>
        </div>
      </nav>
    `;
  }

  function applyNavbarLanguage(language) {
    const normalized = normalizeLanguage(language);
    const labels = LABELS[normalized] || LABELS[FALLBACK_LANGUAGE];

    document.documentElement.lang = normalized;
    document.querySelectorAll("[data-vitagen-shared-navbar] [data-i18n]").forEach((element) => {
      const label = labels[element.dataset.i18n];
      if (label) {
        element.textContent = label;
      }
    });
    document.querySelectorAll("[data-vitagen-shared-navbar] [data-lang]").forEach((button) => {
      const active = button.dataset.lang === normalized;
      button.classList.toggle("muted", !active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(language) {
    const normalized = normalizeLanguage(language);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
      // Keep the switch usable when storage is blocked.
    }
    applyNavbarLanguage(normalized);
    document.dispatchEvent(
      new CustomEvent("vitagen:languagechange", {
        detail: { language: normalized },
      })
    );
  }

  function installLanguageButtons(navbar) {
    navbar.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });
  }

  function render() {
    document.querySelectorAll("[data-vitagen-navbar]").forEach((mount) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = navTemplate(getActivePage(mount)).trim();
      const navbar = wrapper.firstElementChild;
      mount.replaceWith(navbar);
      installLanguageButtons(navbar);
    });
    applyNavbarLanguage(getStoredLanguage());
  }

  window.VitaGenNavbar = {
    getLanguage: getStoredLanguage,
    render,
    setLanguage,
  };

  render();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  }
})();
