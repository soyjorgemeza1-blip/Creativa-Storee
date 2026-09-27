import "./style.css";

const defaultProducts = [
  {
    id: 1,
    title: "Vaso Aurora",
    category: "Vasos",
    price: 18,
    oldPrice: 24,
    rating: "4.9",
    label: "Envio gratis",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    title: "Taza Corazon",
    category: "Tazas",
    price: 22,
    oldPrice: null,
    rating: "4.8",
    label: "Ultimas unidades",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    title: "Taza Alba",
    category: "Tazas",
    price: 26,
    oldPrice: 32,
    rating: "5.0",
    label: "Hecha a mano",
    image:
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    title: "Termo Rosa Bloom",
    category: "Termos",
    price: 38,
    oldPrice: null,
    rating: "4.7",
    label: "Nuevo",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 5,
    title: "Set Regalo Bonito",
    category: "Regalos",
    price: 45,
    oldPrice: 55,
    rating: "4.8",
    label: "Envio gratis",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 6,
    title: "Detalle Dulce",
    category: "Detalles",
    price: 16,
    oldPrice: null,
    rating: "4.9",
    label: "Edicion limitada",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=85",
  },
];

let products =
  JSON.parse(localStorage.getItem("creativa-products") || "null") ||
  defaultProducts;

let cart = JSON.parse(localStorage.getItem("creativa-cart") || "[]");
let selectedCategory = "Ver todo";
let query = "";
let sortOrder = "featured";
let favoritesOnly = false;
let favorites = new Set(
  JSON.parse(localStorage.getItem("creativa-favorites") || "[]"),
);
let reviews = JSON.parse(localStorage.getItem("creativa-reviews") || "{}");
let discount = 0;
let adminLoggedIn = sessionStorage.getItem("creativa-admin") === "true";
const activeCustomerSessionKey = (phone) => `creativa-active-customer-session:${phone}`;
const app = document.querySelector("#app");

function getActiveCustomerSession(phone) {
  try {
    return JSON.parse(localStorage.getItem(activeCustomerSessionKey(phone)) || "null");
  } catch {
    return null;
  }
}

function hasActiveCustomerSession() {
  const phone = sessionStorage.getItem("creativa-customer-phone");
  const sessionId = sessionStorage.getItem("creativa-customer-session-id");
  const activeSession = getActiveCustomerSession(phone);
  return Boolean(phone && sessionId && activeSession?.phone === phone && activeSession?.id === sessionId);
}

function clearCustomerSession() {
  sessionStorage.removeItem("creativa-customer-phone");
  sessionStorage.removeItem("creativa-customer-session-id");
}

function getProductRating(product) {
  const productReviews = reviews[product.id] || [];
  if (!productReviews.length) return "5.0";
  const average = productReviews.reduce((sum, review) => sum + Number(review.rating), 0) / productReviews.length;
  return average.toFixed(1);
}

function saveProducts() {
  localStorage.setItem("creativa-products", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("creativa-cart", JSON.stringify(cart));
}

function createOrderSummary() {
  const grouped = products
    .map((product) => ({
      product,
      quantity: cart.filter((item) => item.id === product.id).length,
    }))
    .filter((item) => item.quantity);
  const lines = grouped.map(
    ({ product, quantity }) => `${quantity} x ${product.title} ($${product.price} c/u)`,
  );
  const total = cart.reduce((sum, product) => sum + product.price, 0);
  return `${lines.join("\n")}\n\nTotal: $${total}`;
}

function adminProductRow(product) {
  return `<div class="admin-product-row"><img src="${product.image}" alt=""><div><b>${product.title}</b><small>${product.category} · $${product.price}</small></div><button type="button" data-edit-product="${product.id}">Editar</button><button type="button" data-delete-product="${product.id}" aria-label="Eliminar ${product.title}">×</button></div>`;
}

function renderAdminProducts() {
  const list = document.querySelector("#admin-product-list");
  if (list) list.innerHTML = products.map(adminProductRow).join("");
}

function openAdmin() {
  document.querySelector("#admin-modal").classList.add("open");
  document.querySelector("#admin-overlay").classList.add("visible");
  document.querySelector("#admin-login").hidden = adminLoggedIn;
  document.querySelector("#admin-panel").hidden = !adminLoggedIn;
  renderAdminProducts();
}

function closeAdmin() {
  document.querySelector("#admin-modal").classList.remove("open");
  document.querySelector("#admin-overlay").classList.remove("visible");
  document.querySelector("#admin-password").value = "";
}

function productCard(product) {
  const isFavorite = favorites.has(product.id);
  return `<article class="product-card" data-product="${product.id}"><div class="product-image"><img src="${product.image}" alt="${product.title}"><span>${product.label}</span><button class="heart-button ${isFavorite ? "active" : ""}" type="button" aria-label="Guardar ${product.title}" data-favorite="${product.id}">${isFavorite ? "♥" : "♡"}</button></div><div class="product-info"><p class="product-category">${product.category}</p><h3>${product.title}</h3><div class="price-line">$${product.price}<small>${product.oldPrice ? `$${product.oldPrice}` : ""}</small></div><div class="product-footer"><span>★ ${getProductRating(product)}</span><button type="button" data-add="${product.id}">Agregar <b>+</b></button></div></div></article>`;
}

function openProductDetails(product) {
  const detail = document.querySelector("#product-detail");
  detail.querySelector(".detail-image").src = product.image;
  detail.querySelector(".detail-image").alt = product.title;
  detail.querySelector(".detail-category").textContent = product.category;
  detail.querySelector(".detail-title").textContent = product.title;
  detail.querySelector(".detail-price").textContent = `$${product.price}`;
  detail.querySelector(".detail-old-price").textContent = product.oldPrice ? `$${product.oldPrice}` : "";
  detail.querySelector(".detail-rating").textContent = `★ ${getProductRating(product)}`;
  detail.querySelector(".detail-label").textContent = product.label;
  detail.querySelector(".detail-description").textContent = `Un detalle especial de nuestra colección de ${product.category.toLowerCase()}, elegido para acompañar tus momentos favoritos.`;
  const currentPhone = sessionStorage.getItem("creativa-customer-phone");
  const currentUsers = JSON.parse(localStorage.getItem("creativa-users") || "[]");
  const currentUser = currentUsers.find((user) => user.phone === currentPhone);
    document.querySelector("#review-name").value = currentUser?.name || currentPhone || "Cliente";
    document.querySelector("#review-name").setAttribute("readonly", true);
  renderReviews(product.id);
  detail.dataset.productId = product.id;
  detail.classList.add("open");
  document.querySelector("#product-detail-overlay").classList.add("visible");
}

function renderReviews(productId) {
  const list = document.querySelector("#review-list");
  const productReviews = reviews[productId] || [];
  list.innerHTML = productReviews.length
    ? productReviews.map((review) => `<article class="review-item"><div class="review-meta"><b>${review.name}</b><span>${"★".repeat(review.rating)}</span></div><p>${review.text}</p></article>`).join("")
    : '<p class="no-reviews">Todavía no hay reseñas. Sé la primera persona en compartir su opinión.</p>';
}

function closeProductDetails() {
  document.querySelector("#product-detail").classList.remove("open");
  document.querySelector("#product-detail-overlay").classList.remove("visible");
}

function renderProducts() {
  const filtered = products.filter(
    (product) =>
      (!favoritesOnly || favorites.has(product.id)) &&
      (selectedCategory === "Ver todo" ||
        product.category === selectedCategory) &&
      product.title.toLowerCase().includes(query.toLowerCase()),
  );
  if (sortOrder === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sortOrder === "rating")
    filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
  document.querySelector("#product-grid").innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : '<p class="empty-state">No encontramos productos con esa busqueda.</p>';
}

function updateCart() {
  const count = cart.length;
  const subtotal = cart.reduce((sum, product) => sum + product.price, 0);
  const total = Math.max(0, subtotal - discount);
  const grouped = products
    .map((product) => ({
      product,
      quantity: cart.filter((item) => item.id === product.id).length,
    }))
    .filter((item) => item.quantity);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#favorite-count").textContent = favorites.size;
  const visibleFavoriteCount = document.querySelector("#view-favorite-count");
  if (visibleFavoriteCount) visibleFavoriteCount.textContent = favorites.size;
  document.querySelector("#cart-total").textContent = `$${total}`;
  document.querySelector("#cart-items").innerHTML = count
    ? grouped
        .map(
          ({ product, quantity }) =>
            `<li><img src="${product.image}" alt=""><span>${product.title}<small>$${product.price} c/u</small><div class="quantity"><button data-decrease="${product.id}" aria-label="Disminuir cantidad">−</button><b>${quantity}</b><button data-increase="${product.id}" aria-label="Aumentar cantidad">+</button></div></span><button data-remove="${product.id}" aria-label="Quitar ${product.title}">×</button></li>`,
        )
        .join("")
    : '<li class="cart-empty">Aun no tienes productos.</li>';
}

app.innerHTML = `
  <div class="announcement">Envío gratis en pedidos mayores a $60 <span>·</span> 10% de descuento con el código <b>CREATIVA10</b></div><header class="topbar"><a class="brand" href="#inicio" aria-label="Creativa Storee, inicio"><i>c</i><span>Creativa<br><b>storee</b></span></a><nav aria-label="Navegacion principal"><a href="#productos">Explorar</a><a href="#categorias">Categorias</a><a href="#vendedores">Vender</a></nav><div class="top-actions"><button class="admin-button" type="button" id="admin-toggle">⚙ Administrar</button><button class="location" type="button">⌖ <span>Entregas en<br><b>Nayarit</b></span></button><button class="favorites-button" type="button" aria-label="Productos favoritos">♡ <strong id="favorite-count">0</strong></button><button id="cart-toggle" class="cart-button" type="button" aria-label="Abrir carrito">Bag <strong id="cart-count">0</strong></button></div></header>
  <main id="inicio"><section class="hero-section"><div class="hero-copy"><p class="eyebrow">UNA NUEVA FORMA DE ENCONTRAR</p><h1>Todo lo que<br>imaginas, <em>cerca.</em></h1><p class="hero-text">Piezas especiales, marcas independientes y objetos que le dan personalidad a tus dias.</p><a class="primary-button" href="#productos">Descubrir la tienda <span>↘</span></a><div class="hero-proof"><div class="hero-logo" aria-label="Creativa Storee, estudio y tienda de regalos personalizados"><span class="hero-logo-heart">♡</span><span class="hero-logo-name">Creativa<br><b>Storee</b></span><small>ESTUDIO Y TIENDA DE REGALOS<br>PERSONALIZADOS</small></div></div></div><div class="hero-art"><div class="sun"></div><img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1100&q=90" alt="Taza artesanal de Creativa Storee"><div class="hero-sticker">✦<span>SELECCION<br>CON ALMA</span></div><div class="shipping-note"><b>48h</b><span>Envios rapidos<br>a todo Mexico</span></div></div></section>
  <section class="category-section" id="categorias"><div class="section-heading"><div><p class="eyebrow">EXPLORA A TU MANERA</p><h2>Que estas buscando?</h2></div></div><div class="categories"><button class="category-card selected" data-category="Ver todo"><span class="category-icon all-icon">✦</span>Ver todo <small>+1,240 productos</small></button><button class="category-card" data-category="Vasos"><span class="category-icon">◌</span>Vasos <small>128 productos</small></button><button class="category-card" data-category="Tazas"><span class="category-icon">⌒</span>Tazas <small>214 productos</small></button><button class="category-card" data-category="Termos"><span class="category-icon">▯</span>Termos <small>96 productos</small></button><button class="category-card" data-category="Regalos"><span class="category-icon">✧</span>Regalos <small>184 productos</small></button><button class="category-card" data-category="Detalles"><span class="category-icon">♡</span>Detalles <small>156 productos</small></button></div></section>
  <section class="products-section" id="productos"><div class="products-top"><div><p class="eyebrow">RECIEN LLEGADOS</p><h2 id="products-title">Hallazgos para ti</h2></div><div class="catalog-tools"><button class="show-all-button" type="button" id="show-all-button" hidden>Ver todos</button><label class="search"><span>⌕</span><input id="search-input" type="search" placeholder="Busca algo especial"></label><label class="sort-label">Ordenar <select id="sort-select"><option value="featured">Destacados</option><option value="price-low">Precio menor</option><option value="price-high">Precio mayor</option><option value="rating">Mejor valorados</option></select></label></div></div><div id="product-grid" class="product-grid"></div></section>
  <section class="trust-strip" aria-label="Beneficios de compra"><div><b>✦</b><span><strong>Hecho con cariño</strong>Productos seleccionados</span></div><div><b>↗</b><span><strong>Envíos a todo México</strong>Recibe en 48 horas</span></div><div><b>♡</b><span><strong>Compra segura</strong>Tu confianza primero</span></div></section>
  </main>
  <aside class="cart-drawer" id="cart-drawer" aria-label="Tu carrito"><div class="cart-head"><h2>Tu bolsa</h2><button type="button" id="cart-close" aria-label="Cerrar carrito">×</button></div><div class="cart-shipping"><span id="cart-shipping">Te faltan $60 para envio gratis</span><div><i id="cart-progress"></i></div></div><ul id="cart-items"></ul><div class="cart-bottom"><div class="cart-actions"><button type="button" id="clear-cart">Vaciar bolsa</button><label>Código <input id="coupon-input" placeholder="CREATIVA10"></label><button type="button" id="coupon-button">Aplicar</button></div><p>Total <b id="cart-total">$0</b></p><button type="button" id="checkout-button">Continuar compra <span>→</span></button></div></aside><section class="newsletter"><div><p class="eyebrow">NOTAS BONITAS, DIRECTO A TU CORREO</p><h2>Inspírate y descubre lo nuevo.</h2></div><form id="newsletter-form"><input type="email" required placeholder="Tu correo electrónico" aria-label="Tu correo electrónico"><button type="submit">Suscribirme <span>↗</span></button></form></section><footer class="footer"><a class="brand" href="#inicio"><i>c</i><span>Creativa<br><b>storee</b></span></a><p>Regalos que cuentan historias.</p><div><a href="#productos">Tienda</a><a href="#vendedores">Vende con nosotros</a><a href="mailto:hola@creativastoree.com">Contacto</a></div><small>© 2026 Creativa Storee</small></footer><div class="admin-overlay" id="admin-overlay"></div><section class="admin-modal" id="admin-modal" aria-label="Panel de administrador"><button class="admin-close" type="button" id="admin-close" aria-label="Cerrar administrador">×</button><div id="admin-login" class="admin-login"><p class="eyebrow">ZONA PRIVADA</p><h2>Administrar tienda</h2><p>Solo el dueño puede modificar el catálogo.</p><form id="admin-login-form"><label>Contraseña<input id="admin-password" type="password" required placeholder="Contraseña"></label><button type="submit">Entrar <span>→</span></button></form><small>Demo local: <b>admin123</b></small></div><div id="admin-panel" class="admin-panel" hidden><div class="admin-heading"><div><p class="eyebrow">PANEL DE CONTROL</p><h2>Tu catálogo</h2></div><button type="button" id="admin-logout">Cerrar sesión</button></div><form id="product-form" class="product-form"><input type="hidden" id="product-id"><label>Producto<input id="product-title" required placeholder="Nombre del producto"></label><label>Categoría<select id="product-category"><option>Vasos</option><option>Tazas</option><option>Termos</option><option>Regalos</option><option>Detalles</option></select></label><label>Precio<input id="product-price" required type="number" min="0" step="1" placeholder="25"></label><label>Precio anterior<input id="product-old-price" type="number" min="0" step="1" placeholder="Opcional"></label><label>Etiqueta<input id="product-label" required placeholder="Nuevo"></label><label class="full-field">Imagen (URL)<input id="product-image" required type="url" placeholder="https://..."></label><button class="save-product" type="submit">Guardar producto <span>↗</span></button><button class="cancel-product" type="button" id="cancel-product">Limpiar</button></form><div class="admin-list-head"><h3>Productos publicados</h3><span id="admin-product-count"></span></div><div id="admin-product-list" class="admin-product-list"></div></div></section><div id="overlay" class="overlay"></div><div class="toast" id="toast" role="status"></div>`;

document.querySelector(".hero-logo").outerHTML = `<img class="hero-logo-image" src="${import.meta.env.BASE_URL}logo-creativa-transparent.png" alt="Creativa Storee, estudio y tienda de regalos personalizados">`;
renderProducts();
updateCart();
document.querySelector(".announcement").textContent =
  "Entregas en La Peñita y alrededores";
document.querySelector(".products-top .eyebrow").textContent = "CATÁLOGO";
document.querySelector(".hero-copy h1").innerHTML = "Cosas bonitas,<br><em>cerquita de ti.</em>";
document.querySelector(".hero-text").textContent =
  "Regalos, tazas y detalles hechos para alegrarte el día o sorprender a alguien especial.";
document.querySelector(".catalog-tools").insertAdjacentHTML(
  "afterbegin",
  '<div class="catalog-view" role="group" aria-label="Vista del catálogo"><button class="catalog-view-button active" id="view-all" type="button">Ver todo</button><button class="catalog-view-button" id="view-favorites" type="button">Favoritos <strong id="view-favorite-count">0</strong></button></div>',
);
document.querySelector(".top-actions").insertAdjacentHTML(
  "afterbegin",
  '<div class="account-control"><button class="account-button" id="account-toggle" type="button">Mi cuenta</button><span class="account-user-name" id="account-user-name" hidden></span></div>',
);
document.body.insertAdjacentHTML(
  "beforeend",
  '<div class="customer-overlay" id="customer-overlay"></div><section class="customer-modal" id="customer-modal" aria-label="Acceso a Creativa Storee"><div class="customer-login"><p class="eyebrow">BIENVENIDO A CREATIVA STOREE</p><h2 id="customer-title">Inicia sesión</h2><p id="customer-description">Entra para guardar tus favoritos y pedidos.</p><div class="auth-tabs"><button class="auth-tab active" id="login-tab" type="button">Iniciar sesión</button><button class="auth-tab" id="register-tab" type="button">Registrarse</button></div><form id="customer-login-form"><label id="customer-name-field" hidden>Nombre<input id="customer-name" type="text" autocomplete="name" placeholder="Tu nombre"></label><label>Número de teléfono<input id="customer-phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="311 123 4567"></label><label>Contraseña<input id="customer-password" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label><button type="submit" id="customer-submit">Entrar <span>→</span></button></form><small>Tu sesión se mantiene mientras esta pestaña esté abierta.</small></div></section>',
);
document.body.insertAdjacentHTML(
  "beforeend",
  '<div class="product-detail-overlay" id="product-detail-overlay"></div><section class="product-detail" id="product-detail" aria-label="Información del producto"><button class="detail-close" id="detail-close" type="button" aria-label="Cerrar detalles">×</button><div class="detail-layout"><img class="detail-image" src="" alt=""><div class="detail-copy"><span class="detail-label"></span><p class="detail-category"></p><h2 class="detail-title"></h2><div class="detail-price-line"><b class="detail-price"></b><small class="detail-old-price"></small><span class="detail-rating"></span></div><p class="detail-description"></p><button class="detail-add" id="detail-add" type="button">Agregar a la bolsa <b>+</b></button></div><aside class="reviews-panel"><div class="reviews-heading"><div><p class="eyebrow">OPINIONES</p><h3>Lo que dicen</h3></div><span class="review-stars">★★★★★</span></div><div id="review-list" class="review-list"></div><form id="review-form" class="review-form"><input id="review-name" required placeholder="Tu nombre" aria-label="Tu nombre"><select id="review-rating" aria-label="Puntuación"><option value="5">5 estrellas</option><option value="4">4 estrellas</option><option value="3">3 estrellas</option><option value="2">2 estrellas</option><option value="1">1 estrella</option></select><textarea id="review-text" required rows="3" placeholder="Escribe tu reseña" aria-label="Escribe tu reseña"></textarea><button type="submit">Publicar reseña <span>↗</span></button></form></aside></div></section>',
);
const customerModal = document.querySelector("#customer-modal");
const customerPhone = document.querySelector("#customer-phone");
const customerPassword = document.querySelector("#customer-password");
const customerName = document.querySelector("#customer-name");
const customerNameField = document.querySelector("#customer-name-field");
customerNameField.firstChild.textContent = "Nombre y apellido";
customerName.placeholder = "Nombre y apellido";
let authMode = "login";
function normalizeCustomerName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");
}
function renderAccountName() {
  const phone = sessionStorage.getItem("creativa-customer-phone");
  const users = JSON.parse(localStorage.getItem("creativa-users") || "[]");
  const name = users.find((user) => user.phone === phone)?.name || "";
  const nameElement = document.querySelector("#account-user-name");
  nameElement.textContent = name;
  nameElement.hidden = !name;
  nameElement.title = name;
}
function setAuthMode(mode) {
  authMode = mode;
  const register = mode === "register";
  document.querySelector("#login-tab").classList.toggle("active", !register);
  document.querySelector("#register-tab").classList.toggle("active", register);
  document.querySelector("#customer-title").textContent = register ? "Crea tu cuenta" : "Inicia sesión";
  document.querySelector("#customer-description").textContent = register ? "Regístrate para guardar tus favoritos y pedidos." : "Entra para guardar tus favoritos y pedidos.";
  document.querySelector("#customer-name-field").hidden = !register;
  document.querySelector("#customer-name").required = register;
  document.querySelector("#customer-submit").firstChild.textContent = register ? "Crear cuenta " : "Entrar ";
  customerPassword.autocomplete = register ? "new-password" : "current-password";
}
function openCustomerLogin() {
  customerModal.classList.add("open");
  document.querySelector("#customer-overlay").classList.add("visible");
  customerPhone.value = "";
  customerPassword.value = "";
  customerPhone.focus();
}
function closeCustomerLogin() {
  customerModal.classList.remove("open");
  document.querySelector("#customer-overlay").classList.remove("visible");
}
if (sessionStorage.getItem("creativa-customer-phone") && !hasActiveCustomerSession()) {
  clearCustomerSession();
}
renderAccountName();
if (!hasActiveCustomerSession()) openCustomerLogin();
document.querySelector("#account-toggle").addEventListener("click", openCustomerLogin);
document.querySelector("#login-tab").addEventListener("click", () => setAuthMode("login"));
document.querySelector("#register-tab").addEventListener("click", () => setAuthMode("register"));
document.querySelector("#customer-overlay").addEventListener("click", () => {
  if (sessionStorage.getItem("creativa-customer-phone")) closeCustomerLogin();
});
window.addEventListener("storage", (event) => {
  const phone = sessionStorage.getItem("creativa-customer-phone");
  if (!phone || event.key !== activeCustomerSessionKey(phone) || hasActiveCustomerSession()) return;
  clearCustomerSession();
  renderAccountName();
  openCustomerLogin();
  showToast("Tu sesión se cerró porque iniciaste sesión en otra pestaña.");
});
document.querySelector("#customer-login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const phone = customerPhone.value.replace(/\D/g, "");
  if (phone.length < 10) {
    showToast("Escribe un número de teléfono válido.");
    return;
  }
  const users = JSON.parse(localStorage.getItem("creativa-users") || "[]");
  const user = users.find((item) => item.phone === phone);
  if (authMode === "register") {
    if (user) {
      showToast("Ese teléfono ya tiene una cuenta.");
      return;
    }
    const name = customerName.value.trim().replace(/\s+/g, " ");
    if (name.split(" ").length < 2) {
      showToast("Escribe tu nombre y apellido.");
      return;
    }
    if (users.some((item) => normalizeCustomerName(item.name) === normalizeCustomerName(name))) {
      showToast("Ese nombre y apellido ya está registrado.");
      return;
    }
    users.push({ phone, password: customerPassword.value, name });
    localStorage.setItem("creativa-users", JSON.stringify(users));
  } else if (!user || user.password !== customerPassword.value) {
    showToast("Teléfono o contraseña incorrectos.");
    return;
  }
  const sessionId = crypto.randomUUID();
  sessionStorage.setItem("creativa-customer-phone", phone);
  sessionStorage.setItem("creativa-customer-session-id", sessionId);
  localStorage.setItem(activeCustomerSessionKey(phone), JSON.stringify({ phone, id: sessionId }));
  renderAccountName();
  closeCustomerLogin();
  showToast("Sesión iniciada correctamente.");
});
updateCart();
document.querySelector(".location").innerHTML =
  "⌖ <span>Entregas en<br><b>La Peñita y alrededores</b></span>";
document.querySelector("#cart-shipping").textContent = "Entregas en La Peñita y alrededores";
document.querySelector("#cart-progress").parentElement.hidden = true;
document.querySelector("#admin-password").autocomplete = "new-password";
document.querySelectorAll('a[href="#vendedores"]').forEach((link) => link.remove());
window.addEventListener("pagehide", () => {
  sessionStorage.removeItem("creativa-admin");
  document.querySelector("#admin-password").value = "";
});
document.addEventListener("click", (event) => {
  const category = event.target.closest("[data-category]");
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const favorite = event.target.closest("[data-favorite]");
  const productCardElement = event.target.closest("[data-product]");
  const editProduct = event.target.closest("[data-edit-product]");
  const deleteProduct = event.target.closest("[data-delete-product]");
  if (category) {
    selectedCategory = category.dataset.category;
    document
      .querySelectorAll("[data-category]")
      .forEach((button) =>
        button.classList.toggle("selected", button === category),
      );
    renderProducts();
  }
  if (add) {
    const product = products.find(
      (item) => item.id === Number(add.dataset.add),
    );
    cart.push(product);
    saveCart();
    updateCart();
    showToast(`${product.title} se agrego a tu bolsa`);
  }
  if (remove) {
    cart.splice(
      cart.findIndex((item) => item.id === Number(remove.dataset.remove)),
      1,
    );
    saveCart();
    updateCart();
  }
  if (increase) {
    const product = products.find(
      (item) => item.id === Number(increase.dataset.increase),
    );
    cart.push(product);
    saveCart();
    updateCart();
  }
  if (decrease) {
    const index = cart.findIndex(
      (item) => item.id === Number(decrease.dataset.decrease),
    );
    if (index > -1) cart.splice(index, 1);
    saveCart();
    updateCart();
  }
  if (favorite) {
    const id = Number(favorite.dataset.favorite);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    localStorage.setItem("creativa-favorites", JSON.stringify([...favorites]));
    renderProducts();
    updateCart();
  }
  if (productCardElement && !event.target.closest("button")) {
    const product = products.find((item) => item.id === Number(productCardElement.dataset.product));
    if (product) openProductDetails(product);
  }
  if (editProduct) {
    const product = products.find(
      (item) => item.id === Number(editProduct.dataset.editProduct),
    );
    document.querySelector("#product-id").value = product.id;
    document.querySelector("#product-title").value = product.title;
    document.querySelector("#product-category").value = product.category;
    document.querySelector("#product-price").value = product.price;
    document.querySelector("#product-old-price").value = product.oldPrice || "";
    document.querySelector("#product-label").value = product.label;
    document.querySelector("#product-image").value = product.image;
    document.querySelector("#product-title").focus();
  }
  if (deleteProduct) {
    products = products.filter(
      (item) => item.id !== Number(deleteProduct.dataset.deleteProduct),
    );
    saveProducts();
    renderProducts();
    renderAdminProducts();
    showToast("Producto eliminado.");
  }
});
document.querySelector("#search-input").addEventListener("input", (event) => {
  query = event.target.value;
  renderProducts();
});
document.querySelector(".favorites-button").addEventListener("click", () => {
  setCatalogView(true);
});
document.querySelector("#view-all").addEventListener("click", () => {
  setCatalogView(false);
});
document.querySelector("#view-favorites").addEventListener("click", () => {
  setCatalogView(true);
});
function setCatalogView(showFavorites) {
  favoritesOnly = showFavorites;
  document.querySelector("#view-all").classList.toggle("active", !showFavorites);
  document.querySelector("#view-favorites").classList.toggle("active", showFavorites);
  document.querySelector("#products-title").textContent = showFavorites ? "Mis favoritos" : "Hallazgos para ti";
  renderProducts();
  const catalogHeader = document.querySelector(".products-top");
  const catalogPosition = catalogHeader.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: catalogPosition, behavior: "smooth" });
}
document.querySelector("#sort-select").addEventListener("change", (event) => {
  sortOrder = event.target.value;
  renderProducts();
});
document.querySelector("#detail-close").addEventListener("click", closeProductDetails);
document.querySelector("#product-detail-overlay").addEventListener("click", closeProductDetails);
document.querySelector("#detail-add").addEventListener("click", () => {
  const product = products.find((item) => item.id === Number(document.querySelector("#product-detail").dataset.productId));
  if (!product) return;
  cart.push(product);
  saveCart();
  updateCart();
  closeProductDetails();
  showToast(`${product.title} se agrego a tu bolsa`);
});
document.querySelector("#review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const productId = document.querySelector("#product-detail").dataset.productId;
  const currentPhone = sessionStorage.getItem("creativa-customer-phone");
  const currentUsers = JSON.parse(localStorage.getItem("creativa-users") || "[]");
  const currentUser = currentUsers.find((user) => user.phone === currentPhone);
  const review = {
    name: currentUser?.name || currentPhone || "Cliente",
    rating: Number(document.querySelector("#review-rating").value),
    text: document.querySelector("#review-text").value.trim(),
  };
  reviews[productId] = [review, ...(reviews[productId] || [])];
  localStorage.setItem("creativa-reviews", JSON.stringify(reviews));
  renderReviews(productId);
  renderProducts();
  const reviewedProduct = products.find((product) => product.id === Number(productId));
  document.querySelector(".detail-rating").textContent = `★ ${getProductRating(reviewedProduct)}`;
  event.target.reset();
  showToast("Tu reseña fue publicada.");
});
document.querySelector("#cart-toggle").addEventListener("click", toggleCart);
document.querySelector("#cart-close").addEventListener("click", toggleCart);
document.querySelector("#overlay").addEventListener("click", toggleCart);
const ownerWhatsapp = "5213221723696";
document.querySelector("#checkout-button").textContent = "Pedir por WhatsApp →";
document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Agrega un producto para preparar tu pedido.");
    return;
  }
  const message = encodeURIComponent(`Hola, quiero hacer este pedido en Creativa Storee:\n\n${createOrderSummary()}`);
  window.open(`https://wa.me/${ownerWhatsapp}?text=${message}`, "_blank");
});
document.querySelector("#clear-cart").addEventListener("click", () => {
  cart = [];
  saveCart();
  discount = 0;
  updateCart();
  showToast("Tu bolsa está vacía.");
});
document
  .querySelector("#newsletter-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    event.target.reset();
    showToast("Listo, recibirás nuestras novedades.");
  });
document.querySelector("#admin-toggle").addEventListener("click", openAdmin);
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
    event.preventDefault();
    openAdmin();
  }
});
document.querySelector("#admin-close").addEventListener("click", closeAdmin);
document.querySelector("#admin-overlay").addEventListener("click", closeAdmin);
document
  .querySelector("#admin-login-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    if (document.querySelector("#admin-password").value === "Salazar1.2") {
      adminLoggedIn = true;
      sessionStorage.setItem("creativa-admin", "true");
      openAdmin();
      showToast("Sesión de administrador iniciada.");
    } else showToast("Contraseña incorrecta.");
  });
document.querySelector("#admin-logout").addEventListener("click", () => {
  adminLoggedIn = false;
  sessionStorage.removeItem("creativa-admin");
  openAdmin();
  showToast("Sesión cerrada.");
});
document
  .querySelector("#cancel-product")
  .addEventListener("click", () =>
    document.querySelector("#product-form").reset(),
  );
document.querySelector("#product-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number(document.querySelector("#product-id").value);
  const data = {
    id: id || Date.now(),
    title: document.querySelector("#product-title").value.trim(),
    category: document.querySelector("#product-category").value,
    price: Number(document.querySelector("#product-price").value),
    oldPrice:
      Number(document.querySelector("#product-old-price").value) || null,
    rating: "5.0",
    label: document.querySelector("#product-label").value.trim(),
    image: document.querySelector("#product-image").value.trim(),
  };
  products = id
    ? products.map((product) => (product.id === id ? data : product))
    : [...products, data];
  saveProducts();
  renderProducts();
  renderAdminProducts();
  event.target.reset();
  showToast(id ? "Producto actualizado." : "Producto publicado.");
});
function toggleCart() {
  document.querySelector("#cart-drawer").classList.toggle("open");
  document.querySelector("#overlay").classList.toggle("visible");
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}
