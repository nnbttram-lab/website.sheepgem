/**
 * Generic form generator for editing window.SITE_CONTENT.
 * Walks the content object, renders inputs bound to each field's path,
 * and lets you download a regenerated content/site-content.js.
 */
(function () {
  const draft = JSON.parse(JSON.stringify(window.SITE_CONTENT || {}));
  const form = document.getElementById("content-form");

  // Tracks newly-picked images awaiting publish: { "images/products/foo.jpg": "data:image/...base64..." }
  const pendingImages = {};

  function setAtPath(obj, path, value) {
    let node = obj;
    for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
    node[path[path.length - 1]] = value;
  }

  function labelFor(key) {
    return String(key).replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim();
  }

  function isImagePath(key, value) {
    return (
      typeof value === "string" &&
      (key === "image" || /\.(jpe?g|png|webp|gif|svg)$/i.test(value))
    );
  }

  function renderImageField(container, value, path, key) {
    const row = document.createElement("div");
    row.className = "image-field-row";
    const label = document.createElement("label");
    label.textContent = labelFor(key);
    row.appendChild(label);

    const wrap = document.createElement("div");
    wrap.className = "image-preview-wrap";

    const img = document.createElement("img");
    img.className = "image-preview";
    img.src = value;
    img.alt = "";
    img.onerror = () => { img.style.visibility = "hidden"; };
    wrap.appendChild(img);

    const controls = document.createElement("div");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    controls.appendChild(fileInput);

    const pathNote = document.createElement("div");
    pathNote.className = "image-path-note";
    pathNote.textContent = value;
    controls.appendChild(pathNote);
    wrap.appendChild(controls);

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
        pendingImages[value] = reader.result;
        pushPreview();
      };
      reader.readAsDataURL(file);
    });

    row.appendChild(wrap);
    container.appendChild(row);
  }

  function renderPrimitive(container, value, path, key) {
    if (isImagePath(key, value)) {
      renderImageField(container, value, path, key);
      return;
    }

    const row = document.createElement("div");
    row.className = "field-row";
    const label = document.createElement("label");
    label.textContent = labelFor(key);
    row.appendChild(label);

    const isLong = typeof value === "string" && value.length > 60;
    const input = document.createElement(isLong ? "textarea" : "input");
    if (!isLong) input.type = typeof value === "number" ? "number" : "text";
    input.value = value;
    input.addEventListener("input", () => {
      const v = typeof value === "number" ? Number(input.value) : input.value;
      setAtPath(draft, path, v);
    });
    row.appendChild(input);
    container.appendChild(row);
  }

  function renderNode(container, value, path, key) {
    if (Array.isArray(value)) {
      const fs = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = labelFor(key);
      fs.appendChild(legend);
      value.forEach((item, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "array-item";
        const idxLabel = document.createElement("div");
        idxLabel.className = "array-item-index";
        idxLabel.textContent = `#${idx + 1}`;
        wrap.appendChild(idxLabel);
        renderObjectFields(wrap, item, path.concat(idx));
        fs.appendChild(wrap);
      });
      container.appendChild(fs);
    } else if (value !== null && typeof value === "object") {
      const fs = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = labelFor(key);
      fs.appendChild(legend);
      renderObjectFields(fs, value, path);
      container.appendChild(fs);
    } else {
      renderPrimitive(container, value, path, key);
    }
  }

  function renderObjectFields(container, obj, path) {
    Object.keys(obj).forEach((key) => {
      renderNode(container, obj[key], path.concat(key), key);
    });
  }

  renderObjectFields(form, draft, []);
  form.addEventListener("submit", (e) => e.preventDefault());

  // Live preview -------------------------------------------------------------
  const previewFrame = document.getElementById("preview-frame");
  let previewReady = false;

  function pushPreview() {
    if (!previewReady || !previewFrame.contentWindow) return;
    previewFrame.contentWindow.postMessage({ type: "SITE_CONTENT_UPDATE", payload: draft }, "*");
  }

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SITE_PREVIEW_READY" && event.source === previewFrame.contentWindow) {
      previewReady = true;
      pushPreview();
    }
  });

  // In case the iframe already finished loading before the listener above
  // was attached (fast cache loads), also sync on the iframe's load event.
  previewFrame.addEventListener("load", () => {
    previewReady = true;
    pushPreview();
  });

  form.addEventListener("input", pushPreview);

  // Device width toggle --------------------------------------------------------
  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".device-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      previewFrame.style.width = btn.dataset.width;
    });
  });

  const publishBtn = document.getElementById("publish-btn");
  const passwordInput = document.getElementById("publish-password");
  const statusEl = document.getElementById("publish-status");

  function showStatus(kind, message) {
    statusEl.hidden = false;
    statusEl.className = "publish-status status-" + kind;
    statusEl.textContent = message;
  }

  publishBtn.addEventListener("click", async () => {
    const password = passwordInput.value;
    if (!password) {
      showStatus("error", "Enter the admin passcode first.");
      passwordInput.focus();
      return;
    }

    publishBtn.disabled = true;
    showStatus("pending", "Publishing… this usually takes 10–20 seconds.");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          password,
          content: draft,
          images: pendingImages,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showStatus("error", data.error || `Publish failed (${res.status}).`);
        return;
      }

      // Clear pending images now that they've been sent successfully.
      Object.keys(pendingImages).forEach((k) => delete pendingImages[k]);
      showStatus("success", "Published! Your live site is updating now.");
    } catch (err) {
      showStatus("error", "Could not reach the publish service. Check your connection and try again.");
    } finally {
      publishBtn.disabled = false;
    }
  });
})();
