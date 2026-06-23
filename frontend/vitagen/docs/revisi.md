# VitaGen Document Rendering Revision — CV + Motivation

## 0. Purpose

This document is for Codex/agent implementation.

The current issue is not only visual polish. The real problem is that **small live preview, full-screen preview, and final PDF must be generated from the exact same document layout engine**.

This applies to both:

```text
1. Motivation Letter Generator
2. CV Generator
```

Current behavior shows that the small preview can look acceptable while the full preview/PDF exposes spacing, font-size, pagination, and layout problems. That means the preview system is not trustworthy enough yet.

---

## 1. Non-negotiable principle

Build one canonical document renderer.

Do not create separate layouts for:

```text
small live preview
full-screen preview
PDF export
```

Correct architecture:

```text
CanonicalDocumentRenderer
├── MotivationLetterDocument
│   ├── rendered in small preview by scaling down
│   ├── rendered in full-screen preview by scaling the same DOM/layout
│   └── exported to PDF from the same DOM/layout
│
└── CVDocument
    ├── rendered in small preview by scaling down
    ├── rendered in full-screen preview by scaling the same DOM/layout
    └── exported to PDF from the same DOM/layout
```

The only allowed difference between small preview and full preview is:

```text
visual scale
container size
scroll/crop behavior
```

The following must not change between preview modes:

```text
page width
page height
font size
line height
paragraph width
padding
section spacing
line breaks
page breaks
photo size
watermark position
signature position
```

---

## 2. Official technical basis

Use these as implementation references:

```text
W3C CSS Paged Media Module Level 3
https://www.w3.org/TR/css-page-3/

MDN @page
https://developer.mozilla.org/en-US/docs/Web/CSS/@page

MDN @page size descriptor
https://developer.mozilla.org/en-US/docs/Web/CSS/@page/size

MDN page-break-inside / break-inside behavior
https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside

Puppeteer PDFOptions preferCSSPageSize
https://pptr.dev/api/puppeteer.pdfoptions

jsPDF official documentation
https://artskydj.github.io/jsPDF/docs/jsPDF.html
```

Implementation note:

- W3C and MDN define `@page` and `size` for printed pages.
- A4 should be treated as `210mm × 297mm`.
- Puppeteer supports `preferCSSPageSize`.
- jsPDF supports `format: "a4"` and `unit: "mm"`.

---

## 3. Current findings from attached CV output

Based on the attached CV PDF and screenshots:

### 3.1 PDF page size

The generated CV PDF is already A4:

```text
595.28 × 841.89 pts
≈ 210mm × 297mm
```

So the current problem is **not primarily PDF paper size**.

The problem is:

```text
layout scaling
preview parity
font sizing
content density
pagination behavior
multi-page handling
```

### 3.2 CV preview mismatch

The small live preview looks visually acceptable because it is small and clipped/scaled.

But the full-screen preview shows the real layout more clearly:

```text
- text is very small
- all content is squeezed into one page
- lower part of the page has too much unused whitespace
- layout does not clearly prove how a longer CV will continue to page 2
```

Small preview must not hide layout issues.

### 3.3 CV text density problem

The current CV tries to fit a large amount of content into one page.

This causes:

```text
- font too small
- section spacing too tight
- entries less readable
- risk of unreadable output for real users
```

For a professional CV, it is better to create a second page than to shrink everything until it technically fits.

### 3.4 Style token issue

Current style CSS uses style-specific variables, for example:

```css
--cv-cover-bg
--cv-cover-padding
--cv-photo-width
--cv-photo-height
--cv-name-size
--cv-main-padding
--cv-sidebar-width
```

This is good, but the renderer must not use these tokens in a way that creates different behavior between preview and PDF.

The renderer should use:

```text
shared base layout rules
+
style token overrides
```

Not:

```text
separate layout implementation per style
```

---

## 4. Required A4 rendering model

Every rendered document page must be a real A4 page.

```css
@page {
  size: A4;
  margin: 0;
}

.document-page {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  background: white;
  box-sizing: border-box;
}
```

Do not rely only on:

```css
aspect-ratio: 210 / 297;
```

`aspect-ratio` is acceptable for a visual wrapper, but the actual document page must still be `210mm × 297mm`.

---

## 5. Preview parity implementation

### 5.1 Correct structure

```html
<div class="preview-frame preview-frame--small">
  <div class="preview-scale" style="transform: scale(...);">
    <div class="document-page">
      <!-- exact same document DOM -->
    </div>
  </div>
</div>
```

Full preview:

```html
<div class="preview-frame preview-frame--fullscreen">
  <div class="preview-scale" style="transform: scale(...);">
    <div class="document-page">
      <!-- exact same document DOM -->
    </div>
  </div>
</div>
```

PDF export:

```html
<div class="document-page">
  <!-- exact same document DOM -->
</div>
```

### 5.2 Wrong structure

Do not do this:

```text
small preview has its own HTML
full preview has different HTML
PDF generator uses another template
```

That will always create mismatch.

---

## 6. Scaling rules

Small preview should scale the A4 page down.

Example:

```css
.preview-scale {
  width: 210mm;
  height: 297mm;
  transform-origin: top left;
}

.preview-frame--small {
  width: 100%;
  height: 420px;
  overflow: hidden;
}
```

JavaScript should calculate scale:

```js
const scale = previewFrame.clientWidth / a4PageWidthPx;
previewScale.style.transform = `scale(${scale})`;
previewFrame.style.height = `${a4PageHeightPx * scale}px`;
```

Important:

```text
Do not resize the A4 page itself.
Do not let text reflow inside the small preview.
Only scale the page visually.
```

---

## 7. Watermark rules

Watermark must be an overlay only.

```css
.preview-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}
```

The layout must be identical for:

```text
free preview with watermark
paid PDF without watermark
```

The only difference:

```text
watermark visible vs hidden
```

Removing watermark must not change:

```text
page height
text position
line breaks
signature position
page breaks
```

---

# PART A — Motivation Letter Revision

## 8. Motivation letter current problems

Observed issues from current output:

```text
1. Small preview looks okay, but full preview shows body is too short and page balance is weak.
2. Closing/signature placement is unstable.
3. Closing can duplicate because AI body may include "Kind regards" while the template also renders closing.
4. Body font appears too small.
5. Body text can become one dense block instead of clean paragraphs.
6. Applicant details promised in the UI are not clearly visible in letterhead.
7. Full preview and small preview are not reliable enough as a match to PDF.
```

---

## 9. Motivation letter canonical layout

Use a fixed A4 letter structure:

```text
A4 Page
├── Header / letterhead
│   ├── Applicant name
│   ├── role/title
│   ├── contact line: address · phone · email
│   └── optional photo
│
├── Divider line
│
├── Meta block
│   ├── Employer address left
│   └── Date right
│
├── Subject
│
├── Greeting
│
├── Body area
│   └── 2–3 body paragraphs
│
├── Flexible spacer
│
├── Closing/signature block
│
└── Safe bottom margin
```

---

## 10. Motivation typography targets

Use these as default target values:

```text
Applicant name: 20–24pt
Role/title: 7.5–8.5pt uppercase
Contact line: 8.5–9.5pt
Employer address/date: 8.5–9.5pt
Subject: 11.5–12.5pt bold
Greeting: 10.5–11pt
Body: 10.8–11.2pt
Line-height: 1.45–1.55
Closing/signature: 10.8–11.2pt
```

Do not use body font below:

```text
10.5pt
```

If text does not fit, do not keep shrinking. Show a warning.

---

## 11. Motivation body rules

AI must generate body content only.

AI output must not include:

```text
subject
greeting
closing
signature
applicant name at the end
company address
date
```

AI body should be:

```text
2–3 paragraphs
formal
clear
professional
suitable for one A4 page
```

Prompt rule:

```text
Return only the body paragraphs of the motivation letter.
Do not include greeting.
Do not include subject.
Do not include closing phrase.
Do not include signature or name.
Use 2–3 short paragraphs.
Keep it concise enough for a one-page A4 letter.
```

---

## 12. Motivation sanitizer

Do not trust AI output completely.

Before rendering, sanitize body text.

Remove trailing closing phrases such as:

```text
Kind regards
Kind regards,
Best regards
Best regards,
Sincerely
Yours sincerely
Mit freundlichen Grüssen
Freundliche Grüsse
```

Example:

```js
function sanitizeMotivationBody(text) {
  return text
    .replace(/\n?\s*(kind regards|best regards|sincerely|yours sincerely|mit freundlichen grüssen|freundliche grüsse),?\s*$/i, "")
    .trim();
}
```

Also strip accidental greeting at the beginning:

```text
Dear ...
Sehr geehrte ...
```

if the dedicated greeting field already exists.

---

## 13. Motivation closing/signature behavior

Closing block must be generated by the template, not by AI.

Correct:

```text
Kind regards,

Daniel Carter
```

Wrong:

```text
Kind regards,

Kind regards
Daniel Carter
```

### Adaptive placement

Closing should be bottom-aware but not absolutely fixed.

Rules:

```text
Short body:
- closing moves lower for balanced layout

Normal body:
- closing appears after body with good spacing

Long body:
- closing follows body without overlap
- if content exceeds safe page area, show warning
```

Implementation concept:

```css
.letter-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.letter-body {
  flex: 0 0 auto;
}

.letter-spacer {
  flex: 1 1 auto;
  min-height: 10mm;
}

.closing-block {
  flex: 0 0 auto;
  margin-top: 8mm;
}
```

This prevents the closing block from floating awkwardly while also preventing overlap.

---

## 14. Motivation overflow handling

Motivation letter should normally stay one page.

If body is too long:

```text
1. Do not shrink body below 10.5pt.
2. Do not hide text.
3. Do not overlap closing.
4. Show a warning:
   "Your text is too long for a one-page motivation letter. Please shorten it or regenerate a shorter version."
```

Optional:

```text
Allow two pages only if client explicitly wants multi-page motivation letters.
Default should remain one-page.
```

---

# PART B — CV Generator Revision

## 15. CV current problems

From the provided CV preview/PDF:

```text
1. Small preview and full preview are not equally trustworthy.
2. Font appears too small in full preview.
3. Many sections are squeezed into one page.
4. The output does not prove robust multi-page handling.
5. If CV content grows, current layout may either overflow, crop, or shrink too much.
6. The blue sidebar style needs a clear continuation strategy for page 2.
7. The preview page container may clip content differently from the final PDF.
```

The current attached CV PDF is a one-page A4 file, but real users will often produce more content than this.

Therefore, the CV system must support true multi-page output.

---

## 16. CV page model

A CV can be:

```text
1 page
2 pages
3 pages if absolutely necessary
```

But recommended UX:

```text
1–2 pages
```

If content exceeds 2 pages, show a warning:

```text
Your CV is getting long. Consider shortening older experience or reducing details.
```

Do not shrink everything to force one page.

---

## 17. CV canonical layout

Each page must be a real A4 page:

```text
CVDocument
├── CVPage 1
│   ├── sidebar
│   └── main content
│
├── CVPage 2
│   ├── continuation sidebar / compact sidebar
│   └── continued main content
│
└── CVPage 3 optional
    ├── continuation sidebar / compact sidebar
    └── continued main content
```

Do not create one long A4-looking container and crop it.

Wrong:

```text
one huge CV container
overflow hidden
screenshot into PDF
```

Correct:

```text
array of A4 page objects
each page has fixed height
content is distributed into pages
```

---

## 18. CV page 1 sidebar

For sidebar styles like the attached blue sidebar CV:

Page 1 sidebar can contain:

```text
photo
name
role
contact
skills
languages
interests
```

If sidebar content is too long, do not shrink aggressively.

Better:

```text
move less important sidebar content to main content
or allow continuation on page 2
```

---

## 19. CV page 2 sidebar strategy

For styles with a colored sidebar, choose one of these two strategies.

### Recommended strategy A — compact continuation sidebar

Page 2 keeps the visual identity but uses a compact sidebar.

```text
Page 2 sidebar
├── small name
├── role
├── contact summary
└── page marker / continuation
```

Pros:

```text
consistent style
professional
does not look broken
```

### Acceptable strategy B — main-content continuation page

Page 2 removes the heavy sidebar and uses a compact top header.

```text
Page 2
├── compact header: name + contact
└── continued sections
```

Pros:

```text
more content space
better for long CVs
```

Important:

```text
Do not leave a huge empty blue sidebar on page 2 if there is no sidebar content.
Do not let page 2 look like a broken continuation.
```

---

## 20. CV pagination algorithm

The CV must paginate by logical blocks.

Atomic blocks:

```text
profile paragraph
each work experience entry
each education entry
each training entry
skill group
language group
interest group
date/signature block
```

Preferred rule:

```text
Do not split a single entry across pages.
```

Use CSS hints:

```css
.cv-entry {
  break-inside: avoid;
  page-break-inside: avoid;
}

.cv-section-title {
  break-after: avoid;
}
```

But do not rely only on CSS. Build explicit pagination logic.

---

## 21. CV pagination algorithm — practical approach

### Step 1 — render measuring DOM

Render all sections in a hidden A4 measurement container using the exact same CSS.

```text
visibility: hidden
position: absolute
width: 210mm
```

### Step 2 — measure blocks

Measure each block:

```js
const height = block.getBoundingClientRect().height;
```

### Step 3 — assign blocks to pages

Pseudo logic:

```js
const pages = [];
let currentPage = createPage();
let remaining = PAGE_CONTENT_HEIGHT;

for (const section of sections) {
  const sectionHeaderHeight = measure(section.header);

  for (const entry of section.entries) {
    const entryHeight = measure(entry);

    if (sectionHeaderHeight + entryHeight > remaining) {
      pages.push(currentPage);
      currentPage = createPage();
      remaining = PAGE_CONTENT_HEIGHT;
      currentPage.add(repeatedSectionHeader(section));
      remaining -= sectionHeaderHeight;
    }

    currentPage.add(entry);
    remaining -= entryHeight;
  }
}

pages.push(currentPage);
```

### Step 4 — repeat section header when a section continues

If Work Experience starts on page 1 and continues to page 2:

```text
Page 2:
WORK EXPERIENCE — continued
```

or simply repeat:

```text
WORK EXPERIENCE
```

### Step 5 — final block only on last page

Date/signature should appear only on the final page, not on every page.

---

## 22. CV long entry handling

Normally:

```text
break-inside: avoid
```

But if one entry is too tall to fit even on an empty page:

```text
allow split inside the description only
keep title/date/company together
continue description on next page
```

Example:

```text
Page 1:
Full-Stack Developer
Company / Date
Description first part...

Page 2:
Full-Stack Developer — continued
Description continuation...
```

This is rare but must not break the PDF.

---

## 23. CV typography targets

Current CV full preview appears too small.

Use readable targets:

```text
Name: 22–30pt depending style
Role: 8–10pt
Section heading: 9–11pt uppercase
Entry title: 9.5–11pt bold
Company/date line: 8.5–9.5pt
Description/body: 8.8–9.8pt minimum
Line-height: 1.35–1.5
Sidebar contact: 8–9pt
Sidebar skills: 7.8–8.8pt minimum
```

Minimums:

```text
Main body/entry description should not go below 8.8pt.
Letter body should not go below 10.5pt.
```

If CV cannot fit:

```text
create page 2
do not shrink until unreadable
```

---

## 24. CV date/signature placement

Current CV has date/signature near the bottom right.

For CV:

```text
Date/signature is optional.
If present, place it only on the final page.
If there is enough space, keep it near the lower part of final page.
If content is long, place it after the last content block with normal spacing.
```

Do not force it to overlap or create awkward empty pages.

---

## 25. CV sidebar overflow handling

Sidebar can overflow if user enters long skills/contact.

Rules:

```text
1. Contact line wraps cleanly.
2. Skills chips can wrap to multiple lines.
3. If sidebar overflows page 1, move lower-priority groups to main content or page 2.
4. Never crop sidebar text silently.
5. Never reduce sidebar font below readable minimum.
```

Priority order in sidebar:

```text
photo
name
role
contact
skills
languages
interests
```

If overflow happens, move `interests` first, then `skills` details.

---

## 26. CV multi-page preview behavior

Small preview should show the actual number of pages.

Options:

```text
Option A:
small preview shows page 1 with page count indicator: "1 / 2"

Option B:
small preview shows stacked mini pages

Option C:
small preview shows page 1 and allows clicking full preview to inspect all pages
```

Full-screen preview must show all pages vertically:

```text
Page 1
Page 2
Page 3 if needed
```

PDF must export all pages.

Do not export only the first page.

---

# PART C — Shared Preview + PDF Export System

## 27. Shared renderer API

Create one API:

```ts
type DocumentType = "motivation" | "cv";

type RenderDocumentOptions = {
  type: DocumentType;
  data: DocumentData;
  styleName: string;
  language: "de" | "en";
  mode: "preview" | "pdf";
  watermark: boolean;
};

renderDocument(options): DocumentRenderResult
```

Result:

```ts
type DocumentRenderResult = {
  pages: HTMLElement[];
  pageCount: number;
  warnings: string[];
  documentHash: string;
};
```

---

## 28. Shared page shell

All pages use the same shell.

```html
<div class="document-page" data-page="1">
  <div class="document-watermark"></div>
  <div class="document-content">
    ...
  </div>
</div>
```

CSS:

```css
.document-page {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  background: white;
}

.document-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.document-content {
  position: relative;
  z-index: 1;
}
```

---

## 29. PDF export

If using jsPDF:

```js
const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
  compress: true
});
```

For each rendered A4 page:

```js
for (const page of pages) {
  // render exact page to canvas or use html renderer
  // add page image at 0,0,210,297
}
```

Rules:

```text
- One document-page = one PDF page.
- Do not crop long content into one page.
- Do not use one tall screenshot split randomly.
- Do not change scale between preview and export.
```

If using Puppeteer/Playwright:

```js
await page.pdf({
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true
});
```

---

## 30. html2canvas/jsPDF warning

If the app uses html2canvas + jsPDF:

```text
The page should be rendered as exact A4 page images.
Do not render a scaled preview container.
Render the canonical document page at high resolution.
```

Use:

```js
html2canvas(documentPage, {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff"
});
```

Then add to PDF:

```js
pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
```

For multiple pages:

```js
pages.forEach((page, index) => {
  if (index > 0) pdf.addPage("a4", "portrait");
  pdf.addImage(pageImage, "PNG", 0, 0, 210, 297);
});
```

---

# PART D — Style System Revision

## 31. Do not duplicate layout per style

Current CSS uses style tokens such as:

```text
--cv-cover-bg
--cv-photo-width
--cv-name-size
--letter-photo-size
--letter-page-mark-bg
```

Keep this approach.

But avoid this:

```text
style A has its own renderer
style B has its own renderer
style C has its own renderer
```

Use:

```text
base CV renderer
base motivation renderer
style CSS variables only
```

Correct:

```text
_base-document.css
_base-cv.css
_base-letter.css
styles/cv/executive-ink.css
styles/letter/swiss-line.css
```

---

## 32. Style-specific page 2 rules

Each CV style must define page 2 behavior.

Add tokens:

```css
:root {
  --cv-page2-sidebar-mode: compact; /* compact | full | none */
  --cv-page2-sidebar-width: 42mm;
  --cv-page2-header-mode: compact;
}
```

For blue/sidebar style:

```text
Page 1:
full sidebar

Page 2:
compact sidebar or compact top header
```

This prevents page 2 from looking broken.

---

# PART E — QA Checklist

## 33. Preview parity QA

For both CV and Motivation:

```text
[ ] Small preview uses same document DOM as full preview.
[ ] Full preview uses same document DOM as PDF export.
[ ] Small preview only scales; it does not reflow.
[ ] Full preview and PDF have same line breaks.
[ ] Watermark does not change layout.
[ ] Paid PDF differs only by removing watermark.
```

---

## 34. Motivation QA

Test with 3 body lengths:

```text
Short: 120–180 words
Normal: 220–320 words
Long: 380–450 words
```

Expected:

```text
[ ] No duplicate greeting.
[ ] No duplicate closing.
[ ] No signature inside AI body.
[ ] Body has 2–3 paragraphs.
[ ] Font remains readable.
[ ] Closing/signature balanced.
[ ] Long text warns if it cannot fit.
```

---

## 35. CV QA

Test with:

```text
Short CV: 1 job, 1 education, 2 skills
Normal CV: 2 jobs, 1 education, 2 training entries
Long CV: 4 jobs, 2 education, 3 training entries, long skills
Very long CV: content must create page 2 or warning
```

Expected:

```text
[ ] Page 1 renders correctly.
[ ] Page 2 is created when needed.
[ ] Page 2 style is professional.
[ ] No content is cropped.
[ ] Entries are not split badly.
[ ] Section headers are repeated if section continues.
[ ] Date/signature appears only on final page.
[ ] PDF exports all pages.
[ ] Preview shows correct page count.
```

---

## 36. Actual PDF QA

Check generated PDF metadata:

```text
Expected page size:
595.28 × 841.89 pt
A4
```

Check all pages:

```text
[ ] Every page is A4.
[ ] No Letter pages.
[ ] No mixed page sizes.
[ ] No cropped bottom.
[ ] No blank extra pages.
```

---

# PART F — Implementation Priority

## 37. Fix order

Implement in this order:

```text
1. Build canonical A4 document-page component.
2. Refactor small preview and full preview to use same document-page.
3. Refactor PDF export to use the same document-page output.
4. Add CV pagination engine.
5. Add CV page 2 continuation layout.
6. Add Motivation closing/signature adaptive layout.
7. Add AI motivation text sanitizer.
8. Adjust typography and spacing for motivation and CV.
9. Add overflow warnings.
10. Add visual QA tests/screenshots.
```

Do not start by manually adjusting margins in the current duplicated previews. That will only hide the bug temporarily.

---

## 38. Acceptance criteria

The revision is complete only when:

```text
[ ] Motivation small preview, full preview, and PDF match exactly.
[ ] CV small preview, full preview, and PDF match exactly.
[ ] Motivation PDF is A4 and professional.
[ ] CV PDF is A4 and supports multiple pages.
[ ] CV page 2 works visually and technically.
[ ] Long CV content creates page 2 instead of shrinking/cropping.
[ ] No duplicate greeting/closing/signature in motivation.
[ ] Watermark overlay does not alter layout.
[ ] Paid PDF equals preview without watermark.
[ ] All style CSS uses shared renderer with tokens, not separate duplicated layout.
```

---

## 39. Summary for Codex

The root issue is **not** just font, margin, or closing position.

The root issue is:

```text
The document preview/PDF system must be unified.
```

Build one A4 rendering engine for both CV and Motivation.

Then:

```text
small preview = scaled same document
full preview = larger scaled same document
PDF = exported same document
```

For CV specifically:

```text
support real multi-page output
do not squeeze everything into one page
do not crop content
do not let page 2 look broken
```

For Motivation specifically:

```text
keep one-page professional letter
sanitize AI body
avoid duplicate closing
use adaptive closing placement
keep typography readable
```
