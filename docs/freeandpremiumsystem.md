# VitaGen Free & Premium System

## 1. Project Overview

Implement a **Free and Premium access system** in the existing VitaGen CV and Motivationsschreiben tools without redesigning or replacing the current platform.

### Project constraints

- Project value: **$190**
- Target delivery: **4 days or earlier**
- Reuse the existing VitaGen codebase, PDF generation, AI integrations, and payment flow wherever possible.
- Do not add login, user accounts, a new database, or document history in this scope.

---

## 2. Product Rules

### Free document

A document is Free only when all of these conditions are true:

- The user selects the new Free template.
- The user enters the text manually.
- The user does not use AI-generated text.
- The user does not use an AI-generated photo in the final document.

Expected flow:

```text
Choose Free template
→ Fill the form manually
→ Preview
→ Download PDF without payment
```

### Premium document

A document becomes Premium when at least one of these conditions is true:

- A Premium template is selected.
- An AI text generation, rewrite, or improvement feature is used.
- An AI-generated photo is used.
- Another feature explicitly marked as Premium is used.

Expected flow:

```text
Use Premium template or feature
→ Preview
→ Payment required
→ Payment confirmed by backend
→ Final PDF or image download unlocked
```

### Rule matrix

| User action | Result |
|---|---|
| Free template + manual text + normal uploaded photo/no photo | Free |
| Premium template + manual text | Premium |
| Free template + AI-generated text | Premium |
| Premium template + AI-generated text | Premium |
| Free template + AI-generated photo | Premium |
| Premium template + AI-generated photo | Premium |
| AI photo preview before payment | Allowed as demo |
| Download AI photo before payment | Blocked |
| Download Premium PDF before payment | Blocked |
| Download Free PDF | Allowed without payment |

---

## 3. UI and Template Work

### 3.1 New Free CV template

Create one new CV template that is:

- simple;
- clean;
- professional;
- readable;
- responsive;
- visually more basic than the Premium templates;
- suitable for real job applications.

It must support the existing CV fields where available:

- personal information;
- profile;
- work experience;
- education;
- training;
- professional skills;
- languages;
- IT skills;
- interests/hobbies;
- driving licence;
- normal uploaded photo.

Requirements:

- Empty sections must not leave broken spacing.
- Long content must not overlap or break the layout.
- Preview and PDF must be visually consistent.
- German special characters must render correctly.

### 3.2 New Free Motivationsschreiben template

Create one new simple and professional motivation letter template.

It must support:

- sender information;
- recipient information;
- subject;
- salutation;
- body text;
- closing;
- name/signature area.

Requirements:

- Preview and PDF must match.
- Signature spacing must remain balanced.
- Existing text-length validation/warning must continue working.
- German special characters must render correctly.

### 3.3 Free and Premium labels

Add visible labels to the template selector:

- `Free`
- `Premium`

Add a small `Premium` label to:

- AI text generation buttons;
- AI rewrite/improvement buttons;
- AI profile or motivation text generation;
- AI photo generation;
- any other AI-assisted feature that requires payment.

For AI photo, show a short explanation such as:

> You can preview an AI-generated photo, but payment is required to download the image or final document.

### 3.4 Current document status

Show a clear status near the preview or download button:

- `Free document`
- `Premium document`

When Premium, also show the reason:

- Premium template selected
- AI text used
- AI photo used

The status must update whenever the user changes templates or uses/removes a Premium feature.

---

## 4. Free/Premium State Logic

Use one centralized rule source so frontend and backend do not apply different logic.

Track at minimum:

```text
selectedTemplateId
selectedTemplateTier
aiTextUsed
normalPhotoUsed
aiPhotoUsed
documentTier
premiumReasons[]
paymentStatus
```

Recommended derived logic:

```text
documentTier = "premium" if:
- selectedTemplateTier == "premium"
- OR aiTextUsed == true
- OR aiPhotoUsed == true

otherwise:
documentTier = "free"
```

Recalculate the document tier when:

- the selected template changes;
- AI text is used;
- an AI photo is generated/selected/removed;
- the user returns from checkout;
- the page is refreshed or restored.

If all active Premium conditions are removed, the document may return to Free, except where previously generated AI text is still being used.

---

## 5. AI Text Logic

AI text generation is a Premium action.

This includes all existing buttons for:

- generate;
- rewrite;
- improve;
- profile text;
- motivation text;
- other AI-assisted writing.

Required flow:

1. User presses an AI text button.
2. Check whether the current Premium action/document has valid payment.
3. If unpaid, open the existing payment flow before executing the AI request.
4. After backend payment confirmation, allow the AI request.
5. Apply the generated result to the form/preview.
6. Mark the document as Premium.

Manual typing remains Free when the Free template is selected.

### Security requirement

Do not protect AI text only by hiding or disabling frontend buttons.

The backend AI endpoint must reject unpaid Premium requests.

---

## 6. AI Photo Demo Logic

The user may generate and preview an AI photo before payment as a demo.

Before payment:

- the image may appear in the VitaGen preview;
- no direct download button is available;
- the original/full-resolution file must not be exposed through an easily reusable public URL;
- a PDF containing the AI photo remains locked.

After payment:

- final AI photo download is unlocked;
- final Premium PDF generation/download is unlocked.

The backend must verify payment before returning downloadable final assets.

---

## 7. Payment and Download Logic

Reuse the existing VitaGen payment implementation.

### 7.1 Free download

When Download is clicked:

1. Recalculate the document tier.
2. If Free:
   - do not open checkout;
   - generate the Free PDF;
   - download it immediately.

### 7.2 Premium download

If the document is Premium:

1. Show a clear payment message.
2. Explain why the document is Premium.
3. Open the existing checkout/payment flow.
4. Preserve form content, selected template, and preview state.
5. Confirm payment on the backend.
6. Unlock final PDF/image download only after successful confirmation.

### 7.3 Cancelled or failed payment

If payment is cancelled or fails:

- return to the VitaGen preview;
- preserve form data;
- preserve template selection;
- preserve generated preview content where technically possible;
- do not unlock Premium output.

### 7.4 Server-side verification

Do not unlock Premium output based only on:

- query parameters;
- frontend JavaScript state;
- localStorage values;
- a manually modified variable.

Payment must be verified server-side.

---

## 8. Security Requirements

Required:

- Premium PDF generation requires backend payment verification.
- AI text endpoints require Premium payment authorization.
- Final AI image download requires Premium payment authorization.
- Premium asset URLs must not provide unrestricted direct access.
- Frontend labels are UX only, not security controls.

Not required:

- full login system;
- user registration;
- subscription management;
- new database architecture;
- long-term project history.

---

## 9. Testing Requirements

### Free CV

- Select Free CV template.
- Enter all content manually.
- Do not use AI photo.
- Download without checkout.
- Confirm preview and PDF match.
- Test empty, short, and long sections.

### Free Motivationsschreiben

- Select Free motivation template.
- Enter text manually.
- Download without checkout.
- Confirm one-page spacing remains professional.
- Confirm long-text warning still works.

### Premium templates

- Test every Premium template.
- Attempt download without payment.
- Confirm checkout appears.
- Confirm final PDF remains blocked before payment.

### AI text

Test every AI text button.

Expected:

- payment is required before generation;
- unpaid backend requests are rejected;
- paid AI output is inserted correctly.

### AI photo

Test:

- generate before payment;
- preview result;
- attempt direct image download;
- attempt PDF download;
- complete payment;
- download final image;
- download final PDF.

Expected:

- preview allowed before payment;
- final downloads blocked before payment;
- downloads unlocked after payment.

### Payment outcomes

Test:

- successful payment;
- cancelled payment;
- failed payment;
- return URL;
- refresh after return;
- repeated authorized download.

### Responsive/browser testing

Test at minimum:

- desktop Chrome;
- desktop Edge or Firefox;
- mobile viewport;
- template selector;
- badges;
- payment message/modal;
- preview;
- download buttons.

---

## 10. Deployment Process

1. Back up current production frontend and backend.
2. Inspect the existing implementation before editing.
3. Implement and test locally.
4. Deploy to staging/test environment where possible.
5. Run the full Free/Premium test matrix.
6. Deploy to production.
7. Run production smoke tests:
   - Free CV download;
   - Free motivation letter download;
   - Premium template checkout;
   - AI text payment;
   - AI photo preview;
   - Premium image/PDF download.
8. Keep a rollback copy available.

---

## 11. Acceptance Criteria

The feature is complete when:

- A new Free CV template works in preview and PDF.
- A new Free Motivationsschreiben template works in preview and PDF.
- Every template is clearly labeled Free or Premium.
- Every AI feature is clearly labeled Premium.
- Free template + manual content downloads without payment.
- Premium templates require payment before final download.
- AI text requires payment before generation.
- AI photo can be previewed before payment.
- AI photo and Premium PDFs cannot be downloaded before payment.
- Successful payment unlocks the correct final output.
- Cancelled/failed payment does not erase form data.
- Premium access is verified by the backend.
- Desktop and mobile remain functional.
- Existing VitaGen features continue working.

---

## 12. Out of Scope

Do not add these unless separately approved:

- user login or registration;
- new authentication system;
- new database;
- saved document history;
- user dashboard;
- DiMe;
- multilingual expansion;
- SEO landing page;
- subscription plans;
- analytics dashboard;
- complete VitaGen redesign;
- changing the payment provider.

---

## 13. Instructions for the Coding Agent

Before implementation:

1. Inspect the repository structure.
2. Identify:
   - template selection components;
   - CV and motivation previews;
   - PDF generators;
   - AI text endpoints;
   - AI photo endpoints/storage;
   - payment/checkout handlers;
   - payment success/cancel return flow.
3. Follow existing project patterns.
4. Avoid unrelated refactoring.
5. Do not remove or break existing Premium templates.
6. Reuse the existing checkout implementation.
7. Keep the Free/Premium rule calculation centralized and testable.
8. Add backend enforcement for every Premium output.
9. Ask before making destructive changes if the current architecture conflicts with this specification.

After implementation, provide a report containing:

- files modified;
- features implemented;
- Free/Premium logic used;
- tests run and results;
- deployment status;
- manual steps still required;
- known limitations;
- rollback instructions.
