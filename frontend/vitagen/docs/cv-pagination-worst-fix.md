# URGENT FIX — CV Pagination, A4 Layout, Preview Parity

## Context

The latest Codex change made the document worse.

Codex changed:

```text
CV body text: 12pt
Motivation body text: 12pt
CV pagination made more conservative
Commit: ca39110 fix: use 12pt document body fonts
```

The result is unacceptable for the CV output:

```text
- Page 1 has huge empty whitespace.
- Page 2 starts after an unnecessary early split.
- Page 2 does not feel like a professionally continued CV page.
- The document is technically A4, but the pagination logic is wrong.
- This looks like the renderer simply moved content to page 2 too early.
- This is not how Word/Google Docs/PDF layout should behave.
```

The fix must not be another random margin/font adjustment.

The correct fix is a proper A4 layout + pagination system.

---

## Current broken result

The current generated CV PDF has 2 A4 pages, but the split is bad.

Observed output:

```text
Page 1:
- Sidebar occupies full height.
- Main content only contains Profile + first Work Experience entry.
- Large blank area remains below the first entry.
- This should not happen. There is enough visual space to continue content.

Page 2:
- Remaining Work Experience, Education, Further Training moved to page 2.
- Page 2 starts like a continuation, but the page split is too early.
- Page indicator exists in sidebar, but the layout still feels improvised.
- Footer/date/signature area is not handled as a real reserved page area.
```

This is a pagination bug, not a design improvement.

---

## Immediate correction required

### 1. Revert CV body from 12pt to 11pt

Do not use 12pt as default CV body.

Set CV main body text to:

```text
CV main body / description: 11pt
Line-height: 1.35–1.45
```

Suggested typography scale:

```text
CV name: 22–28pt depending style
Role/title: 8–9.5pt
Section headings: 10–11pt
Entry title: 10.5–11.5pt bold
Company/date line: 9–10pt
Entry description/body: 11pt
Sidebar contact: 8.5–9.5pt
Sidebar skills/chips: 8.5–9.5pt
Footer/page number: 8–9pt
```

Do not globally set every CV text to 12pt.

Do not shrink below 10.5pt in the main content unless absolutely necessary.

---

### 2. Do not force page 2 just because 12pt made content taller

The renderer must not use a crude conservative rule like:

```text
if section might not fit, move whole section to next page too early
```

That creates the huge blank page 1.

Correct behavior:

```text
Use all available safe content area on page 1.
Only move content to page 2 when the next logical block cannot fit in the remaining content area.
```

This is the core bug.

---

## Required Word-like page model

The CV should behave like a real document editor:

```text
A4 page
├── top margin / safe area
├── content area
├── bottom margin / footer safe area
└── footer area / page number / optional date-signature
```

The content should not run to the physical edge of the paper.

The content should also not stop halfway while there is still enough usable area.

---

## Fixed A4 page shell

Every page must be a fixed A4 page:

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
  background: #fff;
  box-sizing: border-box;
}
```

The renderer may use internal page margins:

```css
.cv-page {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
}

.cv-content-area {
  position: absolute;
  top: 16mm;
  bottom: 16mm;
  left: 0;
  right: 0;
}
```

For sidebar CV styles, page structure should be:

```text
A4 Page
├── Sidebar area
│   ├── fixed width
│   ├── full page height or content-area height depending style
│   └── page number/footer if applicable
│
└── Main area
    ├── top safe margin
    ├── flow content
    └── bottom safe margin/footer area
```

---

## Required page areas for CV

Use explicit dimensions.

Example for blue sidebar style:

```text
Page width: 210mm
Page height: 297mm

Sidebar:
- width: 54–58mm
- full height: 297mm
- padding top: 16–20mm
- padding left/right: 6–8mm

Main content:
- left start: sidebar width + 10–14mm
- right margin: 16–18mm
- top margin: 16–20mm
- bottom content limit: 248–258mm
- footer area: last 12–16mm
```

Do not use the full 297mm as content height.

Reserve a real bottom safe area:

```text
bottom safe margin: 14–18mm
footer/page number area: 8–12mm
```

---

## Footer and page number rules

The CV should have a consistent page footer system.

For multi-page CVs:

```text
Page 1:
- optional page number can be hidden or shown
- footer area is still reserved

Page 2+:
- show page indicator, e.g. "Page 2 of 2"
- footer/date/signature only appears on final page
```

Current page 2 sidebar shows:

```text
PAGE 2 OF 2
```

That is okay as an idea, but it must be integrated into a clean footer/continuation system, not just placed randomly in sidebar.

Recommended:

```text
Sidebar page marker:
PAGE 2 OF 2
```

or main footer:

```text
Page 2 of 2
```

But choose one consistent system per style.

---

## Important: Do not leave huge blank space on page 1

This is the worst current bug.

The pagination engine must use remaining space.

Wrong:

```text
Page 1:
Profile
Work Experience Entry 1
HUGE EMPTY SPACE

Page 2:
Work Experience Entry 2
Education
Training
```

Correct:

```text
Page 1:
Profile
Work Experience Entry 1
Work Experience Entry 2 if it fits safely
Possibly Education heading + first education entry if it fits

Page 2:
Only the content that genuinely cannot fit on page 1
```

The renderer must measure block height and fit blocks into the remaining content area.

---

## Proper pagination algorithm

### Step 1 — Define page regions

Each page has:

```ts
type PageRegion = {
  pageHeightMm: 297;
  topMarginMm: number;
  bottomMarginMm: number;
  footerHeightMm: number;
  usableMainHeightPx: number;
};
```

Usable main height:

```text
usableMainHeight = pageHeight - topMargin - bottomMargin - footerHeight
```

Do not calculate content height using the full page height.

---

### Step 2 — Measure actual rendered blocks

Use a hidden measurement container with the exact same CSS as the final document.

```html
<div id="measurement-root" class="document-measurement-root">
  <div class="document-page">
    ...
  </div>
</div>
```

CSS:

```css
.document-measurement-root {
  position: absolute;
  left: -99999px;
  top: 0;
  visibility: hidden;
  width: 210mm;
}
```

Measure blocks:

```js
function measureBlock(block) {
  return block.getBoundingClientRect().height;
}
```

Do not guess heights from character count.

---

### Step 3 — Paginate by logical blocks

Atomic blocks:

```text
profile block
each work experience entry
each education entry
each training entry
skills group
languages group
interests group
date/signature block
```

Preferred rule:

```text
Do not split an entry across pages unless one entry is too tall to fit on an empty page.
```

CSS hints:

```css
.cv-entry {
  break-inside: avoid;
  page-break-inside: avoid;
}

.cv-section-title {
  break-after: avoid;
}
```

But do not rely only on CSS.

The JS pagination must decide which blocks go to which page.

---

### Step 4 — Fit blocks until remaining space is genuinely insufficient

Pseudo logic:

```js
const pages = [];
let page = createPage(1);
let remaining = page.usableMainHeightPx;

for (const section of sections) {
  const sectionHeader = renderSectionHeader(section);
  const headerHeight = measure(sectionHeader);

  for (const entry of section.entries) {
    const entryHeight = measure(entry);
    const requiredHeight = needsHeaderOnThisPage(section, page)
      ? headerHeight + entryHeight
      : entryHeight;

    if (requiredHeight <= remaining) {
      if (needsHeaderOnThisPage(section, page)) {
        page.add(sectionHeader);
        remaining -= headerHeight;
      }

      page.add(entry);
      remaining -= entryHeight;
    } else {
      pages.push(page);
      page = createPage(pages.length + 1);
      remaining = page.usableMainHeightPx;

      page.add(renderSectionHeader(section, { continued: true }));
      remaining -= headerHeight;

      page.add(entry);
      remaining -= entryHeight;
    }
  }
}

pages.push(page);
```

Important:

```text
Do not move an entire section to page 2 if at least one entry from that section can fit on page 1.
```

For example, Work Experience entry 2 should stay on page 1 if it fits.

---

## Minimum remaining space rule

Avoid ugly orphans.

If the next entry leaves extremely tiny space, that is okay if the entry fits and looks professional.

But do not start a new section title alone at the bottom.

Rules:

```text
1. Never put a section heading alone at bottom of page.
2. Section heading + at least first entry must fit together.
3. If heading fits but first entry does not, move both to next page.
4. If an entry fits with safe bottom margin, keep it on current page.
```

Suggested threshold:

```text
minimum remaining bottom space after adding block: 8–12mm
```

But this threshold must not be so large that page 1 becomes half empty.

---

## Fix page 2 continuation layout

Page 2 must look intentionally designed.

For sidebar styles:

### Option A — compact continuation sidebar

Use this for blue/sidebar CV style.

Page 1 sidebar:

```text
photo
name
role
contact
skills
interests
```

Page 2 sidebar:

```text
name
role
contact summary
PAGE 2 OF N
```

Keep the blue background full height if that is part of the style, but align content cleanly.

Do not show duplicate large photo on page 2 unless the style explicitly needs it.

### Option B — compact top header

For styles where sidebar wastes too much space:

```text
Page 2:
compact top header with name/contact
full-width main content
footer page marker
```

But do not mix page 1/sidebar and page 2/full-width randomly unless the style defines it.

---

## Footer/date/signature handling for CV

Date/signature should be on final page only.

Rules:

```text
If one-page CV:
- date/signature may appear near bottom if there is enough space
- otherwise after content with normal spacing

If multi-page CV:
- date/signature appears only on the final page
- it should be in the footer or after the final content block
- it should not force an unnecessary new page by itself unless there is no safe space
```

The renderer must reserve footer area on every page.

---

## Preview parity requirement

Small preview, full preview, and final PDF must use the same page list.

Correct:

```text
const renderResult = renderCVDocument(data, style);

smallPreview.render(renderResult.pages, { scale: small });
fullPreview.render(renderResult.pages, { scale: large });
pdfExport.export(renderResult.pages);
```

Wrong:

```text
small preview uses one renderer
full preview uses another renderer
PDF uses another conversion path
```

If the full preview shows page 2, the small preview should indicate this clearly:

```text
Page 1 of 2
```

or show stacked mini pages.

---

## Do not crop content

Never use:

```css
overflow: hidden;
```

on a container that contains unpaginated document content.

`overflow: hidden` is allowed only on the fixed A4 page itself after content has been paginated.

Bad:

```text
one long document
overflow hidden
converted to image/PDF
```

Good:

```text
content split into real page objects
each page is overflow hidden only after pagination
```

---

## Set font rules correctly

Please change the latest 12pt change.

Use:

```css
:root {
  --cv-body-size: 11pt;
  --cv-body-line-height: 1.38;
}
```

But do not blindly set every element to 11pt.

Suggested CSS:

```css
.cv-entry-desc,
.cv-profile-text {
  font-size: 11pt;
  line-height: 1.38;
}

.cv-entry-title {
  font-size: 11pt;
  line-height: 1.25;
  font-weight: 700;
}

.cv-entry-meta {
  font-size: 9.2pt;
  line-height: 1.25;
}

.cv-section-title {
  font-size: 10.5pt;
  letter-spacing: 0.08em;
}

.cv-sidebar {
  font-size: 8.8pt;
  line-height: 1.35;
}

.cv-footer,
.cv-page-number {
  font-size: 8pt;
}
```

---

## Do not destroy style design

The current blue sidebar style is visually good when rendered properly.

Do not redesign the style.

Fix only:

```text
pagination
font sizing
safe margins
page continuation
footer/page number handling
preview/PDF parity
```

Do not change:

```text
overall color palette
sidebar concept
photo style
section identity
document style family
```

---

## Required acceptance criteria

The fix is complete only if all of these pass.

### A. Page 1 usage

```text
[ ] Page 1 does not stop after only one work experience entry if more content can safely fit.
[ ] Page 1 has no massive blank empty area caused by premature pagination.
[ ] Content uses the available safe content area until the next block genuinely cannot fit.
```

### B. Page 2 design

```text
[ ] Page 2 looks intentionally designed.
[ ] Page 2 has clear page marker or footer.
[ ] Page 2 uses the same style system as page 1.
[ ] Page 2 does not look like a broken leftover page.
```

### C. Typography

```text
[ ] CV main body uses 11pt, not 12pt.
[ ] Metadata/sidebar text can be smaller but remains readable.
[ ] No text is unreadably tiny.
[ ] No global 12pt applied to all CV text.
```

### D. Pagination

```text
[ ] Blocks are measured and assigned to pages based on real height.
[ ] Section title is not orphaned at bottom.
[ ] Entries are not split unless unavoidable.
[ ] Date/signature is on final page only.
[ ] Long CV creates real page 2, not cropped content.
```

### E. Preview parity

```text
[ ] Small preview and full preview use the same rendered page objects.
[ ] Small preview only scales; it does not reflow.
[ ] Full preview matches PDF exactly.
[ ] PDF export exports all pages.
```

### F. PDF page size

```text
[ ] Every PDF page is A4.
[ ] Expected PDF size: about 595.28 × 841.89 pt.
[ ] No Letter page.
[ ] No mixed page sizes.
```

---

## Regression tests required

Add or update tests for:

```text
1. short CV - should stay 1 page
2. normal CV - should stay 1 page if it fits
3. medium CV - should use page 1 fully before creating page 2
4. long CV - should create page 2 cleanly
5. very long CV - should create page 2/3 or show warning
6. preview page count equals PDF page count
7. no huge blank page 1 with remaining content pushed too early
```

Add a specific fixture based on the current broken sample:

```text
Profile
2 work experience entries
1 education entry
2 further training entries
skills
interests
```

Expected:

```text
- The renderer must not split after only the first work experience entry unless entry 2 genuinely cannot fit.
- If it creates page 2, the split must be visually justified and not leave huge blank space.
```

---

## Specific instruction

Do not respond with:

```text
"Changed font to 11pt and made pagination conservative"
```

That is not enough.

The problem is not only font size.

The problem is:

```text
The pagination engine is too crude and creates an ugly page split.
```

Implement a proper smart pagination system with:

```text
fixed A4 page shell
usable content area
measured blocks
safe footer area
non-orphan section headers
page 2 continuation style
shared preview/PDF renderer
```

---

## Final target

The final CV behavior should feel like Word/Google Docs:

```text
- content flows within margins
- footer/safe area exists
- page break happens only when needed
- page 2 looks intentional
- no content is cropped
- no huge blank area appears because the algorithm panicked
- preview and PDF are identical
```
