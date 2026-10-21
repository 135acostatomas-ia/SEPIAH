/* ============================================
   VATOS — Fragancias · main.js
============================================ */

const WPP_NUMBER = "5491164562757";

/* ── PRODUCTOS ──────────────────────────── */

const PRODUCTS = [
  { id: 20, name: "Lattafa Khamrah",                cat: "fragancia", price: 16000, img: "img/productos/Fragancias/LattafaKhamrah.png",       tag: null },
  { id: 21, name: "Lattafa Asad",                   cat: "fragancia", price: 16000, img: "img/productos/Fragancias/LattafaAsad.png",          tag: null },
  { id: 22, name: "Afnan 9PM Negro",                cat: "fragancia", price: 16000, img: "img/productos/Fragancias/afnan9pm.png",             tag: null },
  { id: 23, name: "Armaf Club de Nuit Intense Man", cat: "fragancia", price: 16000, img: "img/productos/Fragancias/armafclub.png",            tag: null },
  { id: 24, name: "Afnan 9PM Night Out",            cat: "fragancia", price: 16000, img: "img/productos/Fragancias/AFNAN-9PM-NIGHT-OUT.png",  tag: null },
  { id: 25, name: "Lattafa Badee Al Oud",           cat: "fragancia", price: 16000, img: "img/productos/Fragancias/LATTAFA-BADEE-AL-OUD.png", tag: null },
  { id: 26, name: "Lattafa The Kingdom",            cat: "fragancia", price: 16000, img: "img/productos/Fragancias/LATTAFA-THE-KINGDOMG.png", tag: null },
];

/* ── CARRITO ────────────────────────────── */

let cart = [];

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const exists = cart.find(i => i.id === id);
  if (exists) {
    exists.qty += 1;
    showToast(`${product.name} — Cantidad: ${exists.qty}`);
  } else {
    cart.push({ ...product, qty: 1 });
    showToast(`${product.name} — Agregado ✓`);
  }
  updateCartUI();
  renderProducts();
}

function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += 1;
  updateCartUI();
  renderProducts();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    cart = cart.filter(i => i.id !== id);
    showToast(`${item.name} — Eliminado`);
  }
  updateCartUI();
  renderProducts();
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  cart = cart.filter(i => i.id !== id);
  showToast(`${item.name} — Eliminado`);
  updateCartUI();
  renderProducts();
}

function updateCartUI() {
  const countEl   = document.getElementById('cartCount');
  const itemsEl   = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  const bnCountEl = document.getElementById('bnCount');

  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
  countEl.textContent = totalQty;
  if (bnCountEl) bnCountEl.textContent = totalQty;

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  totalEl.textContent = `$${total.toLocaleString('es-AR')}`;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        CARRITO VACÍO<br><br>
        <span>// AGREGÁ FRAGANCIAS</span>
      </div>`;
    return;
  }

  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">${i.img ? `<img src="${i.img}" alt="${i.name}">` : ''}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">$${(i.price * i.qty).toLocaleString('es-AR')}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="decreaseQty(${i.id})">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" onclick="increaseQty(${i.id})">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i.id})">✕</button>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

/* ── RENDER PRODUCTOS ───────────────────── */

function renderProducts() {
  const grid = document.getElementById('productsGrid');

  grid.innerHTML = PRODUCTS.map(p => {
    const inCart  = cart.find(i => i.id === p.id);
    const tagHTML = p.tag
      ? `<div class="product-tag tag-${p.tag}">${p.tag === 'new' ? 'Nuevo' : 'Hot'}</div>`
      : '';

    const mediaHTML = p.img
      ? `<img class="product-img" src="${p.img}" alt="${p.name}">`
      : `<div class="product-placeholder">✦</div>`;

    const buttonHTML = inCart
      ? `
        <div class="card-qty-controls">
          <button class="qty-btn" onclick="event.stopPropagation(); decreaseQty(${p.id})">−</button>
          <span class="qty-num">${inCart.qty}</span>
          <button class="qty-btn" onclick="event.stopPropagation(); increaseQty(${p.id})">+</button>
        </div>
      `
      : `
        <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
          + Agregar
        </button>
      `;

    return `
      <div class="product-card" data-id="${p.id}" ${p.img ? `onclick="openLightbox('${p.img}', '${p.name}')"` : ''}>
        <div class="product-img-wrap">
          ${mediaHTML}
          ${tagHTML}
          <div class="card-overlay">
            ${buttonHTML}
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price">$${p.price.toLocaleString('es-AR')}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── WHATSAPP ───────────────────────────── */

function sendToWhatsApp() {
  if (cart.length === 0) {
    showToast('Agregá fragancias primero 🌿');
    return;
  }

  const lines = cart.map(i =>
    `• ${i.name} x${i.qty} — $${(i.price * i.qty).toLocaleString('es-AR')}`
  );
  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  const msg = [
    `✦ *Pedido desde Vatos Fragancias*`,
    ``,
    ...lines,
    ``,
    `*Total: $${total.toLocaleString('es-AR')}*`,
    ``,
    `Quiero hacer este pedido!`
  ].join('\n');

  const url = `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/* ── TOAST ──────────────────────────────── */

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── CURSOR ─────────────────────────────── */

const cursorEl = document.getElementById('cursor');
const ringEl   = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursorEl.style.left = mx - 6 + 'px';
  cursorEl.style.top  = my - 6 + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ringEl.style.left = rx - 18 + 'px';
  ringEl.style.top  = ry - 18 + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('button, a, .product-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorEl.style.transform = 'scale(2)';
    ringEl.style.transform   = 'scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursorEl.style.transform = 'scale(1)';
    ringEl.style.transform   = 'scale(1)';
  });
});

/* ── CARRUSEL ───────────────────────────── */

let carouselIndex = 0;
let carouselInterval = null;

function startCarousel() {
  stopCarousel();
  carouselIndex = 0;
  updateCarousel();
  carouselInterval = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % 2;
    updateCarousel();
  }, 6000);
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

function goToSlide(index) {
  carouselIndex = index;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots  = document.querySelectorAll('.dot');
  if (!track) return;
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

/* ── TOUCH SWIPE ────────────────────────── */

let touchStartX = 0;
let touchEndX   = 0;

document.addEventListener('touchstart', e => {
  if (!document.getElementById('carouselTrack')) return;
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  if (!document.getElementById('carouselTrack')) return;
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    carouselIndex = diff > 0
      ? Math.min(carouselIndex + 1, 1)
      : Math.max(carouselIndex - 1, 0);
    updateCarousel();
  }
});

/* ── LIGHTBOX ───────────────────────────── */

function openLightbox(src, alt) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox-overlay" onclick="closeLightbox()"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" onclick="closeLightbox()">✕</button>
      <img src="${src}" alt="${alt}">
    </div>`;
  document.body.appendChild(lb);
  setTimeout(() => lb.classList.add('active'), 10);
}

function closeLightbox() {
  const lb = document.querySelector('.lightbox');
  if (!lb) return;
  lb.classList.remove('active');
  setTimeout(() => lb.remove(), 300);
}

/* ── INIT ───────────────────────────────── */

renderProducts();
startCarousel();
