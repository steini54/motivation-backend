(function initializeVitaGenDocumentRenderer(global) {
  "use strict";

  const DEFAULT_STYLE = "swiss-line.css";
  const CV_TEMPLATE_BY_STYLE = {
    "aqua-arc-default.css": "aqua-arc",
    "aqua-arc-soft.css": "aqua-arc",
    "aqua-arc-contrast.css": "aqua-arc",
    "corporate-axis-default.css": "corporate-axis",
    "corporate-axis-steel.css": "corporate-axis",
    "corporate-axis-navy.css": "corporate-axis",
    "editorial-mono-default.css": "editorial-mono",
    "editorial-mono-warm.css": "editorial-mono",
    "editorial-mono-classic.css": "editorial-mono",
  };
  const BODY_WORD_LIMIT = 270;
  const CV_SAFE_BOTTOM_PX = 18;
  const CV_MIN_BODY_CHUNK_WORDS = 36;

  const COPY = {
    de: {
      preview: "VORSCHAU",
      page: "Seite",
      of: "von",
      motivationWarning:
        "Ihr Text ist zu lang fuer ein einseitiges Motivationsschreiben. Bitte kuerzen Sie ihn oder generieren Sie eine kuerzere Version.",
      cvWarning:
        "Der Lebenslauf ist sehr lang. Bitte pruefen Sie die Vollbild-Vorschau vor dem Download.",
      name: "Max Mustermann",
      cvName: "Max Muster",
      role: "Kaufmaennischer Mitarbeiter",
      company: "Musterfirma AG",
      department: "Personalabteilung",
      addressLine: "Limmatquai 10",
      city: "8001 Zuerich",
      subject: "Bewerbung als {role}",
      greeting: "Sehr geehrte Damen und Herren",
      motivationBody:
        "Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.",
      signoff: "Mit freundlichen Gruessen",
      profile: "Profil",
      work: "Berufserfahrung",
      education: "Schulbildung",
      training: "Weiterbildung",
      skills: "Kenntnisse",
      interests: "Interessen",
      contact: "Kontakt",
      cvLabel: "Lebenslauf",
      position: "Position",
      addNow: "Jetzt ergaenzen",
      continued: "Fortsetzung",
      defaultProfile:
        "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.",
      defaultAddress: "Bahnhofstrasse 12\n8001 Zuerich",
      defaultContact: "max@example.com\n+41 79 123 45 67",
      defaultDate: "Zuerich, 18.06.2026",
    },
    en: {
      preview: "PREVIEW",
      page: "Page",
      of: "of",
      motivationWarning:
        "Your text is too long for a one-page motivation letter. Please shorten it or regenerate a shorter version.",
      cvWarning:
        "The CV is very long. Please check the full preview before downloading.",
      name: "Max Sample",
      cvName: "Max Sample",
      role: "Commercial employee",
      company: "Sample Company Ltd",
      department: "HR department",
      addressLine: "Limmatquai 10",
      city: "8001 Zurich",
      subject: "Application as {role}",
      greeting: "Dear Sir or Madam",
      motivationBody:
        "I am applying with great interest. With my experience and structured working style, I am confident I can support your team effectively.",
      signoff: "Kind regards",
      profile: "Profile",
      work: "Work experience",
      education: "Education",
      training: "Further training",
      skills: "Skills",
      interests: "Interests",
      contact: "Contact",
      cvLabel: "CV",
      position: "Position",
      addNow: "Add now",
      continued: "continued",
      defaultProfile:
        "Structured, reliable professional with experience in organization, communication, and service-oriented collaboration.",
      defaultAddress: "Bahnhofstrasse 12\n8001 Zurich",
      defaultContact: "max@example.com\n+41 79 123 45 67",
      defaultDate: "Zurich, 18.06.2026",
    },
  };

  function locale(language) {
    return language === "en" ? "en" : "de";
  }

  function t(language, key, replacements = {}) {
    const dictionary = COPY[locale(language)];
    let value = dictionary[key] || COPY.de[key] || key;
    Object.entries(replacements).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, replacement);
    });
    return value;
  }

  function text(value, fallback = "") {
    const clean = String(value || "").trim();
    return clean || fallback;
  }

  function cvTemplateId(options = {}) {
    const explicit = String(options.templateId || "").trim();
    if (explicit && explicit !== "existing") {
      return explicit;
    }

    const styleName = String(options.styleName || DEFAULT_STYLE).trim().split(/[\\/]/).pop();
    return CV_TEMPLATE_BY_STYLE[styleName] || "existing";
  }

  function words(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean);
  }

  function node(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className") {
        element.className = value;
      } else if (key === "text") {
        element.textContent = value;
      } else if (key === "html") {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    children.filter(Boolean).forEach((child) => {
      element.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return element;
  }

  function textWithBreaks(value, fallback = "") {
    const fragment = document.createDocumentFragment();
    text(value, fallback)
      .split(/\r?\n/)
      .forEach((line, index) => {
        if (index > 0) fragment.appendChild(document.createElement("br"));
        fragment.appendChild(document.createTextNode(line));
      });
    return fragment;
  }

  function splitParagraphs(value, fallback) {
    return text(value, fallback)
      .split(/\n{2,}|\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function isGreetingLine(line) {
    return /^(sehr geehrte|dear\s|to whom it may concern)/i.test(line.trim());
  }

  function isSignoffLine(line) {
    return /^(mit freundlichen|freundliche gruesse|kind regards|sincerely|best regards)/i.test(
      line.trim()
    );
  }

  function removeDuplicateLetterParts(lines, signature) {
    const cleanSignature = String(signature || "").trim().toLowerCase();
    return lines
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !isGreetingLine(line))
      .filter((line) => !isSignoffLine(line))
      .filter((line) => !cleanSignature || line.toLowerCase() !== cleanSignature);
  }

  function createPage({ type, pageNumber, pageCount, watermark, language, templateId }) {
    const templateClass = templateId ? ` document-page--template-${templateId}` : "";
    const page = node("section", {
      className: `document-page document-page--${type}${templateClass}`,
      "data-page": String(pageNumber),
      "data-page-count": String(pageCount),
      "data-template": templateId || undefined,
    });

    if (watermark) {
      page.appendChild(
        node("div", { className: "document-watermark" }, [
          node("span", { className: "watermark", text: t(language, "preview") }),
        ])
      );
    }

    return page;
  }

  function buildMotivation(options) {
    const language = locale(options.language);
    const data = options.data || {};
    const templateId = cvTemplateId(options);
    const warnings = [];
    const role = text(data.posten || data.funktion, t(language, "role"));
    const signature = text(data.unterschrift || data.name, t(language, "name"));
    const greeting = text(data.stichwoerter, t(language, "greeting"));
    const rawBody = splitParagraphs(data.stichwoerter2, t(language, "motivationBody"));
    const bodyLines = removeDuplicateLetterParts(rawBody, signature);
    const bodyParagraphs = bodyLines.length ? bodyLines.slice(0, 3) : [t(language, "motivationBody")];
    const rawClosing = splitParagraphs(data.stichwoerter3, "");
    const closingLines = removeDuplicateLetterParts(rawClosing, signature);
    const closingNote = closingLines[0] || "";
    const bodyWordCount = bodyParagraphs.reduce((count, paragraph) => count + words(paragraph).length, 0);

    if (bodyWordCount > BODY_WORD_LIMIT || rawBody.length > 3) {
      warnings.push(t(language, "motivationWarning"));
    }

    const page = createPage({
      type: "motivation",
      pageNumber: 1,
      pageCount: 1,
      watermark: options.watermark,
      language,
      templateId,
    });
    const templateClass = templateId === "existing" ? "" : ` letter-template--${templateId}`;
    const content = node("article", { className: `document-content anschreiben letter-content${templateClass}` });
    const header = node("header", { className: "letterhead" }, [
      node("div", { className: "letter-identity" }, [
        node("h1", { id: "pv-name", text: text(data.name, t(language, "name")) }),
        node("p", { id: "pv-kontakt", text: role.toUpperCase() }),
      ]),
    ]);

    if (data.foto) {
      header.appendChild(
        node("img", {
          id: "pv-foto",
          src: data.foto,
          alt: "Bewerbungsfoto",
        })
      );
    }

    const employer = text(
      data.arbeitgeber,
      `${t(language, "company")}\n${t(language, "department")}\n${t(language, "addressLine")}\n${t(language, "city")}`
    );

    content.append(
      header,
      node("div", { className: "document-rule", "aria-hidden": "true" }),
      node("div", { className: "letter-meta" }, [
        node("p", { id: "pv-arbeitgeber" }, [textWithBreaks(employer)]),
        node("p", { id: "pv-datum", text: text(data.datum, t(language, "defaultDate")) }),
      ]),
      node("h2", {
        id: "pv-funktion",
        className: "letter-subject",
        text: t(language, "subject", { role }),
      }),
      node("p", { id: "pv-stichwoerter", className: "letter-greeting", text: greeting }),
      node(
        "div",
        { id: "pv-stichwoerter2", className: "letter-body" },
        bodyParagraphs.map((paragraph) => node("p", { text: paragraph }))
      ),
      node("div", { className: "letter-spacer", "aria-hidden": "true" }),
      node("footer", { className: "closing-block doc-signature" }, [
        ...(closingNote ? [node("p", { id: "pv-stichwoerter3", text: closingNote })] : []),
        node("p", { className: "letter-signoff", text: t(language, "signoff") }),
        node("strong", { id: "pv-unterschrift", text: signature }),
      ])
    );

    page.appendChild(content);
    return { pages: [page], pageCount: 1, warnings };
  }

  function cleanEntries(entries) {
    return (Array.isArray(entries) ? entries : []).filter((entry) =>
      Object.values(entry || {}).some((value) => String(value || "").trim())
    );
  }

  function clonePageModel(page) {
    return {
      sections: page.sections.map((section) => ({
        key: section.key,
        title: section.title,
        entries: section.entries.slice(),
      })),
    };
  }

  function pageHasEntries(page) {
    return page.sections.some((section) => section.entries.length > 0);
  }

  function addEntryToPage(page, section, entry) {
    let targetSection = page.sections.find((item) => item.key === section.key);
    if (!targetSection) {
      targetSection = { key: section.key, title: section.title, entries: [] };
      page.sections.push(targetSection);
    }
    targetSection.entries.push(entry);
  }

  function pageWithEntry(page, section, entry) {
    const candidate = clonePageModel(page);
    addEntryToPage(candidate, section, entry);
    return candidate;
  }

  function popLastEntry(page) {
    for (let index = page.sections.length - 1; index >= 0; index -= 1) {
      const section = page.sections[index];
      const entry = section.entries.pop();
      if (entry) {
        if (section.entries.length === 0) {
          page.sections.splice(index, 1);
        }
        return {
          section: { key: section.key, title: section.title },
          entry,
        };
      }
    }
    return null;
  }

  function pageEntryCount(page) {
    return page.sections.reduce((count, section) => count + section.entries.length, 0);
  }

  function cvSectionEntries(data, language, templateId = "existing") {
    const isExistingTemplate = templateId === "existing";
    const sections = [];
    const profile = text(data.profil, t(language, "defaultProfile"));
    if (isExistingTemplate) {
      sections.push({
        key: "profile",
        title: t(language, "profile"),
        entries: [{ title: "", meta: "", body: profile }],
      });
    }

    const work = cleanEntries(data.beruf).map((entry) => ({
      title: text(entry["beruf-position"], t(language, "position")),
      meta: [entry["beruf-ort"], [entry["beruf-von"], entry["beruf-bis"]].filter(Boolean).join(" - ")]
        .filter(Boolean)
        .join(" | "),
      body: entry["beruf-aufgaben"] || entry["beruf-firma"] || "",
    }));
    sections.push({
      key: "work",
      title: t(language, "work"),
      entries: work.length ? work : [{ title: t(language, "position"), meta: "", body: t(language, "addNow") }],
    });

    const education = cleanEntries(data.schulbildung).map((entry) => ({
      title: text(entry["schule-abschluss"] || entry.schule, t(language, "education")),
      meta: [entry.schule, entry["schule-ort"], [entry["schule-von"], entry["schule-bis"]].filter(Boolean).join(" - ")]
        .filter(Boolean)
        .join(" | "),
      body: "",
    }));
    if (isExistingTemplate) {
      sections.push({
        key: "education",
        title: t(language, "education"),
        entries: education.length ? education : [{ title: t(language, "education"), meta: "", body: t(language, "addNow") }],
      });
    }

    const training = cleanEntries(data.weiterbildung).map((entry) => ({
      title: text(entry["weiterbildung-titel"], t(language, "training")),
      meta: [entry["weiterbildung-ort"], [entry["weiterbildung-von"], entry["weiterbildung-bis"]].filter(Boolean).join(" - ")]
        .filter(Boolean)
        .join(" | "),
      body: entry["weiterbildung-inhalt"] || "",
    }));
    if (training.length) {
      sections.push({ key: "training", title: t(language, "training"), entries: training });
    }

    const skills = cleanEntries(data.kenntnisse).map((entry) => entry.kenntnisse).filter(Boolean);
    if (isExistingTemplate && skills.length > 12) {
      sections.push({
        key: "skills-extra",
        title: t(language, "skills"),
        entries: [{ title: "", meta: "", body: skills.slice(12).join(", ") }],
      });
    }

    const interests = cleanEntries(data.hobbys).map((entry) => entry.hobbys).filter(Boolean);
    if (interests.length > 6) {
      sections.push({
        key: "interests-extra",
        title: t(language, "interests"),
        entries: [{ title: "", meta: "", body: interests.slice(6).join(", ") }],
      });
    }

    return sections;
  }

  function renderCvFooter(data, language) {
    return node("footer", { className: "cv-footer" }, [
      node("span", { id: "pv-datum", text: text(data.datum, t(language, "defaultDate")) }),
      node("strong", { id: "pv-unterschrift", text: text(data.unterschrift || data.name, t(language, "cvName")) }),
    ]);
  }

  function renderCvEntry(entry, sectionKey) {
    return node("div", { className: "timeline-item cv-entry" }, [
      entry.title ? node("strong", { className: "cv-entry-title", text: entry.title }) : null,
      entry.meta ? node("span", { className: "cv-entry-meta", text: entry.meta }) : null,
      entry.body
        ? node("p", {
            className: sectionKey === "profile" ? "cv-entry-desc cv-profile-text" : "cv-entry-desc",
            text: entry.body,
          })
        : null,
    ]);
  }

  function renderCvSection(section) {
    return node("section", { className: "cv-section", "data-section": section.key }, [
      node("h2", { className: "cv-section-title", text: section.title }),
      node(
        "div",
        { className: "timeline" },
        section.entries.map((entry) => renderCvEntry(entry, section.key))
      ),
    ]);
  }

  function renderedContentHeight(container, paddingTop) {
    let bottom = 0;
    Array.from(container.children).forEach((child) => {
      const rect = child.getBoundingClientRect();
      const styles = global.getComputedStyle ? global.getComputedStyle(child) : null;
      const marginBottom = styles ? parseFloat(styles.marginBottom) || 0 : 0;
      bottom = Math.max(bottom, rect.bottom - container.getBoundingClientRect().top - paddingTop + marginBottom);
    });
    return Math.max(0, bottom);
  }

  function createCvMeasurer(data, language, templateId = "existing") {
    if (!global.document?.body || !global.getComputedStyle) {
      return null;
    }

    const root = node("div", { className: "preview-paper document-rendered document-measurement-root" });
    root.dataset.template = templateId;
    const page = createPage({ type: "cv", pageNumber: 1, pageCount: 1, watermark: false, language, templateId });
    const article = node("article", { className: `document-content cv cv-template--${templateId}` });
    const main = node("section", { className: "cv-main" });
    article.append(buildCvSidebar(data, language, 1, 1, templateId), main);
    page.appendChild(article);
    root.appendChild(page);
    global.document.body.appendChild(root);

    const mainStyles = global.getComputedStyle(main);
    const paddingTop = parseFloat(mainStyles.paddingTop) || 0;
    const paddingBottom = parseFloat(mainStyles.paddingBottom) || 0;
    main.innerHTML = "";
    main.appendChild(renderCvFooter(data, language));
    const footerHeight = renderedContentHeight(main, paddingTop);
    const mainHeight = main.getBoundingClientRect().height;
    const finalLimit = mainHeight - paddingTop - paddingBottom - CV_SAFE_BOTTOM_PX;
    const nonFinalLimit = finalLimit - footerHeight - CV_SAFE_BOTTOM_PX;
    main.innerHTML = "";

    function renderMain(pageModel, includeFooter = false) {
      main.innerHTML = "";
      if (templateId === "existing") {
        main.appendChild(node("p", { className: "document-label", text: t(language, "cvLabel") }));
      } else {
        main.appendChild(buildTemplateCvHero(data, language));
      }
      pageModel.sections.forEach((section) => main.appendChild(renderCvSection(section)));
      if (includeFooter) {
        main.appendChild(renderCvFooter(data, language));
      }
    }

    function measure(pageModel, includeFooter = false) {
      renderMain(pageModel, includeFooter);
      return renderedContentHeight(main, paddingTop);
    }

    function fits(pageModel, includeFooter = false) {
      const limit = includeFooter ? finalLimit : nonFinalLimit;
      return measure(pageModel, includeFooter) <= limit;
    }

    return {
      root,
      fits,
    };
  }

  function splitEntryToMeasuredChunks(section, entry, language, measurer) {
    const bodyWords = words(entry.body);
    if (bodyWords.length === 0) {
      return [entry];
    }

    const chunks = [];
    let index = 0;
    while (index < bodyWords.length) {
      let low = Math.min(CV_MIN_BODY_CHUNK_WORDS, bodyWords.length - index);
      let high = bodyWords.length - index;
      let best = low;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const chunk = {
          ...entry,
          title: chunks.length === 0 ? entry.title : `${entry.title} - ${t(language, "continued")}`,
          body: bodyWords.slice(index, index + mid).join(" "),
        };
        const page = { sections: [] };
        addEntryToPage(page, section, chunk);
        if (measurer.fits(page, false)) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      chunks.push({
        ...entry,
        title: chunks.length === 0 ? entry.title : `${entry.title} - ${t(language, "continued")}`,
        body: bodyWords.slice(index, index + best).join(" "),
      });
      index += best;
    }

    return chunks;
  }

  function paginateCvFallback(data, language, templateId = "existing") {
    const pages = [{ sections: [] }];
    cvSectionEntries(data, language, templateId).forEach((section) => {
      section.entries.forEach((entry) => addEntryToPage(pages[0], section, entry));
    });
    return pages;
  }

  function ensureFinalFooterFits(pages, measurer) {
    let guard = 0;
    while (pages.length && !measurer.fits(pages[pages.length - 1], true) && guard < 20) {
      const finalPage = pages[pages.length - 1];
      if (pageEntryCount(finalPage) <= 1) {
        break;
      }
      const moved = popLastEntry(finalPage);
      if (!moved) {
        break;
      }
      const newPage = { sections: [] };
      addEntryToPage(newPage, moved.section, moved.entry);
      pages.push(newPage);
      guard += 1;
    }
  }

  function paginateCv(data, language, templateId = "existing") {
    const measurer = createCvMeasurer(data, language, templateId);
    if (!measurer) {
      return paginateCvFallback(data, language, templateId);
    }

    try {
      const pages = [{ sections: [] }];
      let current = pages[0];

      cvSectionEntries(data, language, templateId).forEach((section) => {
        section.entries.forEach((rawEntry) => {
          const emptyPage = { sections: [] };
          addEntryToPage(emptyPage, section, rawEntry);
          const entries = measurer.fits(emptyPage, false)
            ? [rawEntry]
            : splitEntryToMeasuredChunks(section, rawEntry, language, measurer);

          entries.forEach((entry) => {
            let candidate = pageWithEntry(current, section, entry);
            if (!measurer.fits(candidate, false) && pageHasEntries(current)) {
              current = { sections: [] };
              pages.push(current);
              candidate = pageWithEntry(current, section, entry);
            }

            if (!measurer.fits(candidate, false) && !pageHasEntries(current)) {
              addEntryToPage(current, section, entry);
              return;
            }

            addEntryToPage(current, section, entry);
          });
        });
      });

      ensureFinalFooterFits(pages, measurer);
      return pages.filter(pageHasEntries);
    } finally {
      measurer.root.remove();
    }
  }

  function makePills(values, limit) {
    return values.slice(0, limit).map((value) => node("span", { text: value }));
  }

  function makeSidebarEntry(title, meta, body) {
    return node("div", { className: "cv-side-entry" }, [
      node("strong", { text: title }),
      meta ? node("span", { text: meta }) : null,
      body ? node("p", { text: body }) : null,
    ]);
  }

  function buildCvSidebarSection(title, children, className = "") {
    return node("div", { className: `cv-block ${className}`.trim() }, [
      node("h3", { text: title }),
      ...children,
    ]);
  }

  function educationSidebarEntries(data, language) {
    const entries = cleanEntries(data.schulbildung).map((entry) =>
      makeSidebarEntry(
        text(entry["schule-abschluss"] || entry.schule, t(language, "education")),
        [entry.schule, entry["schule-ort"]].filter(Boolean).join(" | "),
        [entry["schule-von"], entry["schule-bis"]].filter(Boolean).join(" - ")
      )
    );

    return entries.length
      ? entries.slice(0, 3)
      : [makeSidebarEntry(t(language, "education"), "", t(language, "addNow"))];
  }

  function trainingSidebarEntries(data, language) {
    return cleanEntries(data.weiterbildung)
      .map((entry) =>
        makeSidebarEntry(
          text(entry["weiterbildung-titel"], t(language, "training")),
          [entry["weiterbildung-ort"], [entry["weiterbildung-von"], entry["weiterbildung-bis"]].filter(Boolean).join(" - ")]
            .filter(Boolean)
            .join(" | "),
          ""
        )
      )
      .slice(0, 2);
  }

  function buildTemplateCvHero(data, language) {
    return node("header", { className: "cv-template-hero" }, [
      node("p", { className: "document-label", text: t(language, "cvLabel") }),
      node("h1", { id: "pv-name", text: text(data.name, t(language, "cvName")) }),
      node("p", {
        id: "pv-headline",
        className: "cv-template-headline",
        text: text(data.headline, t(language, "role")).toUpperCase(),
      }),
      node("p", {
        className: "cv-template-profile",
        text: text(data.profil, t(language, "defaultProfile")),
      }),
    ]);
  }

  function buildCvSidebar(data, language, pageNumber, pageCount, templateId = "existing") {
    const skills = cleanEntries(data.kenntnisse).map((entry) => entry.kenntnisse).filter(Boolean);
    const interests = cleanEntries(data.hobbys).map((entry) => entry.hobbys).filter(Boolean);
    const sidebar = node("aside", {
      className: pageNumber === 1 ? "cv-side" : "cv-side cv-side--compact",
    });

    if (templateId !== "existing" && pageNumber === 1) {
      if (data.foto) {
        sidebar.appendChild(node("img", { id: "pv-foto", src: data.foto, alt: "Bewerbungsfoto" }));
      }

      sidebar.append(
        buildCvSidebarSection(t(language, "contact"), [
          node("p", { id: "pv-kontakt" }, [
            textWithBreaks(text(data.kontakt, t(language, "defaultContact"))),
          ]),
          node("p", { id: "pv-adresse" }, [
            textWithBreaks(text(data.adresse, t(language, "defaultAddress"))),
          ]),
        ]),
        buildCvSidebarSection(t(language, "education"), educationSidebarEntries(data, language), "cv-side-education"),
        ...(
          trainingSidebarEntries(data, language).length
            ? [buildCvSidebarSection(t(language, "training"), trainingSidebarEntries(data, language), "cv-side-training")]
            : []
        ),
        buildCvSidebarSection(t(language, "skills"), [
          node("div", { id: "pv-kenntnisse", className: "pill-list" }, makePills(skills.length ? skills : ["MS Office", "Organisation", "Kommunikation"], 14)),
        ]),
        buildCvSidebarSection(t(language, "interests"), [
          node("div", { id: "pv-hobbys", className: "pill-list muted" }, makePills(interests.length ? interests : ["Lesen", "Sport"], 8)),
        ])
      );

      return sidebar;
    }

    if (pageNumber === 1 && data.foto) {
      sidebar.appendChild(node("img", { id: "pv-foto", src: data.foto, alt: "Bewerbungsfoto" }));
    }

    if (pageNumber === 1) {
      sidebar.append(
        node("h1", { id: "pv-name", text: text(data.name, t(language, "cvName")) }),
        node("p", { id: "pv-headline", text: text(data.headline, t(language, "role")).toUpperCase() }),
        node("div", { className: "cv-block" }, [
          node("h3", { text: t(language, "contact") }),
          node("p", { id: "pv-kontakt" }, [
            textWithBreaks(text(data.kontakt, t(language, "defaultContact"))),
          ]),
          node("p", { id: "pv-adresse" }, [
            textWithBreaks(text(data.adresse, t(language, "defaultAddress"))),
          ]),
        ]),
        node("div", { className: "cv-block" }, [
          node("h3", { text: t(language, "skills") }),
          node("div", { id: "pv-kenntnisse", className: "pill-list" }, makePills(skills.length ? skills : ["MS Office", "Organisation", "Kommunikation"], 12)),
        ]),
        node("div", { className: "cv-block" }, [
          node("h3", { text: t(language, "interests") }),
          node("div", { id: "pv-hobbys", className: "pill-list muted" }, makePills(interests.length ? interests : ["Lesen", "Sport"], 6)),
        ])
      );
    } else {
      sidebar.append(
        node("h1", { id: pageNumber === 2 ? "pv-name-cont" : undefined, text: text(data.name, t(language, "cvName")) }),
        node("p", { id: pageNumber === 2 ? "pv-headline-cont" : undefined, text: text(data.headline, t(language, "role")) }),
        node("div", { className: "cv-block cv-continuation-contact" }, [
          node("h3", { text: t(language, "contact") }),
          node("p", {}, [textWithBreaks(text(data.kontakt, t(language, "defaultContact")))]),
        ]),
        node("p", {
          className: "cv-page-marker cv-page-number",
          text: `${t(language, "page")} ${pageNumber} ${t(language, "of")} ${pageCount}`,
        })
      );
    }

    return sidebar;
  }

  function buildCv(options) {
    const language = locale(options.language);
    const data = options.data || {};
    const templateId = cvTemplateId(options);
    const pageModels = paginateCv(data, language, templateId);
    const warnings = pageModels.length > 3 ? [t(language, "cvWarning")] : [];
    const pages = pageModels.map((model, index) => {
      const pageNumber = index + 1;
      const page = createPage({
        type: "cv",
        pageNumber,
        pageCount: pageModels.length,
        watermark: options.watermark,
        language,
        templateId,
      });
      const templateClass = templateId === "existing" ? "" : ` cv-template--${templateId}`;
      const article = node("article", {
        className: `${pageNumber === 1 ? "document-content cv" : "document-content cv cv--continuation"}${templateClass}`,
      });
      const mainChildren = templateId === "existing"
        ? [node("p", { className: "document-label", text: t(language, "cvLabel") })]
        : pageNumber === 1
          ? [buildTemplateCvHero(data, language)]
          : [node("p", { className: "document-label", text: `${t(language, "cvLabel")} - ${t(language, "continued")}` })];
      const main = node("section", { className: "cv-main" }, [
        ...mainChildren,
        ...model.sections.map(renderCvSection),
      ]);

      if (pageNumber === pageModels.length) {
        main.appendChild(renderCvFooter(data, language));
      }

      article.append(buildCvSidebar(data, language, pageNumber, pageModels.length, templateId), main);
      page.appendChild(article);
      return page;
    });

    return { pages, pageCount: pages.length, warnings };
  }

  function documentHash(options, pageCount, warnings) {
    const payload = JSON.stringify({
      type: options.type,
      styleName: options.styleName || DEFAULT_STYLE,
      language: locale(options.language),
      data: options.data || {},
      pageCount,
      warnings,
    });
    let hash = 0;
    for (let index = 0; index < payload.length; index += 1) {
      hash = (hash << 5) - hash + payload.charCodeAt(index);
      hash |= 0;
    }
    return String(hash >>> 0);
  }

  function renderDocument(options) {
    const result = options.type === "cv" || options.type === "lebenslauf" ? buildCv(options) : buildMotivation(options);
    result.documentHash = documentHash(options, result.pageCount, result.warnings);
    return result;
  }

  function renderInto(target, options) {
    const result = renderDocument(options);
    target.innerHTML = "";
    target.classList.add("document-rendered");
    target.dataset.style = options.styleName || DEFAULT_STYLE;
    target.dataset.template = cvTemplateId(options);
    target.dataset.documentType = options.type === "lebenslauf" ? "cv" : options.type;
    target.dataset.pageCount = String(result.pageCount);
    target.dataset.documentHash = result.documentHash;
    result.pages.forEach((page) => target.appendChild(page));
    if (result.pageCount > 1) {
      target.appendChild(
        node("div", {
          className: "document-page-count",
          text: `${t(options.language, "page")} 1 ${t(options.language, "of")} ${result.pageCount}`,
        })
      );
    }
    return result;
  }

  global.VitaGenDocumentRenderer = {
    renderDocument,
    renderInto,
  };
})(window);
