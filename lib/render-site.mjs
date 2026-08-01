/**
 * SHEEP GEM — SERVER-SIDE HTML RENDERER (bilingual)
 *
 * Turns window.SITE_CONTENT-shaped data into a complete, fully-populated
 * HTML page for a given language — the same markup js/main.js would
 * eventually build in the browser, except it's here in the raw HTML from
 * the first byte.
 *
 * Why this exists: search engines and most AI browsing tools read the raw
 * HTML response and do NOT run JavaScript reliably. This renderer is called
 * by netlify/functions/publish.mts on every publish, once per language, so
 * the committed HTML always has real content baked in for both /index.html
 * (Vietnamese) and /en/index.html (English).
 *
 * BILINGUAL FIELDS: any content field shaped { en: "...", vi: "..." } is
 * picked via t(field, lang). Plain strings/numbers (ids, hrefs, colors,
 * image paths, prices, contact details) pass through unchanged in every
 * language — they're not meant to be translated.
 *
 * main.js still runs in real browsers afterwards (nav toggle, newsletter
 * form, live preview in admin.html) — it just re-renders the same content
 * on top, which is harmless.
 */

const SITE_URL = "https://websitesheepgem.netlify.app";

// Path each language lives at. "vi" is the default/root language.
const LANG_PATHS = {
  vi: "/",
  en: "/en/",
};

const LANG_LABELS = { vi: "VI", en: "EN" };

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// textContent-style assignment in the browser does NOT interpret "\n" as
// <br>, so we don't either — just escape and let CSS (white-space: pre-line
// etc.) handle line breaks if the stylesheet already does that.
function escText(str) {
  return esc(str);
}

function money(n) {
  return "$" + Number(n).toFixed(0);
}

// Picks the right language out of a bilingual field { en, vi }. Plain
// strings/numbers pass through unchanged — that's how structural fields
// (ids, hrefs, prices, image paths) stay the same in every language.
function t(field, lang) {
  if (field && typeof field === "object" && !Array.isArray(field)) {
    return field[lang] ?? field.en ?? field.vi ?? "";
  }
  return field;
}

function renderNav(nav, lang) {
  return nav.map((item) => `<a href="${esc(item.href)}">${escText(t(item.label, lang))}</a>`).join("\n      ");
}

function renderLangSwitch(lang) {
  return Object.keys(LANG_PATHS)
    .map((code) => {
      const active = code === lang ? " active" : "";
      return `<a class="lang-link${active}" href="${LANG_PATHS[code]}" hreflang="${code}">${LANG_LABELS[code]}</a>`;
    })
    .join("\n      ");
}

function renderStats(stats, lang) {
  return stats
    .map(
      (s) => `<div class="stat"><span class="stat-value">${escText(s.value)}</span><span class="stat-label">${escText(
        t(s.label, lang)
      )}</span></div>`
    )
    .join("\n      ");
}

function renderIntentions(intentions, lang) {
  return intentions
    .map(
      (it) => `<div class="intention-card" style="border-top-color:${esc(it.color || "")}">
        <h3>${escText(t(it.name, lang))}</h3>
        <div class="intention-stone">${escText(t(it.stone, lang))}</div>
        <div class="intention-meta">${escText(t(it.meta, lang))}</div>
        <p>${escText(t(it.description, lang))}</p>
      </div>`
    )
    .join("\n      ");
}

function renderProducts(products, intentions, lang) {
  const intentionById = Object.fromEntries(intentions.map((i) => [i.id, i]));
  return products
    .map((p) => {
      const intention = intentionById[p.intention];
      const img = p.image
        ? `<img alt="${escText(t(p.name, lang))}" src="${esc(p.image)}" style="object-position:${esc(
            p.imageFocus || "50% 50%"
          )}">`
        : "";
      return `<div class="product-card">
        <div class="product-image${p.image ? " has-photo" : ""}">
          ${img}
          <span class="product-image-fallback">${escText(t(p.name, lang))}</span>
        </div>
        <div class="product-body">
          <span class="product-tag">${intention ? escText(t(intention.name, lang)) : ""}</span>
          <h3>${escText(t(p.name, lang))}</h3>
          <p>${escText(t(p.description, lang))}</p>
          <div class="product-price">${money(p.price)}</div>
        </div>
      </div>`;
    })
    .join("\n      ");
}

function renderTestimonials(testimonials, lang) {
  return testimonials
    .map(
      (tItem) => `<div class="testimonial-card">
        <p class="testimonial-quote">"${escText(t(tItem.quote, lang))}"</p>
        <div class="testimonial-author">${escText(tItem.author)}</div>
        <div class="testimonial-location">${escText(tItem.location)}</div>
      </div>`
    )
    .join("\n      ");
}

function renderSocial(social) {
  return social
    .map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${escText(s.label)}</a>`)
    .join("\n      ");
}

function renderFooterLinks(links, lang) {
  return links.map((l) => `<a href="${esc(l.href)}">${escText(t(l.label, lang))}</a>`).join("\n      ");
}

function renderHeroArt(hero) {
  if (!hero.image) {
    return `<div class="hero-art" aria-hidden="true">
      <div class="stone-orb orb-1"></div>
      <div class="stone-orb orb-2"></div>
      <div class="stone-orb orb-3"></div>
    </div>`;
  }
  return `<div class="hero-art has-photo" aria-hidden="true">
      <img class="hero-photo" alt="" src="${esc(hero.image)}" style="object-position:${esc(
    hero.imageFocus || "50% 50%"
  )}">
      <div class="stone-orb orb-1"></div>
      <div class="stone-orb orb-2"></div>
      <div class="stone-orb orb-3"></div>
    </div>`;
}

function renderHreflangTags() {
  const tags = Object.keys(LANG_PATHS).map(
    (code) => `<link rel="alternate" hreflang="${code}" href="${SITE_URL}${LANG_PATHS[code]}">`
  );
  // x-default points visitors whose browser language doesn't match either
  // tag to the primary (Vietnamese) version.
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${LANG_PATHS.vi}">`);
  return tags.join("\n");
}

/**
 * Renders one full HTML page in the given language.
 * @param {object} data - window.SITE_CONTENT-shaped data
 * @param {"vi"|"en"} lang - which language to render
 */
export function renderIndexHTML(data, lang = "vi") {
  const path = LANG_PATHS[lang] || LANG_PATHS.vi;
  const canonical = `${SITE_URL}${path}`;
  const title = `${escText(data.site.name)} — ${escText(t(data.site.tagline, lang))}`;
  const descriptionSource = (t(data.hero.subheadline, lang) || t(data.about.body, lang) || t(data.site.tagline, lang) || "")
    .replace(/\s+/g, " ")
    .trim();
  const description = escText(descriptionSource).slice(0, 300);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
${renderHreflangTags()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${lang === "vi" ? "" : "../"}css/style.css">
</head>
<body>

<header class="site-header" id="home">
  <div class="container header-inner">
    <a class="logo" href="#home" id="logo">${escText(data.site.logoText || data.site.name)}</a>
    <nav class="main-nav" id="main-nav">
      ${renderNav(data.nav, lang)}
    </nav>
    <div class="lang-switch" id="lang-switch">
      ${renderLangSwitch(lang)}
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">☰</button>
  </div>
</header>

<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow" id="hero-eyebrow">${escText(t(data.hero.eyebrow, lang))}</p>
      <h1 id="hero-headline">${escText(t(data.hero.headline, lang))}</h1>
      <p class="hero-sub" id="hero-subheadline">${escText(t(data.hero.subheadline, lang))}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" id="hero-cta-primary" href="${esc(data.hero.ctaPrimaryHref)}">${escText(
    t(data.hero.ctaPrimaryText, lang)
  )}</a>
        <a class="btn btn-secondary" id="hero-cta-secondary" href="${esc(data.hero.ctaSecondaryHref)}">${escText(
    t(data.hero.ctaSecondaryText, lang)
  )}</a>
      </div>
    </div>
    ${renderHeroArt(data.hero)}
  </div>
</section>

<section class="about" id="about">
  <div class="container about-inner">
    <div class="about-copy">
      <h2 id="about-heading">${escText(t(data.about.heading, lang))}</h2>
      <p id="about-body">${escText(t(data.about.body, lang))}</p>
    </div>
    <div class="about-stats" id="about-stats">
      ${renderStats(data.about.stats, lang)}
    </div>
  </div>
</section>

<section class="intentions" id="intentions">
  <div class="container">
    <h2 class="section-title" id="intentions-title">${escText(t(data.intentionsSection.title, lang))}</h2>
    <p class="section-subtitle" id="intentions-subtitle">${escText(t(data.intentionsSection.subtitle, lang))}</p>
    <div class="intentions-grid" id="intentions-grid">
      ${renderIntentions(data.intentions, lang)}
    </div>
  </div>
</section>

<section class="products" id="products">
  <div class="container">
    <h2 class="section-title" id="products-title">${escText(t(data.productsSection.title, lang))}</h2>
    <p class="section-subtitle" id="products-subtitle">${escText(t(data.productsSection.subtitle, lang))}</p>
    <div class="products-grid" id="products-grid">
      ${renderProducts(data.products, data.intentions, lang)}
    </div>
  </div>
</section>

<section class="testimonials" id="testimonials">
  <div class="container">
    <h2 class="section-title" id="testimonials-title">${escText(t(data.testimonialsSection.title, lang))}</h2>
    <div class="testimonials-grid" id="testimonials-grid">
      ${renderTestimonials(data.testimonials, lang)}
    </div>
  </div>
</section>

<section class="newsletter">
  <div class="container newsletter-inner">
    <div>
      <h2 id="newsletter-heading">${escText(t(data.newsletter.heading, lang))}</h2>
      <p id="newsletter-body">${escText(t(data.newsletter.body, lang))}</p>
    </div>
    <form class="newsletter-form" id="newsletter-form">
      <input type="email" id="newsletter-email" placeholder="${escText(t(data.newsletter.emailPlaceholder, lang))}" required aria-label="${escText(
    t(data.newsletter.emailPlaceholder, lang)
  )}">
      <button type="submit" class="btn btn-primary" id="newsletter-cta">${escText(t(data.newsletter.ctaText, lang))}</button>
    </form>
  </div>
</section>

<section class="contact" id="contact">
  <div class="container contact-inner">
    <h2 id="contact-heading">${escText(t(data.contact.heading, lang))}</h2>
    <div class="contact-grid">
      <p><strong id="contact-email-label">${escText(t(data.contact.emailLabel, lang))}</strong> <span id="contact-email">${escText(data.contact.email)}</span></p>
      <p><strong id="contact-phone-label">${escText(t(data.contact.phoneLabel, lang))}</strong> <span id="contact-phone">${escText(data.contact.phone)}</span></p>
      <p><strong id="contact-address-label">${escText(t(data.contact.addressLabel, lang))}</strong> <span id="contact-address">${escText(data.contact.address)}</span></p>
    </div>
    <div class="contact-social" id="contact-social">
      ${renderSocial(data.contact.social)}
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-links" id="footer-links">
      ${renderFooterLinks(data.footer.links, lang)}
    </div>
    <p class="footer-copy" id="footer-copy">© ${escText(data.site.year)} ${escText(t(data.footer.copyright, lang))}</p>
  </div>
</footer>

<script>window.SITE_LANG = "${lang}";</script>
<script src="${lang === "vi" ? "" : "../"}content/site-content.js"></script>
<script src="${lang === "vi" ? "" : "../"}js/main.js"></script>
</body>
</html>
`;
}

export { LANG_PATHS, t };
