/**
 * Renders window.SITE_CONTENT (defined in content/site-content.js) into the
 * static HTML shell. Editing the content file and reloading the page
 * is all that's needed to change what's on the site.
 *
 * BILINGUAL: any field shaped { en: "...", vi: "..." } is picked via
 * t(field, lang) — same logic as lib/render-site.mjs. The page's language
 * comes from window.SITE_LANG (set by the server-rendered HTML) or falls
 * back to <html lang>, defaulting to "vi".
 *
 * Also listens for postMessage("SITE_CONTENT_UPDATE") so admin.html can embed
 * this page in an iframe and show a live preview while editing, including a
 * language toggle.
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const money = (n) => "$" + Number(n).toFixed(0);
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };

  // Picks the right language out of a bilingual field { en, vi }. Plain
  // strings/numbers pass through unchanged — that's how structural fields
  // (ids, hrefs, prices, image paths) stay the same in every language.
  function t(field, lang) {
    if (field && typeof field === "object" && !Array.isArray(field)) {
      return field[lang] ?? field.en ?? field.vi ?? "";
    }
    return field;
  }

  let currentLang = window.SITE_LANG || document.documentElement.lang || "vi";

  // Sets a real photo into the hero art area if one is configured and loads
  // successfully. Falls back to the existing decorative orbs otherwise, so a
  // missing/broken image never looks like a broken page.
  function setHeroPhoto(src, focus) {
    const wrap = document.querySelector(".hero-art");
    if (!wrap) return;
    let img = wrap.querySelector(".hero-photo");

    if (!src) {
      if (img) img.remove();
      wrap.classList.remove("has-photo");
      return;
    }

    if (!img) {
      img = document.createElement("img");
      img.className = "hero-photo";
      img.alt = "";
      wrap.prepend(img);
    }
    img.style.objectPosition = focus || "50% 50%";
    img.onerror = () => {
      img.remove();
      wrap.classList.remove("has-photo");
    };
    img.onload = () => wrap.classList.add("has-photo");
    img.src = src;
  }

  // Puts a real photo inside a card's image slot if available; otherwise
  // leaves the existing gradient + text placeholder showing.
  function setPhotoOnCard(container, src, focus) {
    if (!container || !src) return;
    const img = document.createElement("img");
    img.alt = "";
    img.style.objectPosition = focus || "50% 50%";
    img.onerror = () => img.remove();
    img.onload = () => container.classList.add("has-photo");
    img.src = src;
    container.prepend(img);
  }

  function renderSite(data, lang) {
    if (!data) {
      console.error("SITE_CONTENT not found — check that content/site-content.js loaded before main.js");
      return;
    }
    lang = lang || currentLang;
    currentLang = lang;
    document.documentElement.lang = lang;

    // Header / nav ------------------------------------------------------------
    $("logo").textContent = data.site.logoText || data.site.name;
    document.title = `${data.site.name} — ${t(data.site.tagline, lang)}`;

    const nav = $("main-nav");
    clear(nav);
    data.nav.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = t(item.label, lang);
      nav.appendChild(a);
    });

    // Language switcher (marks the active language; links stay the same) --------
    const langLinks = document.querySelectorAll("#lang-switch .lang-link");
    langLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("hreflang") === lang));

    // Hero ----------------------------------------------------------------------
    $("hero-eyebrow").textContent = t(data.hero.eyebrow, lang);
    $("hero-headline").textContent = t(data.hero.headline, lang);
    $("hero-subheadline").textContent = t(data.hero.subheadline, lang);
    const ctaPrimary = $("hero-cta-primary");
    ctaPrimary.textContent = t(data.hero.ctaPrimaryText, lang);
    ctaPrimary.href = data.hero.ctaPrimaryHref;
    const ctaSecondary = $("hero-cta-secondary");
    ctaSecondary.textContent = t(data.hero.ctaSecondaryText, lang);
    ctaSecondary.href = data.hero.ctaSecondaryHref;
    setHeroPhoto(data.hero.image, data.hero.imageFocus);

    // About -----------------------------------------------------------------------
    $("about-heading").textContent = t(data.about.heading, lang);
    $("about-body").textContent = t(data.about.body, lang);
    const statsWrap = $("about-stats");
    clear(statsWrap);
    data.about.stats.forEach((s) => {
      const div = document.createElement("div");
      div.className = "stat";
      div.innerHTML = `<span class="stat-value">${s.value}</span><span class="stat-label">${t(s.label, lang)}</span>`;
      statsWrap.appendChild(div);
    });

    // Intentions --------------------------------------------------------------------
    if ($("intentions-title")) $("intentions-title").textContent = t(data.intentionsSection.title, lang);
    if ($("intentions-subtitle")) $("intentions-subtitle").textContent = t(data.intentionsSection.subtitle, lang);
    const intentionsGrid = $("intentions-grid");
    clear(intentionsGrid);
    data.intentions.forEach((it) => {
      const card = document.createElement("div");
      card.className = "intention-card";
      card.style.borderTopColor = it.color || "";
      card.innerHTML = `
        <h3>${t(it.name, lang)}</h3>
        <div class="intention-stone">${t(it.stone, lang)}</div>
        <div class="intention-meta">${t(it.meta, lang)}</div>
        <p>${t(it.description, lang)}</p>
      `;
      intentionsGrid.appendChild(card);
    });

    // Products ------------------------------------------------------------------------
    if ($("products-title")) $("products-title").textContent = t(data.productsSection.title, lang);
    if ($("products-subtitle")) $("products-subtitle").textContent = t(data.productsSection.subtitle, lang);
    const intentionById = Object.fromEntries(data.intentions.map((i) => [i.id, i]));
    const productsGrid = $("products-grid");
    clear(productsGrid);
    data.products.forEach((p) => {
      const intention = intentionById[p.intention];
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image">
          <span class="product-image-fallback">${t(p.name, lang)}</span>
        </div>
        <div class="product-body">
          <span class="product-tag">${intention ? t(intention.name, lang) : ""}</span>
          <h3>${t(p.name, lang)}</h3>
          <p>${t(p.description, lang)}</p>
          <div class="product-price">${money(p.price)}</div>
        </div>
      `;
      productsGrid.appendChild(card);
      setPhotoOnCard(card.querySelector(".product-image"), p.image, p.imageFocus);
    });

    // Testimonials -----------------------------------------------------------------------
    if ($("testimonials-title")) $("testimonials-title").textContent = t(data.testimonialsSection.title, lang);
    const testimonialsGrid = $("testimonials-grid");
    clear(testimonialsGrid);
    data.testimonials.forEach((item) => {
      const card = document.createElement("div");
      card.className = "testimonial-card";
      card.innerHTML = `
        <p class="testimonial-quote">"${t(item.quote, lang)}"</p>
        <div class="testimonial-author">${item.author}</div>
        <div class="testimonial-location">${item.location}</div>
      `;
      testimonialsGrid.appendChild(card);
    });

    // Newsletter ------------------------------------------------------------------------
    $("newsletter-heading").textContent = t(data.newsletter.heading, lang);
    $("newsletter-body").textContent = t(data.newsletter.body, lang);
    $("newsletter-cta").textContent = t(data.newsletter.ctaText, lang);
    const emailInput = $("newsletter-email");
    if (emailInput) {
      emailInput.placeholder = t(data.newsletter.emailPlaceholder, lang);
      emailInput.setAttribute("aria-label", t(data.newsletter.emailPlaceholder, lang));
    }

    // Contact -------------------------------------------------------------------------------
    $("contact-heading").textContent = t(data.contact.heading, lang);
    if ($("contact-email-label")) $("contact-email-label").textContent = t(data.contact.emailLabel, lang);
    if ($("contact-phone-label")) $("contact-phone-label").textContent = t(data.contact.phoneLabel, lang);
    if ($("contact-address-label")) $("contact-address-label").textContent = t(data.contact.addressLabel, lang);
    $("contact-email").textContent = data.contact.email;
    $("contact-phone").textContent = data.contact.phone;
    $("contact-address").textContent = data.contact.address;
    const socialWrap = $("contact-social");
    clear(socialWrap);
    data.contact.social.forEach((s) => {
      const a = document.createElement("a");
      a.href = s.href;
      a.textContent = s.label;
      a.target = "_blank";
      a.rel = "noopener";
      socialWrap.appendChild(a);
    });

    // Footer ---------------------------------------------------------------------------------
    const footerLinks = $("footer-links");
    clear(footerLinks);
    data.footer.links.forEach((l) => {
      const a = document.createElement("a");
      a.href = l.href;
      a.textContent = t(l.label, lang);
      footerLinks.appendChild(a);
    });
    $("footer-copy").textContent = `© ${data.site.year} ${t(data.footer.copyright, lang)}`;
  }

  // Interactions that should only ever be wired up once ------------------------------------
  $("nav-toggle").addEventListener("click", () => $("main-nav").classList.toggle("open"));
  $("newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert(t(window.SITE_CONTENT.newsletter.successMessage, currentLang));
    e.target.reset();
  });

  // Initial render from the content file --------------------------------------------------
  renderSite(window.SITE_CONTENT, currentLang);

  // Live preview support: when embedded in admin.html's preview iframe, re-render
  // whenever the editor posts an updated content draft (and/or language choice),
  // without a page reload.
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SITE_CONTENT_UPDATE") {
      renderSite(event.data.payload, event.data.lang || currentLang);
    }
  });

  // Let a parent frame (admin.html) know the preview is ready to receive updates.
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "SITE_PREVIEW_READY" }, "*");
  }
})();
