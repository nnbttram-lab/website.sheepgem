# Sheep Gem — Landing Page

A static landing page for the Sheep Gem feng shui stone business, with a lightweight, no-backend CMS for editing content.

## Preview

Double-click `index.html` to open it in your browser. No server or install step needed.

## Structure

```
index.html              Landing page markup
admin.html               Content editor (the "CMS")
css/style.css            Landing page styles
css/admin.css            Editor styles
js/main.js               Renders content into index.html
js/admin.js              Powers the editor form
content/site-content.js  All editable site content (text, prices, links)
```

## Editing content

Open `admin.html` on the live site (e.g. `https://websitesheepgem.netlify.app/admin.html`).
Edit any field on the left — the live preview on the right updates instantly
(toggle Desktop/Mobile to check responsiveness). Click on an image thumbnail's
file picker to replace a photo. When you're happy with it, enter the admin
passcode and click **Publish changes**. The site updates live in about
10–20 seconds — no downloads, no manual file replacing.

Under the hood, `netlify/functions/publish.mts` is a small serverless function
that checks the passcode, then uses the Netlify API (with a token stored as a
site environment variable, `NETLIFY_AUTH_TOKEN`) to push a new deploy with the
updated `content/site-content.js` and any changed images. Everything else on
the site is left untouched.

You can still edit `content/site-content.js` directly and redeploy manually
if you ever prefer that.

## Next steps

This version is a static site (HTML/CSS/JS) so it renders immediately with zero setup. It was built as a fast first look while a sandbox issue blocked reading the original architecture doc and prior project zip. Natural next steps once that's resolved:

- Reconcile this build against the original architecture/schema (stack choice, real CMS backend, product catalog structure).
- If a dynamic CMS is wanted (multi-user editing, image uploads, a proper admin login), migrate to something like Next.js + a headless CMS (Sanity, Contentful, or a self-hosted option).
- Add real product photography and copy review.
- Wire the newsletter form and contact form to an actual email service.
