(function initializeVitaGenDocumentRenderer(global) {
  "use strict";

  const DEFAULT_STYLE = "swiss-line.css";
  const BODY_WORD_LIMIT = 270;
  const CV_PAGE_ONE_BUDGET = 34;
  const CV_CONTINUATION_BUDGET = 42;

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
      closingNote:
        "Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.",
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
      closingNote:
        "I would be happy to discuss my motivation with you in a personal interview.",
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

  function createPage({ type, pageNumber, pageCount, watermark, language }) {
    const page = node("section", {
      className: `document-page document-page--${type}`,
      "data-page": String(pageNumber),
      "data-page-count": String(pageCount),
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
    const warnings = [];
    const role = text(data.posten || data.funktion, t(language, "role"));
    const signature = text(data.unterschrift || data.name, t(language, "name"));
    const greeting = text(data.stichwoerter, t(language, "greeting"));
    const rawBody = splitParagraphs(data.stichwoerter2, t(language, "motivationBody"));
    const bodyLines = removeDuplicateLetterParts(rawBody, signature);
    const bodyParagraphs = bodyLines.length ? bodyLines.slice(0, 3) : [t(language, "motivationBody")];
    const rawClosing = splitParagraphs(data.stichwoerter3, t(language, "closingNote"));
    const closingLines = removeDuplicateLetterParts(rawClosing, signature);
    const closingNote = closingLines[0] || t(language, "closingNote");
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
    });
    const content = node("article", { className: "document-content anschreiben letter-content" });
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
        node("p", { id: "pv-stichwoerter3", text: closingNote }),
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

  function entryUnits(entry) {
    const body = entry.body || "";
    return 3 + Math.ceil(words(body).length / 28);
  }

  function splitLongEntry(entry, maxUnits, language) {
    if (entryUnits(entry) <= maxUnits || words(entry.body).length < 80) {
      return [entry];
    }

    const allWords = words(entry.body);
    const chunkSize = Math.max(60, Math.floor((maxUnits - 3) * 24));
    const chunks = [];
    for (let index = 0; index < allWords.length; index += chunkSize) {
      chunks.push(allWords.slice(index, index + chunkSize).join(" "));
    }

    return chunks.map((chunk, index) => ({
      ...entry,
      title: index === 0 ? entry.title : `${entry.title} - ${t(language, "continued")}`,
      body: chunk,
    }));
  }

  function cvSectionEntries(data, language) {
    const sections = [];
    const profile = text(data.profil, t(language, "defaultProfile"));
    sections.push({
      key: "profile",
      title: t(language, "profile"),
      entries: [{ title: "", meta: "", body: profile }],
    });

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
    sections.push({
      key: "education",
      title: t(language, "education"),
      entries: education.length ? education : [{ title: t(language, "education"), meta: "", body: t(language, "addNow") }],
    });

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
    if (skills.length > 12) {
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

  function paginateCv(data, language) {
    const pages = [{ sections: [] }];
    let current = pages[0];
    let remaining = CV_PAGE_ONE_BUDGET;

    cvSectionEntries(data, language).forEach((section) => {
      let sectionStartedOnPage = false;
      section.entries.forEach((rawEntry) => {
        splitLongEntry(rawEntry, CV_CONTINUATION_BUDGET - 3, language).forEach((entry) => {
          const cost = entryUnits(entry) + (sectionStartedOnPage ? 0 : 2);
          if (cost > remaining && current.sections.length > 0) {
            current = { sections: [] };
            pages.push(current);
            remaining = CV_CONTINUATION_BUDGET;
            sectionStartedOnPage = false;
          }

          let targetSection = current.sections.find((item) => item.key === section.key);
          if (!targetSection) {
            targetSection = { key: section.key, title: section.title, entries: [] };
            current.sections.push(targetSection);
            remaining -= 2;
          }
          targetSection.entries.push(entry);
          remaining -= entryUnits(entry);
          sectionStartedOnPage = true;
        });
      });
    });

    return pages;
  }

  function makePills(values, limit) {
    return values.slice(0, limit).map((value) => node("span", { text: value }));
  }

  function buildCvSidebar(data, language, pageNumber, pageCount) {
    const skills = cleanEntries(data.kenntnisse).map((entry) => entry.kenntnisse).filter(Boolean);
    const interests = cleanEntries(data.hobbys).map((entry) => entry.hobbys).filter(Boolean);
    const sidebar = node("aside", {
      className: pageNumber === 1 ? "cv-side" : "cv-side cv-side--compact",
    });

    if (pageNumber === 1 && data.foto) {
      sidebar.appendChild(node("img", { id: "pv-foto", src: data.foto, alt: "Bewerbungsfoto" }));
    }

    sidebar.append(
      node("h1", { id: pageNumber === 1 ? "pv-name" : undefined, text: text(data.name, t(language, "cvName")) }),
      node("p", { id: pageNumber === 1 ? "pv-headline" : undefined, text: text(data.headline, t(language, "role")).toUpperCase() }),
      node("div", { className: "cv-block" }, [
        node("h3", { text: t(language, "contact") }),
        node("p", { id: pageNumber === 1 ? "pv-kontakt" : undefined }, [
          textWithBreaks(text(data.kontakt, t(language, "defaultContact"))),
        ]),
        node("p", { id: pageNumber === 1 ? "pv-adresse" : undefined }, [
          textWithBreaks(text(data.adresse, t(language, "defaultAddress"))),
        ]),
      ])
    );

    if (pageNumber === 1) {
      sidebar.append(
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
      sidebar.appendChild(
        node("p", { className: "cv-page-marker", text: `${t(language, "page")} ${pageNumber} ${t(language, "of")} ${pageCount}` })
      );
    }

    return sidebar;
  }

  function renderCvSection(section) {
    return node("section", { className: "cv-section", "data-section": section.key }, [
      node("h2", { text: section.title }),
      node(
        "div",
        { className: "timeline" },
        section.entries.map((entry) =>
          node("div", { className: "timeline-item" }, [
            entry.title ? node("strong", { text: entry.title }) : null,
            entry.meta ? node("span", { text: entry.meta }) : null,
            entry.body ? node("p", { text: entry.body }) : null,
          ])
        )
      ),
    ]);
  }

  function buildCv(options) {
    const language = locale(options.language);
    const data = options.data || {};
    const pageModels = paginateCv(data, language);
    const warnings = pageModels.length > 3 ? [t(language, "cvWarning")] : [];
    const pages = pageModels.map((model, index) => {
      const pageNumber = index + 1;
      const page = createPage({
        type: "cv",
        pageNumber,
        pageCount: pageModels.length,
        watermark: options.watermark,
        language,
      });
      const article = node("article", {
        className: pageNumber === 1 ? "document-content cv" : "document-content cv cv--continuation",
      });
      const main = node("section", { className: "cv-main" }, [
        node("p", { className: "document-label", text: t(language, "cvLabel") }),
        ...model.sections.map(renderCvSection),
      ]);

      if (pageNumber === pageModels.length) {
        main.appendChild(
          node("footer", { className: "cv-footer" }, [
            node("span", { id: "pv-datum", text: text(data.datum, t(language, "defaultDate")) }),
            node("strong", { id: "pv-unterschrift", text: text(data.unterschrift || data.name, t(language, "cvName")) }),
          ])
        );
      }

      article.append(buildCvSidebar(data, language, pageNumber, pageModels.length), main);
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
