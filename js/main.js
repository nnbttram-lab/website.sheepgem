/**
 * Renders window.SITE_CONTENT (defined in content/site-content.js) into the
 * static index.html shell. Editing the content file and reloading the page
 * is all that's needed to change what's on the site.
 *
 * Also listens for postMessage("SITE_CONTENT_UPDATE") so admin.html can embed
 * this page in an iframe and show a live preview while editing.
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const money = (n) => "$" + Number(n).toFixed(0);
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };

  function renderSite(data) {
    if (!data) {
      console.error("SITE_CONTENT not found — check that content/site-content.js loaded before main.js");
      return;
    }

    // Header / nav ------------------------------------------------------------
    $("logo").textContent = data.site.logoText || data.site.name;
    document.title = `${data.site.name} — ${data.site.tagline}`;

    const nav = $("main-nav");
    clear(nav);
    data.nav.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      nav.appendChild(a);
    });

    // Hero ----------------------------------------------------------------------
    $("hero-eyebrow").textContent = data.hero.eyebrow;
    $("hero-headline").textContent = data.hero.headline;
    $("hero-subheadline").textContent = data.hero.subheadline;
    const ctaPrimary = $("hero-cta-primary");
    ctaPrimary.textContent = data.hero.ctaPrimaryText;
    ctaPrimary.href = data.hero.ctaPrimaryHref;
    const ctaSecondary = $("hero-cta-secondary");
    ctaSecondary.textContent = data.hero.ctaSecondaryText;
    ctaSecondary.href = data.hero.ctaSecondaryHref;

    // About -----------------------------------------------------------------------
    $("about-heading").textContent = data.about.heading;
    $("about-body").textContent = data.about.body;
    const statsWrap = $("about-stats");
    clear(statsWrap);
    data.about.stats.forEach((s) => {
      const div = document.createElement("div");
      div.className = "stat";
      div.innerHTML = `<span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span>`;
      statsWrap.appendChild(div);
    });

    // Intentions --------------------------------------------------------------------
    const intentionsGrid = $("intentions-grid");
    clear(intentionsGrid);
    data.intentions.forEach((it) => {
      const card = document.createElement("div");
      card.className = "intention-card";
      card.style.borderTopColor = it.color || "";
      card.innerHTML = `
        <h3>${it.name}</h3>
        <div class="intention-stone">${it.stone}</div>
        <div class="intention-meta">${it.element} Element · Bagua: ${it.baguaArea}</div>
        <p>${it.description}</p>
      `;
      intentionsGrid.appendChild(card);
    });

    // Products ------------------------------------------------------------------------
    const intentionById = Object.fromEntries(data.intentions.map((i) => [i.id, i]));
    const productsGrid = $("products-grid");
    clear(productsGrid);
    data.products.forEach((p) => {
      const intention = intentionById[p.intention];
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image">${p.name}</div>
        <div class="product-body">
          <span class="product-tag">${intention ? intention.name : ""}</span>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div class="product-price">${money(p.price)}</div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    // Testimonials -----------------------------------------------------------------------
    const testimonialsGrid = $("testimonials-grid");
    clear(testimonialsGrid);
    data.testimonials.forEach((t) => {
      const card = document.createElement("div");
      card.className = "testimonial-card";
      card.innerHTML = `
        <p class="testimonial-quote">“${t.quote}”</p>
        <div class="testimonial-author">${t.author}</div>
        <div class="testimonial-location">${t.location}</div>
      `;
      testimonialsGrid.appendChild(card);
    });

    // Newsletter ------------------------------------------------------------------------
    $("newsletter-heading").textContent = data.newsletter.heading;
    $("newsletter-body").textContent = data.newsletter.body;
    $("newsletter-cta").textContent = data.newsletter.ctaText;

    // Contact -------------------------------------------------------------------------------
    $("contact-heading").textContent = data.contact.heading;
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
      a.textContent = l.label;
      footerLinks.appendChild(a);
    });
    $("footer-copy").textContent = `© ${data.site.year} ${data.footer.copyright}`;
  }

  // Interactions that should only ever be wired up once ------------------------------------
  $("nav-toggle").addEventListener("click", () => $("main-nav").classList.toggle("open"));
  $("newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks for subscribing! (Hook this form up to your email provider when ready.)");
    e.target.reset();
  });

  // Initial render from the content file --------------------------------------------------
  renderSite(window.SITE_CONTENT);

  // Live preview support: when embedded in admin.html's preview iframe, re-render
  // whenever the editor posts an updated content draft, without a page reload.
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SITE_CONTENT_UPDATE") {
      renderSite(event.data.payload);
    }
  });

  // Let a parent frame (admin.html) know the preview is ready to receive updates.
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "SITE_PREVIEW_READY" }, "*");
  }
})();
