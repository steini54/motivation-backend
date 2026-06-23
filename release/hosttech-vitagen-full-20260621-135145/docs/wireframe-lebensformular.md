# VitaGen CV Generator — Wireframe Specification

## 1. Purpose

This document defines the dedicated wireframe for the **VitaGen CV Generator** page.

The CV Generator uses the same visual system as the Motivation Letter Builder:

```text
modern minimal
professional
neutral Swiss/European feel
same font system
same color system
same right-side live preview
same DE / EN language switch
same clean PDF unlock flow
```

The main difference is the UX structure: the CV Generator contains many more form sections than the Motivation Letter page, so the layout must make long-form editing feel organized, scannable, and not overwhelming.

---

## 2. Core Page Goal

The page should help users create a professional European-style CV with a guided structure.

The user should feel:

```text
I know what to fill in
I can move between sections easily
I can see the CV result immediately
I can optionally generate a professional photo
I can add/remove repeated entries
I can preview and unlock the clean PDF
```

The page should not feel like:

```text
a long endless form
a random collection of inputs
a plain old CV template
a confusing multi-page wizard
```

---

## 3. Main UX Difference vs Motivation Page

The Motivation Letter page is mostly:

```text
short form + AI photo + AI text + preview
```

The CV Generator is:

```text
long structured form + optional AI photo + repeated sections + preview
```

Therefore, the CV page needs:

- left section navigator
- grouped form cards
- repeated entry cards
- add/remove entry behavior
- sticky preview
- CV quality helper
- clean section hierarchy

---

## 4. Desktop Wireframe

### 4.1 Overall Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Topbar                                                                       │
│ [VitaGen Logo] VitaGen                      [DE] [EN] [Speichern] [Vorschau] │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Hero                                                                         │
│ Lebenslauf erstellen                                                         │
│ Ein moderner, strukturierter Editor für professionelle Lebensläufe...         │
│ [Mehrere Abschnitte sauber geführt] [Vorschau rechts] [Europäischer CV]       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│ LEFT SECTION NAV     │ CENTER BUILDER FORM                  │ RIGHT LIVE PREVIEW       │
│ Sticky               │ Scrollable content                   │ Sticky                   │
│                      │                                      │                          │
│ Abschnitte           │ ┌ Personal Details Card ┐            │ ┌ Live Preview Card ┐     │
│ - Persönliche        │ │ Name, role, contact    │            │ │ Mini A4 CV Preview │     │
│ - KI-Foto            │ │ profile, photo note    │            │ │ Watermark          │     │
│ - Berufserfahrung    │ └───────────────────────┘            │ └───────────────────┘     │
│ - Schulbildung       │                                      │                          │
│ - Weiterbildung      │ ┌ AI Photo Card ┐                    │ ┌ Style Selector ┐        │
│ - Kenntnisse         │ │ Generate image │                    │ │ Swiss/Executive │        │
│ - Abschluss          │ │ 3 photo options│                    │ └────────────────┘        │
│                      │ └───────────────┘                    │                          │
│                      │                                      │ ┌ CV Quality Card ┐       │
│                      │ ┌ Work Experience Card ┐             │ │ Best-practice tips │     │
│                      │ │ Entry 1              │             │ └─────────────────┘       │
│                      │ │ + Add entry          │             │                          │
│                      │ └──────────────────────┘             │ ┌ PDF Unlock Card ┐       │
│                      │                                      │ │ Prepare clean PDF │      │
│                      │ ┌ Education Card ┐                   │ └─────────────────┘       │
│                      │ │ Entry 1        │                   │                          │
│                      │ │ + Add entry    │                   │                          │
│                      │ └────────────────┘                   │                          │
│                      │                                      │                          │
│                      │ ┌ Training Card ┐                    │                          │
│                      │ ┌ Skills Card ┐                      │                          │
│                      │ ┌ Final Details Card ┐               │                          │
└──────────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

### 4.2 Desktop Grid Ratio

```text
Page max width: 1500px
Outer padding: 28px
Main grid columns:
- Left nav: 240px
- Center builder: flexible / minmax(0, 1fr)
- Right preview: 430px
Gap: 20px
```

CSS concept:

```css
.workspace {
  max-width: 1500px;
  margin: 0 auto;
  padding: 18px 28px 58px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 430px;
  gap: 20px;
  align-items: start;
}
```

---

## 5. Topbar Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo] VitaGen                                                              │
│ Bewerbungsunterlagen erstellen                         [DE] [EN] [Save] [Preview] │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Behavior

- Topbar is sticky.
- Language switch changes all global page text.
- Save button triggers local save feedback.
- Preview button opens full preview modal.

### Notes

Do not add workflow nav pills here. The CV page already has a left section navigator.

---

## 6. Hero Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Lebenslauf erstellen                                                         │
│ Ein moderner, strukturierter Editor für professionelle Lebensläufe.           │
│ Lange Inhalte werden in klare Abschnitte aufgeteilt...                       │
│                                                                              │
│ [Mehrere Abschnitte sauber geführt] [Vorschau rechts] [Europäischer CV-Aufbau]│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Purpose

The hero explains that this is not just a blank form. It is a structured CV builder.

### German Copy

```text
Lebenslauf erstellen

Ein moderner, strukturierter Editor für professionelle Lebensläufe. Lange Inhalte werden in klare Abschnitte aufgeteilt, während die Vorschau rechts automatisch aktualisiert wird.
```

### English Copy

```text
Create a CV

A modern, structured editor for professional CVs. Long content is split into clear sections while the preview on the right updates automatically.
```

---

## 7. Left Section Navigator Wireframe

```text
┌─────────────────────┐
│ Abschnitte          │
│                     │
│ Persönliche Angaben │
│ KI-Foto             │
│ Berufserfahrung     │
│ Schulbildung        │
│ Weiterbildung       │
│ Kenntnisse          │
│ Abschluss           │
└─────────────────────┘
```

### Purpose

The CV Generator has many sections. The left navigator prevents the page from feeling like an endless form.

### Behavior

- Sticky on desktop.
- Hidden on tablet/mobile.
- Clicking an item scrolls to the relevant card.
- Active section receives subtle background.

### Section Order

Recommended final order:

```text
1. Persönliche Angaben
2. KI-Foto
3. Beruflicher Werdegang
4. Schulbildung
5. Aus- und Weiterbildung
6. Kenntnisse & Fähigkeiten
7. Datum & Unterschrift
```

---

## 8. Center Builder Wireframe

The center builder is the main editing area.

Each section is a card with:

```text
icon/number
title
short explanation
fields or entries
optional helper text
```

---

# 8.1 Personal Details Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 01  Persönliche Angaben                         Normale Eingabe│
│     Name, Kontakt, Rolle und optionales Foto...               │
├──────────────────────────────────────────────────────────────┤
│ ┌ Foto optional ┐   ┌ Name                       ┐            │
│ │ photo preview │   └────────────────────────────┘            │
│ │ note text     │   ┌ Gewünschte Position         ┐            │
│ └───────────────┘   └────────────────────────────┘            │
│                   ┌ Kontakt                      ┐            │
│                   └──────────────────────────────┘            │
│                   ┌ Kurzprofil                   ┐            │
│                   │ textarea                     │            │
│                   └──────────────────────────────┘            │
│                   Helper: 1–3 sentences are enough            │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Name
Gewünschte Position / Berufstitel
Kontakt
Kurzprofil
Foto optional
```

## UX Notes

- The old `Deckblatt` concept should not dominate the UX.
- The CV should not force users into a separate cover-page mental model.
- Treat this as a professional CV header / personal details section.
- Photo remains optional.
- Short profile is recommended because it improves CV clarity.

---

# 8.2 AI Photo Card

This card must match the AI photo design language from the Motivation Letter page.

## Wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AI  Bewerbungsfoto vorbereiten                      KI-Fotoassistent │
│     KI-Funktion: Aus einem normalen Foto wird eine professionelle... │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌──────────────────────────────────────┐ │
│ │ Foto hochladen   0/3  │  │ Generierte Foto-Optionen             │ │
│ │                       │  │ Wählen Sie eine Variante aus...      │ │
│ │ [photo preview]       │  │                                      │ │
│ │                       │  │ Empty state before generation        │ │
│ │ helper text           │  │                                      │ │
│ │                       │  │ OR skeleton loading                  │ │
│ │ [KI Foto generieren]  │  │                                      │ │
│ └───────────────────────┘  │ OR 3 generated options               │ │
│                            │ ┌ Option A ┐ ┌ Option B ┐ ┌ Option C ┐│ │
│                            │ │ photo    │ │ photo    │ │ photo    ││ │
│                            │ │ Use btn  │ │ Use btn  │ │ Use btn  ││ │
│                            │ └──────────┘ └──────────┘ └──────────┘│ │
│                            └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## States

### Empty State

```text
Nach dem Klick auf „KI Foto generieren“ erscheinen hier bis zu drei professionelle Foto-Optionen.
```

### Loading State

```text
Skeleton card
Skeleton image
Skeleton line
Skeleton line
```

### Generated State

```text
Option A — Klassisch, neutraler Hintergrund
Option B — Etwas moderner, weicher Studiolook
Option C — Freundlich, heller Business-Look
```

### Selection State

When user selects one:

```text
- selected card gets highlighted border
- preview photo updates immediately
- toast confirms action
```

## Visual Rules

Use the same AI treatment as Motivation page:

```text
purple/blue gradient icon
gradient CTA button
soft purple border
AI assistant badge
subtle glow shadow
skeleton shimmer animation
```

Do not use AI gradient for normal CV input cards.

---

# 8.3 Work Experience Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 02  Beruflicher Werdegang                     Wichtig für CV │
│     Für erfahrene Bewerber sollte dieser Abschnitt...        │
├──────────────────────────────────────────────────────────────┤
│ ┌ Entry Card #1 ───────────────────────────────────────────┐ │
│ │ Beruflicher Werdegang                         [Remove]   │ │
│ │ ┌ Position             ┐ ┌ Unternehmen / Ort ┐           │ │
│ │ └──────────────────────┘ └───────────────────┘           │ │
│ │ ┌ Von                  ┐ ┌ Bis               ┐           │ │
│ │ └──────────────────────┘ └───────────────────┘           │ │
│ │ ┌ Tätigkeit / Aufgaben                         ┐          │ │
│ │ │ textarea                                     │          │ │
│ │ └──────────────────────────────────────────────┘          │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Weiteren Eintrag hinzufügen]                              │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Position
Unternehmen / Ort
Von
Bis
Tätigkeit / Aufgaben
```

## CV Best Practice

For users with work experience, this section should appear before education.

Entry order should be reverse chronological:

```text
Newest first
Older entries below
```

## UX Notes

- Do not ask for too many tiny fields.
- Avoid separate `Ort/Land optional` unless needed.
- Combine company and location into one field: `Unternehmen / Ort`.
- Keep `Tätigkeit/Aufgaben` optional but available.
- Use repeated entry cards.

---

# 8.4 Education Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 03  Schulbildung                                             │
│     Schule, Ort, Zeitraum und Abschluss...                   │
├──────────────────────────────────────────────────────────────┤
│ ┌ Entry Card #1 ───────────────────────────────────────────┐ │
│ │ Schulbildung                                  [Remove]   │ │
│ │ ┌ Schule              ┐ ┌ Ort / Land          ┐          │ │
│ │ └─────────────────────┘ └─────────────────────┘          │ │
│ │ ┌ Von                 ┐ ┌ Bis                 ┐          │ │
│ │ └─────────────────────┘ └─────────────────────┘          │ │
│ │ ┌ Abschluss                                      ┐        │ │
│ │ └────────────────────────────────────────────────┘        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Weiteren Eintrag hinzufügen]                              │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Schule
Ort / Land
Von
Bis
Abschluss
```

## UX Notes

- Keep this after work experience for experienced applicants.
- For students or young users, production can optionally reorder education above experience.
- Keep content concise.

---

# 8.5 Training & Continuing Education Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 04  Aus- und Weiterbildung                                   │
│     Kurse, Zertifikate und Weiterbildungen...                │
├──────────────────────────────────────────────────────────────┤
│ ┌ Entry Card #1 ───────────────────────────────────────────┐ │
│ │ Weiterbildung                                 [Remove]   │ │
│ │ ┌ Titel               ┐ ┌ Ausbildungsstätte / Ort ┐      │ │
│ │ └─────────────────────┘ └─────────────────────────┘      │ │
│ │ ┌ Von                 ┐ ┌ Bis                    ┐       │ │
│ │ └─────────────────────┘ └────────────────────────┘       │ │
│ │ ┌ Inhalte                                        ┐        │ │
│ │ └────────────────────────────────────────────────┘        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Weiteren Eintrag hinzufügen]                              │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Titel
Ausbildungsstätte / Ort
Von
Bis
Inhalte
```

## UX Notes

- This section should not be mandatory.
- If empty, the preview should hide the section.
- Keep only relevant training/certificates.

---

# 8.6 Skills Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 05  Kenntnisse & Fähigkeiten                                 │
│     Fachkenntnisse, Software, Sprachen und relevante Stärken │
├──────────────────────────────────────────────────────────────┤
│ ┌ Kenntnisse & Fähigkeiten ┐ ┌ Sprachen                    ┐ │
│ └──────────────────────────┘ └─────────────────────────────┘ │
│ ┌ Hobbies / Interessen                                      ┐ │
│ └───────────────────────────────────────────────────────────┘ │
│ Helper: Nur relevante oder neutrale Interessen verwenden.     │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Kenntnisse & Fähigkeiten
Sprachen
Hobbies / Interessen
```

## UX Notes

- Skills can be a simple comma-separated input for the first implementation.
- Later, it can become chip-based.
- Languages should ideally include levels:
  - Deutsch C1
  - Englisch B2
  - Französisch A2

## Best Practice

Hobbies are optional. Avoid overly private details.

Good:

```text
Lesen
Wandern
Freiwilligenarbeit
Sport
```

Avoid:

```text
political activism
medical details
religious identity
overly private lifestyle info
```

---

# 8.7 Final Details Card

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 06  Datum & Unterschrift                                     │
│     Optional, aber bei klassischen Bewerbungsunterlagen...   │
├──────────────────────────────────────────────────────────────┤
│ ┌ Datum                 ┐ ┌ Unterschrift                    ┐ │
│ └───────────────────────┘ └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Fields

```text
Datum
Unterschrift
```

## UX Notes

- Optional.
- Should not block preview or download.
- If empty, hide or simplify final line in preview.

---

## 9. Right Live Preview Wireframe

```text
┌──────────────────────────────┐
│ Live-Vorschau          Aktiv │
│ Aktualisiert sich automatisch│
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ A4 CV Preview            │ │
│ │                          │ │
│ │ Sidebar                  │ │
│ │ - Photo                  │ │
│ │ - Name                   │ │
│ │ - Contact                │ │
│ │ - Skills                 │ │
│ │ - Languages              │ │
│ │ - Interests              │ │
│ │                          │ │
│ │ Main Content             │ │
│ │ - Name + role            │ │
│ │ - Profile                │ │
│ │ - Work experience        │ │
│ │ - Education              │ │
│ │ - Training               │ │
│ │ - Date/signature         │ │
│ └──────────────────────────┘ │
│ [Speichern] [Vollbild]       │
└──────────────────────────────┘
```

### Behavior

The preview updates when:

```text
user types
user adds/removes entries
user switches language
user chooses generated photo
user changes style
```

### Watermark

Free preview shows:

```text
VORSCHAU
```

English:

```text
PREVIEW
```

---

## 10. CV Preview Structure

The current preview uses a two-column CV layout.

```text
┌──────────────────────────────────────────────┐
│ Sidebar              │ Main Content          │
│                      │                       │
│ Photo                │ Name                  │
│ Name                 │ Role                  │
│ Contact              │                       │
│                      │ Profile               │
│ Kenntnisse           │ Berufserfahrung       │
│ Sprachen             │ Schulbildung          │
│ Interessen           │ Weiterbildung         │
│                      │ Datum & Unterschrift  │
└──────────────────────────────────────────────┘
```

### Sidebar Content

```text
Photo
Name
Contact
Skills
Languages
Interests
```

### Main Content

```text
Name
Target role
Profile
Work experience
Education
Training
Date & signature
```

---

## 11. Style Selector Wireframe

```text
┌──────────────────────────────┐
│ Stil direkt testen           │
│ ┌ Swiss ┐ ┌ Executive ┐      │
│ └───────┘ └───────────┘      │
│ ┌ Midnight ┐ ┌ Terracotta ┐  │
│ └──────────┘ └────────────┘  │
│ Helper text                  │
└──────────────────────────────┘
```

### Behavior

Clicking style changes:

```text
document primary color
accent color
section divider color
preview appearance
```

### Current Styles

```text
Swiss Line
Executive
Midnight
Terracotta
```

Production can extend this to all available CV styles.

---

## 12. CV Quality Card Wireframe

```text
┌──────────────────────────────┐
│ CV-Qualität                  │
│ ✓ Berufserfahrung vor Schule │
│ ✓ Kurze, scannbare Einträge  │
│ ✓ Foto/Hobbies optional      │
└──────────────────────────────┘
```

### Purpose

This card guides users without being intrusive.

It acts like a lightweight best-practice helper.

---

## 13. Download / Unlock Card Wireframe

```text
┌──────────────────────────────┐
│ PDF ohne Wasserzeichen       │
│ Der Nutzer prüft zuerst...   │
│                              │
│ [PDF ohne Wasserzeichen      │
│  vorbereiten]                │
└──────────────────────────────┘
```

### Rule

Do not show price here.

Price only appears in the unlock modal.

---

## 14. Full Preview Modal Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ Vollbild-Vorschau                                      [X]   │
├──────────────────────────────────────┬───────────────────────┤
│ Large A4 CV Preview                  │ Free Preview Panel    │
│                                      │                       │
│ Watermark visible                    │ Kostenlose Vorschau   │
│                                      │ Benefits              │
│                                      │ [Download clean PDF]  │
│                                      │ [Back to edit]        │
└──────────────────────────────────────┴───────────────────────┘
```

### Behavior

- Opens from right preview card.
- Shows larger CV preview.
- Still has watermark.
- Allows user to proceed to unlock modal.

---

## 15. Unlock Modal Wireframe

```text
┌────────────────────────────────────┐
│ PDF ohne Wasserzeichen        [X]  │
├────────────────────────────────────┤
│ Finale PDF freischalten            │
│ Ihre Vorschau ist kostenlos...     │
│                                    │
│ 9.90 CHF · einmalig                │
│                                    │
│ ✓ PDF ohne Wasserzeichen           │
│ ✓ Sofortiger Download              │
│ ✓ Sichere Zahlung über Stripe      │
│ ✓ Keine Kartendaten gespeichert    │
│                                    │
│ [Weiter zur sicheren Zahlung]      │
└────────────────────────────────────┘
```

### Behavior

- Opens after user requests clean PDF.
- Shows price clearly before Stripe.
- CTA redirects to Stripe in production.

---

## 16. Mobile Wireframe

On mobile, remove the three-column structure.

```text
┌─────────────────────────────────────┐
│ Topbar                              │
│ [Logo] VitaGen        [DE] [EN]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Hero                                │
│ Lebenslauf erstellen                │
│ subtitle                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Persönliche Angaben                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ KI-Fotoassistent                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Beruflicher Werdegang               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Schulbildung                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Aus- und Weiterbildung              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Kenntnisse & Fähigkeiten            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Datum & Unterschrift                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Preview / Style / Download          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Fixed bottom bar                    │
│ [Vorschau] [PDF vorbereiten]        │
└─────────────────────────────────────┘
```

### Mobile Rules

- Hide left section navigator.
- Right preview moves below form.
- Add sticky bottom bar.
- Keep form cards full width.
- AI photo generated options stack vertically.
- Preview modal remains full width.

---

## 17. Tablet Behavior

For tablet widths:

```text
≤ 1280px:
- Hide left section navigator
- Keep center + right preview two columns

≤ 1080px:
- Switch to single column
- Preview moves below forms
```

---

## 18. Responsive Breakpoints

```css
@media (max-width: 1280px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr) 430px;
  }

  .section-nav {
    display: none;
  }
}

@media (max-width: 1080px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: static;
  }
}

@media (max-width: 780px) {
  .bottom-bar {
    display: grid;
    position: fixed;
    bottom: 0;
  }
}
```

---

## 19. Interaction Summary

### Typing

```text
Input changes → preview updates immediately → subtle preview pulse
```

### Add Entry

```text
Click add → new entry card appears → preview updates → toast appears
```

### Remove Entry

```text
Click remove → entry removed → preview updates → toast appears
```

### Generate AI Photo

```text
Click KI Foto generieren
→ loading skeleton appears
→ 3 options appear
→ user selects option
→ preview photo updates
```

### Change Style

```text
Click style thumbnail
→ preview color/style updates
→ active style highlighted
→ toast appears
```

### Open Preview

```text
Click preview
→ modal opens
→ large CV preview visible
```

### Unlock PDF

```text
Click prepare PDF
→ unlock modal opens
→ user sees price and Stripe CTA
```

---

## 20. German / English Text Scope

The CV page must support global DE/EN switching.

Language switch must update:

```text
topbar
hero
section navigator
card titles
card descriptions
field labels
helper text
entry cards
buttons
preview labels
quality card
download card
preview modal
unlock modal
toast messages
```

---

## 21. CV-Specific Best Practice Adjustments

Compared to the old form, this wireframe changes the structure:

### Removed / Reframed

```text
Deckblatt
```

Instead of a separate “cover page” mindset, use:

```text
Persönliche Angaben
```

Reason:

```text
A CV generator should guide users into a clean CV structure, not make them think they are creating a separate cover page.
```

### Reordered Sections

Old:

```text
Deckblatt
Schulbildung
Beruflicher Werdegang
Aus- und Weiterbildung
Kenntnisse
Hobbies
Datum
Unterschrift
```

Recommended:

```text
Persönliche Angaben
KI-Foto
Beruflicher Werdegang
Schulbildung
Aus- und Weiterbildung
Kenntnisse & Fähigkeiten
Datum & Unterschrift
```

Reason:

```text
For most applicants with work experience, work experience is more important than school.
```

### Combined Fields

Old:

```text
Unternehmen / Ort (Land)
Ort/Land optional if company name too long
```

Recommended:

```text
Unternehmen / Ort
```

Reason:

```text
Reduces form complexity and avoids confusing duplicate location fields.
```

### Optional Sections

These should not block completion:

```text
Photo
Training
Hobbies
Signature
```

---

## 22. Final Wireframe Summary

The CV Generator page should be a structured, professional CV editor:

```text
Left = section navigation
Center = guided CV form cards
Right = live CV preview + style + quality + unlock
```

The page should solve the main CV UX problem:

```text
many fields without overwhelming the user
```

The AI photo section should match the Motivation page design exactly in feeling:

```text
gradient AI card
AI assistant badge
generate button
loading skeleton
3 generated options
select-to-preview behavior
```

The result should feel like a premium, European-standard CV builder, not a long outdated form.
