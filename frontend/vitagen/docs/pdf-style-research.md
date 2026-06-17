# VitaGen PDF Style Research

## Source Labels

- Europass official tools: CV and cover letter structure across Europe.
  Source: https://europass.europa.eu/en
- EURES cover letter guidance: short, specific, tailored motivation letters.
  Sources:
  - https://eures.europa.eu/want-make-your-cover-letter-stand-out-heres-how-2024-04-12_en
  - https://eures.europa.eu/application-acceptance-top-tips-securing-job-2019-12-06_en
- German Bewerbung expectations: written applications commonly include cover letter, CV, and certificates.
  Source: https://www.deutschland.de/en/topic/knowledge/education-learning/how-to-apply-for-a-job
- Bundesagentur fuer Arbeit Bewerbung guidance and DIN 5008 practical tips.
  Sources:
  - https://www.arbeitsagentur.de/bildung/bewerbung
  - https://www.arbeitsagentur.de/vor-ort/datei/merkblatt-praktische-bewerbungstipps_ba096387.pdf

## Design Principles Applied

- Keep CV styles readable and ATS-aware: clear section hierarchy, normal text flow, system fonts, limited decoration, strong contrast.
- Treat the motivation letter as a business letter: recipient/date header, clear subject, one-page text rhythm, conservative margins.
- Use A4-first CSS: fixed 210mm page width, 297mm page sections, print color adjustment, page-break protection for entries.
- Avoid dated or risky visuals: no neon text, no heavy image backgrounds, no novelty fonts, no cartoon styling.
- Offer fewer, stronger choices instead of 14 near-duplicates.

## New Style Set

- `standard.css`: conservative European baseline for broad applications.
- `executive.css`: corporate leadership/admin/legal tone with navy and restrained gold.
- `swiss.css`: minimal grid, high whitespace, strong typographic discipline.
- `compact.css`: denser layout for candidates with more content.
- `academic.css`: serif-led research, university, and formal institution tone.
- `technical.css`: clean product/engineering layout with precise blue accents.
- `creative.css`: restrained portfolio-friendly style without novelty effects.
- `service.css`: warmer hospitality, healthcare, customer-facing, and service roles.
