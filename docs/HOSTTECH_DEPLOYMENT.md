# Hosttech Deployment

## Architecture

- Main website and static generator frontend: Hosttech/Plesk
- Motivation AI backend: Railway
- Canonical frontend source in this repository: `frontend/`
- Local production backup for reference only: `bewerbungs-generator/`

The repository is not a full copy of `syntext.ch`. It contains the Railway
backend and the motivation generator frontend that this project maintains.
Hosttech also contains the main website and the separate Lebenslauf generator.

## Hosttech Target

Upload the **contents** of `frontend/` to:

```text
httpdocs/bewerbungs-generator/motivation/
```

The public entry page is:

```text
https://syntext.ch/bewerbungs-generator/motivation/formular.html
```

Do not upload the repository root, backend source, `.env`, or the downloaded
backup. Do not replace these unrelated Hosttech paths:

```text
httpdocs/bewerbungs-generator/start.html
httpdocs/bewerbungs-generator/style.css
httpdocs/bewerbungs-generator/lebenslauf/
```

## Backup Structure

The valid backup source is:

```text
bewerbungs-generator/motivation/
```

The nested path below is a duplicate/corrupt copy and is not a deployment
target:

```text
bewerbungs-generator/motivation/motivation/
```

For example, its `preview.html` contains JavaScript rather than HTML.

## API Routing

Only the two AI requests in `frontend/script.js` use the Railway backend:

```text
https://motivation-backend-production-2800.up.railway.app
```

This is intentional for both local real testing and the Hosttech deployment.
Running the static frontend on `localhost:3000` still calls the production
Railway API, so local tests match the live backend behavior.

The remaining production frontend structure is preserved. In particular, the
14 theme files come directly from the Hosttech backup. The Kaufen/payment UI
is not reimplemented by this repository; the only `preview.js` change is the
photo-loading fix for images stored in IndexedDB.

The Hosttech origin must remain included in Railway's `ALLOWED_ORIGINS`.

## Files For This Release

Upload only these files from `frontend/`:

```text
script.js
preview.html
preview.js
photo-storage.js
print.css
```

The first three replace existing files. `photo-storage.js` and `print.css`
must exist beside `preview.html`.

## Safe Upload Procedure

1. Create a fresh Hosttech backup of
   `httpdocs/bewerbungs-generator/motivation/`.
2. Rename each existing file from the release list with a dated `.bak` suffix.
3. Upload the five release files to that target and replace only matching files.
4. Keep the `styles/`, `images/`, payment files, and unrelated pages intact.
5. Test form loading, AI text, AI photo, all 14 themes, and print preview.
6. Do not alter the payment implementation during this deployment. The Kaufen
   button only retains the existing modal behavior.
