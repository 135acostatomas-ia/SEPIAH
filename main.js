/* ============================================
   SEPIAH — Catálogo y carrito
============================================ */

const WPP_NUMBER = "5491164562757";
const DELIVERY_MINIMUM = 40000;
const SIZE_MULTIPLIERS = { 5: 0.5, 10: 1, 20: 2 };
const AVAILABLE_SIZES = [5, 10, 20];

const PRODUCTS = [
  { id: 20, name: "Lattafa Khamrah",                price: 16000, img: "img/productos/Fragancias/LattafaKhamrah.png",        tag: null },
  { id: 21, name: "Lattafa Asad",                   price: 16000, img: "img/productos/Fragancias/LattafaAsad.png",           tag: null },
  { id: 22, name: "Afnan 9PM Negro",                price: 16000, img: "img/productos/Fragancias/afnan9pm.png",              tag: null },
  { id: 23, name: "Armaf Club de Nuit Intense Man", price: 16000, img: "img/productos/Fragancias/armafclub.png",             tag: null },
  { id: 24, name: "Afnan 9PM Night Out",            price: 16000, img: "img/productos/Fragancias/AFNAN-9PM-NIGHT-OUT.png",   tag: null },
  { id: 25, name: "Lattafa Badee Al Oud",           price: 16000, img: "img/productos/Fragancias/LATTAFA-BADEE-AL-OUD.png", tag: null },
  { id: 26, name: "Lattafa The Kingdom",            price: 16000, img: "img/productos/Fragancias/LATTAFA-THE-KINGDOMG.png", tag: null },
];

let cart = loadCart();
let selectedSizes = {};
let deliveryMethod = localStorage.getItem("sepiah-delivery-method") || "pickup";

function priceFor(product, size) {
  return Math.round(product.price * SIZE_MULTIPLIERS[size]);
}

function itemKey(id, size) {
  return `${id}-${size}`;
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sepiah-cart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function persistCart() {
  localStorage.setItem("sepiah-cart", JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((total, item) => total + item.price * item.qty, 0);
}

function setSelectedSize(id, size) {
  selectedSizes[id] = Number(size);
  renderProducts();
}

function addToCart(id) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  const size = selectedSizes[id] || 10;
  const key = itemKey(id, size);
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
    showToast(`${product.name} ${size} ml — Cantidad: ${existing.qty}`);
  } else {
    cart.push({ key, id: product.id, name: product.name, img: product.img, size, price: priceFor(product, size), qty: 1 });
    showToast(`${product.name} ${size} ml — Agregado ✓`);
  }

  persistCart();
  updateCartUI();
  renderProducts();
}

function increaseQty(key) {
  const item = cart.find(entry => entry.key === key);
  if (!item) return;
  item.qty += 1;
  persistCart();
  updateCartUI();
  renderProducts();
}

function decreaseQty(key) {
  const item = cart.find(entry => entry.key === key);
  if (!item) return;
  if (item.qty > 1) item.qty -= 1;
  else {
    cart = cart.filter(entry => entry.key !== key);
    showToast(`${item.name} ${item.size} ml — Eliminado`);
  }
  persistCart();
  updateCartUI();
  renderProducts();
}

function removeFromCart(key) {
  const item = cart.find(entry => entry.key === key);
  if (!item) return;
  cart = cart.filter(entry => entry.key !== key);
  persistCart();
  showToast(`${item.name} ${item.size} ml — Eliminado`);
  updateCartUI();
  renderProducts();
}

function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const bnCountEl = document.getElementById("bnCount");
  const totalQty = cart.reduce((count, item) => count + item.qty, 0);
  const total = cartTotal();

  if (countEl) countEl.textContent = totalQty;
  if (bnCountEl) bnCountEl.textContent = totalQty;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString("es-AR")}`;
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        CARRITO VACÍO<br><br>
        <span>// AGREGÁ FRAGANCIAS</span>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.size} ml · $${item.price.toLocaleString("es-AR")} c/u</div>
          <div class="cart-item-price">$${(item.price * item.qty).toLocaleString("es-AR")}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="decreaseQty('${item.key}')" aria-label="Restar una unidad">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="increaseQty('${item.key}')" aria-label="Sumar una unidad">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" aria-label="Eliminar ${item.name}">✕</button>
      </div>`).join("");
  }

  updateCheckoutState(total);
}

function updateCheckoutState(total = cartTotal()) {
  const warningEl = document.getElementById("deliveryWarning");
  const checkoutButton = document.getElementById("checkoutButton");
  if (!warningEl || !checkoutButton) return;

  const amountMissing = Math.max(0, DELIVERY_MINIMUM - total);
  const deliveryBlocked = deliveryMethod === "delivery" && amountMissing > 0;
  warningEl.textContent = deliveryBlocked
    ? `Te faltan $${amountMissing.toLocaleString("es-AR")} para solicitar envío a domicilio.`
    : deliveryMethod === "delivery"
      ? "Tu pedido alcanza el mínimo para envío a domicilio."
      : "";
  warningEl.classList.toggle("is-valid", deliveryMethod === "delivery" && !deliveryBlocked);
  checkoutButton.disabled = cart.length === 0 || deliveryBlocked;
}

function openCart() {
  document.getElementById("cartSidebar")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("active");
}

function closeCart() {
  document.getElementById("cartSidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("active");
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(product => {
    const selectedSize = selectedSizes[product.id] || 10;
    const selectedKey = itemKey(product.id, selectedSize);
    const inCart = cart.find(item => item.key === selectedKey);
    const currentPrice = priceFor(product, selectedSize);
    const sizeOptions = AVAILABLE_SIZES.map(size =>
      `<option value="${size}" ${size === selectedSize ? "selected" : ""}>${size} ml — $${priceFor(product, size).toLocaleString("es-AR")}</option>`
    ).join("");
    const action = inCart
      ? `<div class="card-qty-controls">
          <button class="qty-btn" onclick="event.stopPropagation(); decreaseQty('${selectedKey}')">−</button>
          <span class="qty-num">${inCart.qty}</span>
          <button class="qty-btn" onclick="event.stopPropagation(); increaseQty('${selectedKey}')">+</button>
        </div>`
      : `<button class="add-btn" onclick="event.stopPropagation(); addToCart(${product.id})">+ Agregar</button>`;

    return `
      <article class="product-card" onclick="openLightbox('${product.img}', '${product.name}')">
        <div class="product-img-wrap">
          <img class="product-img" src="${product.img}" alt="${product.name}" loading="lazy">
          <div class="card-overlay">${action}</div>
        </div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <label class="size-field" onclick="event.stopPropagation()">
            <span>Medida</span>
            <select onchange="setSelectedSize(${product.id}, this.value)" aria-label="Medida para ${product.name}">
              ${sizeOptions}
            </select>
          </label>
          <div class="product-price">$${currentPrice.toLocaleString("es-AR")}</div>
        </div>
      </article>`;
  }).join("");
  refreshCursorTargets();
}

function sendToWhatsApp() {
  if (cart.length === 0) {
    showToast("Agregá fragancias primero");
    return;
  }
  const total = cartTotal();
  if (deliveryMethod === "delivery" && total < DELIVERY_MINIMUM) {
    showToast(`El envío a domicilio requiere un mínimo de $${DELIVERY_MINIMUM.toLocaleString("es-AR")}`);
    return;
  }

  const lines = cart.map(item =>
    `• ${item.name} — ${item.size} ml x${item.qty} — $${(item.price * item.qty).toLocaleString("es-AR")}`
  );
  const deliveryLabel = deliveryMethod === "delivery" ? "Envío a domicilio" : "Retiro en local";
  const message = [
    "✦ *Pedido SEPIAH*",
    "",
    ...lines,
    "",
    `*Total: $${total.toLocaleString("es-AR")}*`,
    `*Entrega: ${deliveryLabel}*`,
    "",
    "Quiero coordinar este pedido."
  ].join("\n");
  window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function openLightbox(src, alt) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-overlay" onclick="closeLightbox()"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" onclick="closeLightbox()" aria-label="Cerrar imagen">✕</button>
      <img src="${src}" alt="${alt}">
    </div>`;
  document.body.appendChild(lightbox);
  window.setTimeout(() => lightbox.classList.add("active"), 10);
}

function closeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  lightbox.classList.remove("active");
  window.setTimeout(() => lightbox.remove(), 300);
}

function setupPageTransition() {
  const transition = document.getElementById("pageTransition");
  if (!transition) return;
  if (document.body.classList.contains("catalog-page")) {
    window.requestAnimationFrame(() => transition.classList.add("is-arriving"));
    window.setTimeout(() => transition.classList.add("is-complete"), 1400);
  }
  document.querySelectorAll(".catalog-link").forEach(link => {
    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      transition.classList.add("is-active");
      window.setTimeout(() => { window.location.href = link.href; }, 1100);
    });
  });
}

const cursorEl = document.getElementById("cursor");
const ringEl = document.getElementById("cursorRing");
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

function refreshCursorTargets() {
  if (!window.matchMedia("(pointer: fine)").matches || !cursorEl || !ringEl) return;
  document.querySelectorAll("button, a, select, .product-card").forEach(element => {
    if (element.dataset.cursorBound) return;
    element.dataset.cursorBound = "true";
    element.addEventListener("mouseenter", () => {
      cursorEl.style.transform = "scale(2)";
      ringEl.style.transform = "scale(1.5)";
    });
    element.addEventListener("mouseleave", () => {
      cursorEl.style.transform = "scale(1)";
      ringEl.style.transform = "scale(1)";
    });
  });
}

if (window.matchMedia("(pointer: fine)").matches && cursorEl && ringEl) {
  document.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorEl.style.left = `${mouseX - 4}px`;
    cursorEl.style.top = `${mouseY - 4}px`;
  });
  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ringEl.style.left = `${ringX - 16}px`;
    ringEl.style.top = `${ringY - 16}px`;
    window.requestAnimationFrame(animateRing);
  };
  animateRing();
}

document.querySelectorAll('input[name="deliveryMethod"]').forEach(input => {
  input.checked = input.value === deliveryMethod;
  input.addEventListener("change", event => {
    deliveryMethod = event.target.value;
    localStorage.setItem("sepiah-delivery-method", deliveryMethod);
    updateCheckoutState();
  });
});

setupPageTransition();
renderProducts();
updateCartUI();
refreshCursorTargets();
