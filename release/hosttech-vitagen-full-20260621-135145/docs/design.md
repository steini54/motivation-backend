# VitaGen Motivation Letter Builder — Design System & UI/UX Specification

## 1. Purpose

This document defines the complete UI/UX direction and design system for the redesigned **VitaGen Motivation Letter Builder** page.

The goal is to replace the current old, plain, long-scroll form with a modern, minimal, professional document-builder experience.

The redesigned page should feel:

```text
modern
minimal
professional
trustworthy
clean
premium
easy to use
not obviously “AI-looking”
```

AI features should be visually highlighted, but the overall product must not look like a flashy AI toy. The design should feel like a serious Swiss/German/European application document tool with smart assistance built in.

---

## 2. Page Scope

This design specification is for the **Motivationsschreiben Generator page**.

### Included

- Motivation letter form
- AI photo generation section
- AI motivation text generation section
- Live preview panel
- Style selector
- Full preview modal
- Watermarked preview
- Unlock/download flow
- German / English UI language switch
- Loading states and micro-interactions
- Responsive layout

### Not Included

- Full redesign of the entire syntext.ch website
- Admin dashboard
- User account system
- User database/history
- Subscription management
- AI CV assistant/scoring
- Legal/tax invoice system

---

## 3. Product Experience Goal

The user should feel this flow:

```text
I enter my data
→ I can improve my photo
→ I can generate a professional motivation text
→ I immediately see the result
→ I can try a style
→ I preview the document
→ I understand the clean PDF is paid
→ I pay securely
→ I download the final PDF without watermark
```

The page should not feel like:

```text
a boring form
a generic AI generator
a confusing checkout
a cheap template website
```

---

## 4. UX Principles

### 4.1 Live Preview First

The preview should be visible on the right side on desktop.

User input should immediately update the document preview:

- Name
- Role
- Employer
- Greeting
- Motivation text
- Closing
- Selected style
- Selected photo

### 4.2 AI Features Should Be Highlighted

The AI photo and AI text areas are the main value of the product.

They should be visually different from normal form sections using:

- subtle gradient borders
- AI gradient CTA buttons
- soft glow shadow
- badges such as `KI-Fotoassistent` and `KI-Textassistent`
- skeleton loading states
- success toast after generation

But they should not use:

- excessive neon
- cartoon icons
- large “robot” visuals
- overly futuristic graphics

### 4.3 Normal Inputs Should Stay Neutral

Standard form fields should look clean and neutral.

This contrast helps users understand:

```text
Neutral card = normal form input
Gradient card = AI-assisted feature
```

### 4.4 Payment Should Appear After Value

Do not show the price too early.

Recommended conversion flow:

```text
User edits document
→ User sees free watermarked preview
→ User clicks “PDF ohne Wasserzeichen vorbereiten”
→ Unlock modal explains value and price
→ User continues to Stripe
```

This avoids surprising the user too early, while still being transparent before checkout.

### 4.5 Bilingual UI

All visible UI text must support:

- German
- English

The language switch should affect:

- navigation/header
- labels
- buttons
- helper text
- AI states
- preview copy
- modal text
- payment text
- toast notifications
- loading states

---

## 5. Desktop Wireframe

### 5.1 Main Page Layout

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Topbar                                                                     │
│ [VitaGen logo] VitaGen                         [DE/EN] [Save] [Preview]    │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Hero                                                                       │
│ Motivationsschreiben erstellen                                             │
│ Ein moderner, ruhiger Editor für Bewerbungsunterlagen...                   │
│ [Vorschau rechts] [Lokal gespeichert] [Kostenlose Vorschau mit Wasserz.]   │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┬─────────────────────────────┐
│ LEFT: Builder Form                           │ RIGHT: Sticky Live Preview  │
│                                              │                             │
│ ┌ Normal Form Card ┐                         │ ┌ Live Preview Card ┐       │
│ │ Angaben zur Bewerbung                      │ │ A4 mini preview    │       │
│ │ Name, email, address, role, employer       │ │ Updates live       │       │
│ └──────────────────┘                         │ └───────────────────┘       │
│                                              │                             │
│ ┌ AI Photo Card ┐                            │ ┌ Style Selector ┐          │
│ │ Upload photo                               │ │ Swiss / Executive / etc   │
│ │ Generate photo options                     │ └─────────────────┘          │
│ │ Skeleton loading                           │                             │
│ └───────────────┘                            │ ┌ Download CTA Card ┐        │
│                                              │ │ Prepare clean PDF │        │
│ ┌ AI Text Card ┐                             │ └───────────────────┘        │
│ │ Keywords                                    │                             │
│ │ Tone chips                                  │                             │
│ │ Generate text                               │                             │
│ │ Editable generated result                   │                             │
│ └──────────────┘                              │                             │
│                                              │                             │
│ ┌ Letter Details Card ┐                      │                             │
│ │ Greeting + closing                         │                             │
│ └─────────────────────┘                      │                             │
└──────────────────────────────────────────────┴─────────────────────────────┘
```

### 5.2 Layout Ratio

Desktop:

```text
Content max width: 1500px
Outer page padding: 28px
Left builder width: flexible
Right preview width: 430px
Gap: 24px
Right preview position: sticky
Sticky offset: 91px
```

CSS concept:

```css
.workspace {
  max-width: 1500px;
  margin: 0 auto;
  padding: 18px 28px 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 24px;
  align-items: start;
}

.side-panel {
  position: sticky;
  top: 91px;
}
```

---

## 6. Mobile Wireframe

Mobile should not use two columns.

```text
┌─────────────────────────────────────┐
│ Topbar                              │
│ [Logo] VitaGen        [DE/EN]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Hero                                │
│ Motivationsschreiben erstellen      │
│ Subtitle                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Angaben zur Bewerbung               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ KI-Fotoassistent                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ KI-Textassistent                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Briefdetails                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Live Preview / Style Selector       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Fixed bottom bar                    │
│ [Vorschau] [PDF vorbereiten]        │
└─────────────────────────────────────┘
```

Mobile CSS concept:

```css
@media (max-width: 780px) {
  .workspace {
    grid-template-columns: 1fr;
    padding: 12px 18px 36px;
  }

  .side-panel {
    position: static;
  }

  .bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## 7. User Flow

### 7.1 Standard Editing Flow

```text
1. User opens page
2. User fills basic details
3. Live preview updates automatically
4. User can save locally
5. User can open full preview at any time
```

### 7.2 AI Photo Flow

```text
1. User opens KI-Fotoassistent card
2. User uploads a photo
3. User clicks “Professionelles Foto generieren”
4. Card shows skeleton loading
5. 3 generated photo options appear
6. User selects one option
7. Selected photo appears in live preview
8. User can generate another option if available
```

### 7.3 AI Text Flow

```text
1. User enters role and keywords
2. User selects tone
3. User clicks “Motivationstext erstellen”
4. Text card shows skeleton loading
5. Generated text appears in editable area
6. Generated text is inserted into preview
7. User can edit the generated text manually
```

### 7.4 Preview and Payment Flow

```text
1. User opens full preview
2. User sees document with watermark
3. User clicks “PDF ohne Wasserzeichen herunterladen”
4. Unlock modal appears
5. Price and benefits are shown clearly
6. User clicks “Weiter zur sicheren Zahlung”
7. Stripe Checkout opens
8. After successful payment, clean PDF download is unlocked
```

---

## 8. Color System

### 8.1 Core Colors

```css
:root {
  --bg: #f5f6f8;
  --surface: #ffffff;
  --surface-soft: #f9fafb;

  --text: #1f2933;
  --muted: #6b7280;
  --line: #e5e7eb;

  --primary: #202833;
  --primary2: #384252;
  --accent: #b99768;

  --success: #12725a;
}
```

### 8.2 Background

Use a light neutral background with very soft radial accents.

```css
body {
  background:
    radial-gradient(circle at 8% 0%, rgba(185,151,104,.11), transparent 32%),
    radial-gradient(circle at 88% 9%, rgba(99,102,241,.06), transparent 28%),
    #f5f6f8;
}
```

### 8.3 AI Photo Gradient

AI photo uses a purple/blue gradient.

```css
--ai-purple: #6366f1;
--ai-violet: #8b5cf6;
--ai-blue: #2563eb;
```

Use for:

- AI photo button
- AI photo card border
- AI photo badge
- AI photo iconbox

### 8.4 AI Text Gradient

AI text uses teal/cyan/green.

```css
--ai-teal: #0f766e;
--ai-cyan: #0ea5e9;
--ai-green: #22c55e;
```

Use for:

- AI text button
- AI text card border
- AI text badge
- AI text iconbox

### 8.5 Payment / Premium Card

Use dark professional gradient.

```css
.download-card {
  background: linear-gradient(135deg, #1f2933, #384252);
  color: white;
}
```

### 8.6 Avoided Colors

Do not use:

```text
neon green
bright red as primary
cartoon yellow
full purple background
full black page
high-saturation cyberpunk gradients
```

---

## 9. Typography

### 9.1 Primary UI Font

Recommended:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
```

Fallbacks:

```text
Inter
System UI
Segoe UI
Arial
sans-serif
```

### 9.2 Typography Scale

```text
Hero title: 34–62px
Hero subtitle: 16px / 1.6
Card title: 18px
Card description: 13px / 1.45
Input label: 12px / 700
Input text: 14–15px
Button text: 14px / 650–800
Preview document name: 25px
Preview document body: 10.4px / 1.55
Tag/badge: 12px
Toast: 13px
```

### 9.3 Typography Rules

- Use tight letter spacing only for large headings.
- Keep body readable and calm.
- Avoid overly playful fonts.
- Avoid all-caps for long text.
- Use uppercase only for small badges or document role labels.

---

## 10. Spacing System

Use a consistent spacing scale.

```text
4px
6px
8px
10px
12px
14px
16px
18px
20px
22px
24px
28px
34px
58px
```

### Key Spacing Rules

```text
Page outer padding desktop: 28px
Page outer padding mobile: 18px
Main grid gap: 24px
Builder card gap: 18px
Card header padding: 20px 22px 15px
Card body padding: 22px
Input grid gap: 14px
Photo grid gap: 18px
Preview card padding: 18px
```

---

## 11. Border Radius

```css
--radius-xl: 28px;
--radius-lg: 20px;
--radius-md: 14px;
```

Usage:

```text
Large cards: 28px
Preview cards: 28px
AI generated photo cards: 20px
Inputs: 14px
Buttons: 999px pill radius
Badges: 999px
Language switch: 999px
A4 preview: 15px
```

---

## 12. Shadow System

### Soft Card Shadow

```css
--soft-shadow: 0 12px 36px rgba(17,24,39,.055);
```

### Main Preview Shadow

```css
--shadow: 0 22px 60px rgba(17,24,39,.08);
```

### AI Photo Card Shadow

```css
box-shadow: 0 24px 70px rgba(99,102,241,.12);
```

### AI Text Card Shadow

```css
box-shadow: 0 24px 70px rgba(20,184,166,.12);
```

### Modal Shadow

```css
box-shadow: 0 30px 80px rgba(0,0,0,.24);
```

---

## 13. Component System

## 13.1 Topbar

### Purpose

- Brand identity
- Language switch
- Save action
- Preview action

### Structure

```text
[Logo] VitaGen / subtitle          [DE EN] [Save] [Open preview]
```

### Rules

- No long navigation steps.
- No “Editor / Foto / Text / Vorschau” nav pills.
- Keep topbar clean and minimal.
- Sticky topbar with background blur.

---

## 13.2 Language Switcher

### Structure

```text
[DE] [EN]
```

### Behavior

- Active language button has dark background.
- Switch must update all visible UI text globally.
- Must update:
  - labels
  - buttons
  - helper text
  - modals
  - generated example text
  - preview labels
  - toast messages
  - loading messages

### CSS

```css
.lang-switch {
  display: inline-flex;
  border: 1px solid var(--line);
  background: white;
  border-radius: 999px;
  padding: 4px;
}

.lang-switch button.active {
  background: var(--primary);
  color: white;
}
```

---

## 13.3 Hero Section

### Purpose

Introduce the tool clearly and calmly.

### German Copy

```text
Motivationsschreiben erstellen

Ein moderner, ruhiger Editor für Bewerbungsunterlagen. Die Vorschau aktualisiert sich direkt während der Eingabe. Foto und Motivationstext können mit KI-Unterstützung professionell vorbereitet werden.
```

### English Copy

```text
Create a motivation letter

A modern, calm editor for application documents. The preview updates while you type. Your photo and motivation text can be professionally prepared with AI assistance.
```

### Micro Badges

German:

```text
Vorschau rechts
Lokal gespeichert
Kostenlose Vorschau mit Wasserzeichen
```

English:

```text
Preview on the right
Saved locally
Free preview with watermark
```

---

## 13.4 Standard Form Card

### Purpose

Collect normal user data.

### Visual

Neutral white card.

### Content

```text
Name
Email / Phone
Address
Applying as
Employer address
```

### Rules

- Do not use AI gradient here.
- Label as normal / standard input.
- Keep simple and calm.
- Fields update preview directly.

---

## 13.5 AI Photo Card

### Purpose

Highlight the professional photo generation feature.

### Visual

- Purple/blue gradient border
- AI gradient button
- AI badge
- Soft AI glow
- Skeleton loading when generating

### German Copy

```text
Bewerbungsfoto vorbereiten
KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.
KI-Fotoassistent
Foto hochladen
Professionelles Foto generieren
```

### English Copy

```text
Prepare application photo
AI feature: turn a normal photo into a professional application portrait option.
AI Photo Assistant
Upload photo
Generate professional photo
```

### States

```text
Empty
Generating
Generated
Selected
Regenerate available
```

### Empty State

```text
Upload photo
Upload a photo. The AI creates a professional application portrait option from it.
```

### Loading State

Use skeleton cards:

```css
.skeleton-photo::after {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
  animation: shimmer 1.2s infinite;
}
```

### Generated State

Show 3 photo option cards.

### Selection Behavior

When user selects a photo:

```text
- selected photo receives border highlight
- live preview photo updates
- toast appears
```

---

## 13.6 AI Text Card

### Purpose

Highlight the AI motivation text generation feature.

### Visual

- Teal/cyan gradient border
- AI gradient button
- AI badge
- Editable generated output box
- Skeleton loading lines

### German Copy

```text
Motivationstext formulieren
KI-Funktion: Stichwörter werden in einen sauberen, bearbeitbaren Fliesstext umgewandelt.
KI-Textassistent
Motivationstext erstellen
```

### English Copy

```text
Write motivation text
AI feature: keywords are converted into a clean, editable full paragraph.
AI Text Assistant
Create motivation text
```

### Tone Chips

German:

```text
Professionell
Warm
Selbstbewusst
Kurz & klar
```

English:

```text
Professional
Warm
Confident
Short & clear
```

### Rules

- Generated text must be editable.
- Generated text must be inserted into preview.
- User must remain in control.
- Avoid presenting AI output as final and untouchable.

---

## 13.7 Letter Details Card

### Purpose

Allow user to customize greeting and closing.

### Fields

German:

```text
Begrüssung
Verabschiedung
```

English:

```text
Greeting
Closing
```

### Default Values

German:

```text
Sehr geehrte Damen und Herren
Mit freundlichen Grüssen
```

English:

```text
Dear Hiring Manager
Sincerely
```

### Visual

Neutral standard card.

---

## 13.8 Live Preview Card

### Purpose

Show the current document result while the user edits.

### Behavior

- Updates automatically while typing.
- Updates when style changes.
- Updates when AI photo is selected.
- Updates when AI text is generated.
- Shows watermark for free preview.

### Layout

```text
Live-Vorschau
Aktualisiert sich automatisch beim Tippen
[mini A4 document]
[Save] [Fullscreen Preview]
```

### Watermark

German:

```text
VORSCHAU
```

English:

```text
PREVIEW
```

### Animation

When preview changes:

```css
.a4.pulse {
  box-shadow: 0 0 0 6px rgba(185,151,104,.10);
}
```

---

## 13.9 Style Selector

### Purpose

Let user test document style directly.

### Structure

```text
Style card
├── small visual thumbnail
├── style name
└── small category label
```

### Current Preview Styles

```text
Swiss Line
Executive
Midnight
Terracotta
```

Production can extend this to all document styles.

### Behavior

- Clicking style updates preview immediately.
- Active style gets stronger border.
- Toast appears after selection.

---

## 13.10 Download CTA Card

### Purpose

Prepare user for the paid clean PDF without showing price too early.

### German Copy

```text
PDF ohne Wasserzeichen vorbereiten

Der Nutzer prüft zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.
```

### English Copy

```text
Prepare PDF without watermark

The user reviews the preview first. The price appears only when the PDF without watermark is requested.
```

### Rule

Do not show the price in the sidebar card. Show price only in the unlock modal.

---

## 13.11 Full Preview Modal

### Purpose

Let user inspect the document in a larger format.

### Structure

```text
Modal
├── Full A4 preview with watermark
└── Side panel
    ├── Free preview explanation
    ├── Benefits
    ├── Download clean PDF button
    └── Back to editing button
```

### German Copy

```text
Kostenlose Vorschau

Die Vorschau zeigt das Dokument mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.
```

### English Copy

```text
Free preview

The preview shows the document with a watermark. After unlocking, the PDF without watermark can be downloaded.
```

---

## 13.12 Unlock Payment Modal

### Purpose

Explain the value and price before redirecting to Stripe.

### German Copy

```text
PDF ohne Wasserzeichen
Finale PDF freischalten

Ihre Vorschau ist kostenlos. Für die druckfertige PDF-Version ohne Wasserzeichen können Sie das Dokument einmalig freischalten.

9.90 CHF · einmalig
Weiter zur sicheren Zahlung
```

### English Copy

```text
PDF without watermark
Unlock final PDF

Your preview is free. You can unlock the print-ready PDF version without watermark with a one-time payment.

9.90 CHF · one-time
Continue to secure payment
```

### Benefits

German:

```text
PDF ohne Wasserzeichen
Sofortiger Download nach Zahlung
Sichere Zahlung über Stripe
Keine Kartendaten auf dieser Website gespeichert
```

English:

```text
PDF without watermark
Instant download after payment
Secure payment via Stripe
No card details are stored on this website
```

---

## 13.13 Toast Notifications

### Purpose

Provide lightweight feedback.

### Examples

German:

```text
Ihre Eingaben wurden lokal gespeichert
Professionelle Foto-Optionen wurden erstellt
Motivationstext wurde erstellt und in die Vorschau übernommen
Stil gewechselt: Swiss Line
Zahlung erfolgreich — PDF ohne Wasserzeichen freigeschaltet
```

English:

```text
Your inputs were saved locally
Professional photo options were created
Motivation text was created and added to the preview
Style changed: Swiss Line
Payment successful — PDF without watermark unlocked
```

---

## 14. Interaction & Animation

### 14.1 Skeleton Loading

Use for:

- AI photo generation
- AI text generation

Skeleton should be subtle and premium.

```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

### 14.2 AI Button Sweep

AI buttons can have a subtle animated highlight.

```css
.btn.ai::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  transform: translateX(-100%);
  animation: aiSweep 3.2s infinite;
}
```

### 14.3 Preview Pulse

Preview pulses softly when updated.

```css
.a4.pulse {
  box-shadow: 0 0 0 6px rgba(185,151,104,.10);
}
```

### 14.4 Toast Slide

Toast appears at bottom center.

```css
.toast {
  transform: translate(-50%, 120px);
  opacity: 0;
  transition: .28s ease;
}

.toast.show {
  transform: translate(-50%, 0);
  opacity: 1;
}
```

---

## 15. Internationalization System

Use translation keys for all visible text.

### Required Languages

```text
de
en
```

### Translation Key Pattern

```js
const translations = {
  de: {
    hero_title: "Motivationsschreiben erstellen",
    save: "Speichern"
  },
  en: {
    hero_title: "Create a motivation letter",
    save: "Save"
  }
}
```

### Implementation Rule

All static UI text should use:

```html
<span data-i18n="key"></span>
```

Then JavaScript updates text content:

```js
document.querySelectorAll("[data-i18n]").forEach(el => {
  const key = el.getAttribute("data-i18n");
  el.textContent = t(key);
});
```

### Inputs

Default values should also be localized:

```html
<input
  data-value-de="Max Muster"
  data-value-en="Max Miller"
/>
```

---

## 16. Accessibility Requirements

### Contrast

- Body text must be readable on white and light backgrounds.
- AI gradients should not reduce button text contrast.
- Use dark text on light cards.

### Keyboard

- Language switch buttons must be keyboard accessible.
- Modal should close with Escape.
- Buttons should be real `<button>` elements.

### Focus States

Inputs should have visible focus.

```css
input:focus,
textarea:focus {
  border-color: #9aa8b7;
  box-shadow: 0 0 0 4px rgba(56,66,82,.08);
}
```

### Motion

Animations should be subtle. Avoid heavy motion that distracts from document editing.

---

## 17. Responsive Breakpoints

### Desktop

```text
> 1180px
Two-column layout
Sticky preview
```

### Tablet

```text
≤ 1180px
Single-column layout
Preview moves below builder
```

### Mobile

```text
≤ 780px
Single-column layout
Bottom action bar visible
Top actions simplified
```

CSS concept:

```css
@media (max-width: 1180px) {
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

## 18. Content Guidelines

### German Tone

Use Swiss/German professional wording. Avoid slang.

Examples:

```text
Motivationsschreiben erstellen
Bewerbungsfoto vorbereiten
Motivationstext formulieren
PDF ohne Wasserzeichen
Weiter zur sicheren Zahlung
```

### English Tone

Use calm, clear product language.

Examples:

```text
Create a motivation letter
Prepare application photo
Write motivation text
PDF without watermark
Continue to secure payment
```

### Avoid

```text
AI magic
robot assistant
super fast
instant miracle
pay now!!!
buy now!!!
```

Preferred:

```text
KI-Unterstützung
professionell vorbereiten
Vorschau prüfen
PDF freischalten
secure payment
```

---

## 19. Implementation Notes for Existing VitaGen

### 19.1 Do Not Break Existing Functions

Existing features must remain functional:

- AI photo generation
- AI text generation
- local save
- preview
- print
- watermark preview
- Stripe payment
- paid clean PDF download

### 19.2 Integrate Gradually

Recommended development order:

```text
1. Replace page shell/layout
2. Add two-column layout + sticky preview
3. Move existing form fields into new cards
4. Connect current AI photo function to AI Photo Card
5. Connect current AI text function to AI Text Card
6. Connect existing preview logic to right preview
7. Add style selector integration
8. Connect payment/unlock flow
9. Add i18n text switch
10. Final QA
```

### 19.3 Do Not Rewrite Backend Unless Needed

This UI work should mainly affect:

```text
HTML
CSS
frontend JS
preview integration
style selection
language state
```

Backend should only be touched if required for:

```text
AI endpoint response
Stripe session
paid PDF generation
download verification
```

---

## 20. QA Checklist

### Visual QA

- [ ] Page does not look old/basic.
- [ ] Standard form and AI cards are visually distinct.
- [ ] AI photo card is highlighted with purple/blue gradient.
- [ ] AI text card is highlighted with teal/cyan gradient.
- [ ] Overall page still feels professional, not flashy.
- [ ] Live preview is visible on desktop.
- [ ] Mobile layout is usable.

### Language QA

- [ ] All German text is correct.
- [ ] All English text is correct.
- [ ] Language switch updates all global UI text.
- [ ] No Indonesian text remains.
- [ ] No “demo” text remains in production version.
- [ ] Toasts switch language.
- [ ] Modal text switches language.
- [ ] Input default values switch language if needed.

### AI Photo QA

- [ ] Upload state is clear.
- [ ] Generate button triggers loading.
- [ ] Skeleton loading appears.
- [ ] Generated options appear.
- [ ] User can select one option.
- [ ] Selected photo updates preview.
- [ ] Counter updates correctly.

### AI Text QA

- [ ] Keyword input is clear.
- [ ] Tone chips are visible.
- [ ] Generate button triggers loading.
- [ ] Skeleton loading appears.
- [ ] Generated text appears.
- [ ] Generated text is editable.
- [ ] Generated text updates preview.

### Preview QA

- [ ] Preview updates while typing.
- [ ] Preview updates after AI generation.
- [ ] Preview updates after style selection.
- [ ] Full preview modal opens.
- [ ] Watermark is visible in free preview.
- [ ] Back-to-edit works.

### Payment QA

- [ ] Price is not shown too early.
- [ ] Unlock modal shows 9.90 CHF.
- [ ] Stripe CTA is clear.
- [ ] Payment handling copy is clear.
- [ ] Clean PDF is only available after payment verification.

### Responsive QA

- [ ] Desktop layout works.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] Bottom bar appears on mobile.
- [ ] No horizontal overflow.

---

## 21. Final Design Direction Summary

The final VitaGen Motivation Letter Builder should feel like:

```text
a premium document editor
with smart AI assistance
and a clear paid PDF unlock flow
```

The user should immediately understand:

```text
Normal cards = form input
Gradient cards = AI-powered assistance
Right panel = live document preview
Full preview = final check
Unlock modal = paid clean PDF
```

The design should be modern and polished, while remaining appropriate for professional Swiss/German/European job application documents.
