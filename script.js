(function () {
  "use strict";

  const data = window.FERSINAM_DATA;
  if (!data) return;

  const CART_KEY = "fersinam-cart-v2";
  const CUSTOMER_KEY = "fersinam-customer-v1";
  const page = document.body.dataset.page;
  const productById = new Map(data.products.map((product) => [product.id, product]));
  let activeCategory = "todos";
  let searchTerm = "";
  let toastTimer;

  const readJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const cart = new Map(
    Object.entries(readJson(CART_KEY, {})).filter(([id, quantity]) => productById.has(id) && quantity > 0),
  );

  const money = new Intl.NumberFormat(data.business.locale, {
    style: "currency",
    currency: data.business.currency,
    minimumFractionDigits: 2,
  });

  const formatPrice = (value) => money.format(value).replace("PEN", "S/");
  const cartQuantity = () => Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);
  const cartTotal = () => Array.from(cart.entries()).reduce((total, [id, quantity]) => total + productById.get(id).price * quantity, 0);

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(Object.fromEntries(cart)));
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function productCard(product, compact = false) {
    const unavailable = !product.available;
    const hasHoverImage = Boolean(product.hoverImage);
    const imageContent = `
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <img class="product-image product-image-default" src="${product.image}" alt="${product.name}" loading="lazy" />
          ${hasHoverImage ? `
            <img class="product-image product-image-hover" src="${product.hoverImage}" alt="Interior de ${product.name}" loading="lazy" />
            <span class="product-view-label"><span class="label-default">Ver relleno</span><span class="label-hover">Vista interior</span></span>
          ` : ""}`;
    return `
      <article class="product-card product-${product.color} ${compact ? "product-card-featured" : ""} ${hasHoverImage ? "has-hover-image" : ""} ${product.imageStyle === "photo" ? "product-card-photo" : ""}">
        ${hasHoverImage
          ? `<button class="product-image-wrap product-image-swap" type="button" data-toggle-product-image aria-label="Alternar entre la galleta completa y su interior" aria-pressed="false">${imageContent}</button>`
          : `<div class="product-image-wrap">${imageContent}</div>`}
        <div class="product-card-copy">
          <p class="product-kicker">${product.categoryLabel}</p>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-card-footer">
            <strong>${formatPrice(product.price)}</strong>
            <button class="add-button" type="button" data-add-product="${product.id}" ${unavailable ? "disabled" : ""}>
              ${unavailable ? "Agotado" : "Agregar"}<span aria-hidden="true">${unavailable ? "" : "+"}</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function updateGlobalContent() {
    document.querySelectorAll("[data-current-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
    document.querySelectorAll("[data-instagram-link]").forEach((link) => { link.href = data.business.instagramUrl; });
    document.querySelectorAll("[data-instagram-handle]").forEach((node) => { node.textContent = data.business.instagramHandle; });
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = `https://wa.me/${data.business.whatsappNumber}?text=${encodeURIComponent("Hola, quisiera información sobre el menú de FersiÑam.")}`;
    });
  }

  function setupNavigation() {
    const menuButton = document.querySelector(".menu-button");
    const mobileNav = document.querySelector("#mobileNav");
    if (!menuButton || !mobileNav) return;

    const closeMenu = () => {
      mobileNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    };

    menuButton.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    mobileNav.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  }

  function setupScrollFade() {
    const scenes = Array.from(document.querySelectorAll("[data-scroll-fade]"));
    if (!scenes.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopLayout = window.matchMedia("(min-width: 981px)");
    let animationFrame = 0;

    const clamp = (value) => Math.min(1, Math.max(0, value));
    const setProgress = (scene, progress) => {
      const logoPhase = clamp(progress / 0.48);
      const revealPhase = clamp((progress - 0.26) / 0.62);
      scene.style.setProperty("--scroll-logo-opacity", (1 - logoPhase).toFixed(3));
      scene.style.setProperty("--scroll-logo-scale", (1 - logoPhase * 0.13).toFixed(3));
      scene.style.setProperty("--scroll-logo-lift", `${Math.round(logoPhase * -24)}px`);
      scene.style.setProperty("--scroll-reveal-opacity", revealPhase.toFixed(3));
      scene.style.setProperty("--scroll-reveal-lift", `${Math.round((1 - revealPhase) * 42)}px`);
      scene.classList.toggle("scroll-content-active", revealPhase > 0.06);
    };

    const render = () => {
      animationFrame = 0;
      if (reducedMotion.matches || !desktopLayout.matches) {
        scenes.forEach((scene) => setProgress(scene, 1));
        return;
      }

      scenes.forEach((scene) => {
        const sticky = scene.querySelector(".seasonal-sticky");
        if (!sticky) return;
        const rect = scene.getBoundingClientRect();
        const stickyTop = Number.parseFloat(window.getComputedStyle(sticky).top) || 0;
        const travel = Math.max(scene.offsetHeight - sticky.offsetHeight, 1);
        const progress = Math.min(1, Math.max(0, (stickyTop - rect.top) / travel));
        setProgress(scene, progress);
      });
    };

    const requestRender = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    reducedMotion.addEventListener?.("change", requestRender);
    desktopLayout.addEventListener?.("change", requestRender);
    render();
  }

  function updateCartIndicators() {
    const quantity = cartQuantity();
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = quantity; });
    const homeLabel = document.querySelector("[data-cart-mobile-label]");
    if (homeLabel) homeLabel.textContent = quantity ? `${quantity} en tu pedido` : "Ver catálogo";
  }

  function addToCart(id) {
    const product = productById.get(id);
    if (!product || !product.available) return;
    cart.set(id, (cart.get(id) || 0) + 1);
    saveCart();
    updateCartIndicators();
    renderCart();
    showToast(`${product.name} se agregó a tu pedido`);
  }

  function changeQuantity(id, delta) {
    const next = (cart.get(id) || 0) + delta;
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    saveCart();
    updateCartIndicators();
    renderCart();
  }

  function setupAddButtons() {
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-product]");
      if (addButton) addToCart(addButton.dataset.addProduct);

      const imageButton = event.target.closest("[data-toggle-product-image]");
      if (imageButton) {
        const card = imageButton.closest(".product-card");
        const active = card.classList.toggle("show-hover-image");
        imageButton.setAttribute("aria-pressed", String(active));
      }

      const quantityButton = event.target.closest("[data-quantity-change]");
      if (quantityButton) changeQuantity(quantityButton.dataset.productId, Number(quantityButton.dataset.quantityChange));
    });
  }

  function setupHome() {
    const featuredGrid = document.querySelector("#featuredProducts");
    if (!featuredGrid) return;

    document.querySelector("#campaignEyebrow").textContent = data.campaign.eyebrow;
    document.querySelector("#campaignDescription").textContent = data.campaign.description;
    featuredGrid.innerHTML = data.products.filter((product) => product.featured && product.available).slice(0, 3).map((product) => productCard(product, true)).join("");

    const [mainId, secondaryId] = data.campaign.heroProductIds;
    const heroImages = [
      [document.querySelector("#heroImageMain"), productById.get(mainId)],
      [document.querySelector("#heroImageSecondary"), productById.get(secondaryId)],
    ];
    heroImages.forEach(([image, product]) => {
      if (!image || !product) return;
      image.src = product.image;
      image.alt = `Galleta ${product.name}`;
      image.closest(".hero-product")?.classList.toggle("hero-product-photo", product.imageStyle === "photo");
    });
  }

  function renderFilters() {
    const filters = document.querySelector("#categoryFilters");
    if (!filters) return;
    filters.innerHTML = data.categories.map((category) => `
      <button class="filter ${category.id === activeCategory ? "active" : ""}" type="button" data-category="${category.id}" aria-pressed="${category.id === activeCategory}">${category.label}</button>
    `).join("");
  }

  function renderCatalog() {
    const grid = document.querySelector("#productGrid");
    if (!grid) return;
    const visible = data.products.filter((product) => {
      const matchesCategory = activeCategory === "todos" || product.category === activeCategory;
      const searchable = `${product.name} ${product.description}`.toLocaleLowerCase("es");
      return matchesCategory && searchable.includes(searchTerm);
    });

    grid.innerHTML = visible.map((product) => productCard(product)).join("");
    document.querySelector("#resultCount").textContent = `${visible.length} ${visible.length === 1 ? "producto" : "productos"}`;
    document.querySelector("#noResults").hidden = visible.length > 0;
  }

  function customerData() {
    return {
      name: document.querySelector("#customerName")?.value.trim() || "",
      district: document.querySelector("#customerDistrict")?.value.trim() || "",
      date: document.querySelector("#customerDate")?.value || "",
    };
  }

  function saveCustomer() {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customerData()));
    updateWhatsappLink();
  }

  function buildWhatsappMessage() {
    const customer = customerData();
    const lines = Array.from(cart.entries()).map(([id, quantity]) => {
      const product = productById.get(id);
      return `• ${quantity} × ${product.name} — ${formatPrice(product.price * quantity)}`;
    });
    const details = [
      customer.name ? `Nombre: ${customer.name}` : "",
      customer.district ? `Distrito: ${customer.district}` : "",
      customer.date ? `Fecha preferida: ${customer.date.split("-").reverse().join("/")}` : "",
    ].filter(Boolean);

    return [
      "Hola FersiÑam, quisiera pedir:",
      "",
      ...lines,
      "",
      `Subtotal estimado: ${formatPrice(cartTotal())}`,
      ...(details.length ? ["", ...details] : []),
      "",
      "¿Me confirman disponibilidad y costo de delivery?",
    ].join("\n");
  }

  function updateWhatsappLink() {
    const button = document.querySelector("#whatsappButton");
    if (!button) return;
    const hasItems = cart.size > 0;
    button.classList.toggle("disabled", !hasItems);
    button.setAttribute("aria-disabled", String(!hasItems));
    button.href = hasItems ? `https://wa.me/${data.business.whatsappNumber}?text=${encodeURIComponent(buildWhatsappMessage())}` : "#";
  }

  function renderCart() {
    const list = document.querySelector("#cartList");
    if (!list) return;
    if (!cart.size) {
      list.innerHTML = `<div class="empty-cart"><span aria-hidden="true">🍪</span><h3>Tu box está vacía</h3><p>Agrega algo rico del catálogo para empezar.</p></div>`;
    } else {
      list.innerHTML = Array.from(cart.entries()).map(([id, quantity]) => {
        const product = productById.get(id);
        return `
          <div class="cart-item">
            <img src="${product.image}" alt="" />
            <div class="cart-item-copy"><strong>${product.name}</strong><span>${formatPrice(product.price)} c/u</span></div>
            <div class="quantity-control" aria-label="Cantidad de ${product.name}">
              <button type="button" data-product-id="${id}" data-quantity-change="-1" aria-label="Quitar uno">−</button>
              <strong>${quantity}</strong>
              <button type="button" data-product-id="${id}" data-quantity-change="1" aria-label="Agregar uno">+</button>
            </div>
          </div>`;
      }).join("");
    }
    document.querySelector("#cartTotal").textContent = formatPrice(cartTotal());
    const mobileTotal = document.querySelector("#mobileCartTotal");
    if (mobileTotal) mobileTotal.textContent = formatPrice(cartTotal());
    updateWhatsappLink();
  }

  function openOrderPanel() {
    if (!window.matchMedia("(max-width: 980px)").matches) {
      document.querySelector("#orderPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document.body.classList.add("order-open");
    document.querySelector("#orderPanel")?.classList.add("open");
    document.querySelector(".order-close-button")?.focus();
  }

  function closeOrderPanel() {
    document.body.classList.remove("order-open");
    document.querySelector("#orderPanel")?.classList.remove("open");
  }

  function setupCatalog() {
    if (page !== "catalog") return;

    const requestedCategory = new URLSearchParams(window.location.search).get("categoria");
    if (data.categories.some((category) => category.id === requestedCategory)) activeCategory = requestedCategory;

    renderFilters();
    renderCatalog();
    renderCart();

    document.querySelector("#categoryFilters").addEventListener("click", (event) => {
      const filter = event.target.closest("[data-category]");
      if (!filter) return;
      activeCategory = filter.dataset.category;
      renderFilters();
      renderCatalog();
    });

    document.querySelector("#productSearch").addEventListener("input", (event) => {
      searchTerm = event.target.value.trim().toLocaleLowerCase("es");
      renderCatalog();
    });

    document.querySelectorAll(".cart-open-button").forEach((button) => button.addEventListener("click", openOrderPanel));
    document.querySelector(".order-close-button").addEventListener("click", closeOrderPanel);
    document.querySelector("#pageOverlay").addEventListener("click", closeOrderPanel);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeOrderPanel(); });

    const orderPanel = document.querySelector("#orderPanel");
    orderPanel.addEventListener("wheel", (event) => {
      if (window.matchMedia("(max-width: 980px)").matches) return;
      const canScrollInside = orderPanel.scrollHeight > orderPanel.clientHeight + 1;
      const reachedTop = orderPanel.scrollTop <= 0;
      const reachedBottom = orderPanel.scrollTop + orderPanel.clientHeight >= orderPanel.scrollHeight - 1;
      const shouldPassToPage = !canScrollInside || (event.deltaY < 0 && reachedTop) || (event.deltaY > 0 && reachedBottom);
      if (!shouldPassToPage) return;
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: "auto" });
    }, { passive: false });

    const savedCustomer = readJson(CUSTOMER_KEY, {});
    ["Name", "District", "Date"].forEach((field) => {
      const input = document.querySelector(`#customer${field}`);
      const key = field.toLowerCase();
      if (input && savedCustomer[key]) input.value = savedCustomer[key];
      input?.addEventListener("input", saveCustomer);
    });

    document.querySelector("#whatsappButton").addEventListener("click", (event) => {
      if (!cart.size) event.preventDefault();
    });

    if (window.location.hash === "#pedido" && window.matchMedia("(max-width: 980px)").matches) openOrderPanel();
  }

  updateGlobalContent();
  setupNavigation();
  setupScrollFade();
  setupAddButtons();
  setupHome();
  setupCatalog();
  updateCartIndicators();
})();
