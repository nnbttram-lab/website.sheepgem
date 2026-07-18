/**
 * SHEEP GEM — SERVER-SIDE HTML RENDERER
 *
 * Turns window.SITE_CONTENT-shaped data into a complete, fully-populated
 * index.html string — the same markup js/main.js would eventually build in
 * the browser, except it's here in the raw HTML from the first byte.
 *
 * Why this exists: search engines and most AI browsing tools read the raw
 * HTML response and do NOT run JavaScript reliably. The old index.html was
 * an empty shell that main.js filled in after load, so those readers saw
 * nothing. This renderer is called by netlify/functions/publish.mts on every
 * publish, so the committed index.html always has real content baked in.
 *
 * main.js still runs in real browsers afterwards (nav toggle, newsletter
 * form, live preview in admin.html) — it just re-renders the same content
 * on top, which is harmless.
 */

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

function renderNav(nav) {
  return nav.map((item) => `<a href="${esc(item.href)}">${escText(item.label)}</a>`).join("\n      ");
}

function renderStats(stats) {
  return stats
    .map(
      (s) => `<div class="stat"><span class="stat-value">${escText(s.value)}</span><span class="stat-label">${escText(
        s.label
      )}</span></div>`
    )
    .join("\n      ");
}

function renderIntentions(intentions) {
  return intentions
    .map(
      (it) => `<div class="intention-card" style="border-top-color:${esc(it.color || "")}">
        <h3>${escText(it.name)}</h3>
        <div class="intention-stone">${escText(it.stone)}</div>
        <div class="intention-meta">${escText(it.element)} Element · Bagua: ${escText(it.baguaArea)}</div>
        <p>${escText(it.description)}</p>
      </div>`
    )
    .join("\n      ");
}

function renderProducts(products, intentions) {
  const intentionById = Object.fromEntries(intentions.map((i) => [i.id, i]));
  return products
    .map((p) => {
      const intention = intentionById[p.intention];
      const img = p.image
        ? `<img alt="${escText(p.name)}" src="${esc(p.image)}" style="object-position:${esc(
            p.imageFocus || "50% 50%"
          )}">`
        : "";
      return `<div class="product-card">
        <div class="product-image${p.image ? " has-photo" : ""}">
          ${img}
          <span class="product-image-fallback">${escText(p.name)}</span>
        </div>
        <div class="product-body">
          <span class="product-tag">${intention ? escText(intention.name) : ""}</span>
          <h3>${escText(p.name)}</h3>
          <p>${escText(p.description)}</p>
          <div class="product-price">${money(p.price)}</div>
        </div>
      </div>`;
    })
    .join("\n      ");
}

function renderTestimonials(testimonials) {
  return testimonials
    .map(
      (t) => `<div class="testimonial-card">
        <p class="testimonial-quote">"${escText(t.quote)}"</p>
        <div class="testimonial-author">${escText(t.author)}</div>
        <div class="testimonial-location">${escText(t.location)}</div>
      </div>`
    )
    .join("\n      ");
}

function renderSocial(social) {
  return social
    .map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${escText(s.label)}</a>`)
    .join("\n      ");
}

function renderFooterLinks(links) {
  return links.map((l) => `<a href="${esc(l.href)}">${escText(l.label)}</a>`).join("\n      ");
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

export function renderIndexHTML(data) {
  const title = `${escText(data.site.name)} — ${escText(data.site.tagline)}`;
  const descriptionSource = (data.hero.subheadline || data.about.body || data.site.tagline || "")
    .replace(/\s+/g, " ")
    .trim();
  const description = escText(descriptionSource).slice(0, 300);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header" id="home">
  <div class="container header-inner">
    <a class="logo" href="#home" id="logo">${escText(data.site.logoText || data.site.name)}</a>
    <nav class="main-nav" id="main-nav">
      ${renderNav(data.nav)}
    </nav>
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">☰</button>
  </div>
</header>

<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow" id="hero-eyebrow">${escText(data.hero.eyebrow)}</p>
      <h1 id="hero-headline">${escText(data.hero.headline)}</h1>
      <p class="hero-sub" id="hero-subheadline">${escText(data.hero.subheadline)}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" id="hero-cta-primary" href="${esc(data.hero.ctaPrimaryHref)}">${escText(
    data.hero.ctaPrimaryText
  )}</a>
        <a class="btn btn-secondary" id="hero-cta-secondary" href="${esc(data.hero.ctaSecondaryHref)}">${escText(
    data.hero.ctaSecondaryText
  )}</a>
      </div>
    </div>
    ${renderHeroArt(data.hero)}
  </div>
</section>

<section class="about" id="about">
  <div class="container about-inner">
    <div class="about-copy">
      <h2 id="about-heading">${escText(data.about.heading)}</h2>
      <p id="about-body">${escText(data.about.body)}</p>
    </div>
    <div class="about-stats" id="about-stats">
      ${renderStats(data.about.stats)}
    </div>
  </div>
</section>

<section class="intentions" id="intentions">
  <div class="container">
    <h2 class="section-title">Shop by Intention</h2>
    <p class="section-subtitle">Every stone corresponds to a bagua area and a purpose. Find yours.</p>
    <div class="intentions-grid" id="intentions-grid">
      ${renderIntentions(data.intentions)}
    </div>
  </div>
</section>

<section class="products" id="products">
  <div class="container">
    <h2 class="section-title">Featured Stones</h2>
    <p class="section-subtitle">A starting collection for every corner of your home.</p>
    <div class="products-grid" id="products-grid">
      ${renderProducts(data.products, data.intentions)}
    </div>
  </div>
</section>

<section class="testimonials" id="testimonials">
  <div class="container">
    <h2 class="section-title">What Customers Say</h2>
    <div class="testimonials-grid" id="testimonials-grid">
      ${renderTestimonials(data.testimonials)}
    </div>
  </div>
</section>

<section class="newsletter">
  <div class="container newsletter-inner">
    <div>
      <h2 id="newsletter-heading">${escText(data.newsletter.heading)}</h2>
      <p id="newsletter-body">${escText(data.newsletter.body)}</p>
    </div>
    <form class="newsletter-form" id="newsletter-form">
      <input type="email" placeholder="Your email address" required aria-label="Email address">
      <button type="submit" class="btn btn-primary" id="newsletter-cta">${escText(data.newsletter.ctaText)}</button>
    </form>
  </div>
</section>

<section class="contact" id="contact">
  <div class="container contact-inner">
    <h2 id="contact-heading">${escText(data.contact.heading)}</h2>
    <div class="contact-grid">
      <p><strong>Email:</strong> <span id="contact-email">${escText(data.contact.email)}</span></p>
      <p><strong>Phone:</strong> <span id="contact-phone">${escText(data.contact.phone)}</span></p>
      <p><strong>Address:</strong> <span id="contact-address">${escText(data.contact.address)}</span></p>
    </div>
    <div class="contact-social" id="contact-social">
      ${renderSocial(data.contact.social)}
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-links" id="footer-links">
      ${renderFooterLinks(data.footer.links)}
    </div>
    <p class="footer-copy" id="footer-copy">© ${escText(data.site.year)} ${escText(data.footer.copyright)}</p>
  </div>
</footer>

<script src="content/site-content.js"></script>
<script src="js/main.js"></script>
</body>
</html>
`;
}
