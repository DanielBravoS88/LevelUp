
// ---------- UTILIDADES BÁSICAS ----------
// Atajos para seleccionar elementos del DOM (ahorran escribir)
const $ = (s, el=document) => el.querySelector(s);                 // devuelve el primer elemento que coincida
const $$ = (s, el=document) => [...el.querySelectorAll(s)];        // devuelve TODOS los elementos que coincidan (como array)

// Formateador de dinero a pesos chilenos (sin decimales)
const money = n => new Intl.NumberFormat(
  'es-CL',
  { style:'currency', currency:'CLP', maximumFractionDigits:0 }
).format(n || 0);

// Asegura que la página pueda hacer scroll vertical (por si el CSS lo bloquea)
document.documentElement.style.overflowY = 'auto';
document.body.style.overflowY = 'auto';


// ---------- CATÁLOGO ESTÁTICO (FALLBACK) ----------
// Si no existe products.json o falla el fetch, usamos estos productos
const staticGallery = [
  { name: "Accesorio Xbox Series", price: 19990, category: "Accesorios", description: "Batería recargable para Xbox Series.", image: "img/accesorio xbox Series_20.webp" },
  { name: "Audífonos Gamer Inalámbricos", price: 29990, category: "Accesorios", description: "Audífonos Inalámbricos.", image: "img/Audifonos-Gamer-Inalambricos.png" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Resident Evil Revelations", image: "img/nintendo1.jpg" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Rayman Legends Definitive Edition", image: "img/nintendo2.jpg" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Donkey Kong Country Returns HD.", image: "img/nintendo3.jpg" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "MINECRAFT.", image: "img/nintendo4.png" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Just Dance 2025.", image: "img/nintendo5.jpg" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Dragon Ball Fighter Z.", image: "img/nintendo6.jpg" },
  { name: "Nintendo Switch", price: 34999, category: "Switch", description: "Luigi's Mansion 3.", image: "img/nintendo7.jpg" },
  { name: "Estuche Nintendo Switch", price: 24990, category: "Accesorios", description: "Estuche Nintendo Switch.", image: "img/nintendo accesorio 1.jpg" },
  { name: "Control Nintendo", price: 24990, category: "Accesorios", description: "Control para Nintendo Switch.", image: "img/nintendo accesorio 2.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "Tony Hawk's Proskater 3", image: "img/play5-1.png" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "Tony Hawk ' Proskater 4", image: "img/play5-2.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "God of War Ragnarok", image: "img/play5-3.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "UFC 5", image: "img/play5-4.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "FC 24", image: "img/play5-5.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "Sonic SuperStars", image: "img/play5-6.jpg" },
  { name: "Play Station 5", price: 64999, category: "PS5", description: "Call of Duty Modern Warfare", image: "img/play5-7.jpg" },
  { name: "Control PS 5 ", price: 29990, category: "Accesorios", description: "Control para PS5.", image: "img/play5 accesorio 1.jpg" },
  { name: "Control Inalámbrico PS 5 ", price: 29990, category: "Accesorios", description: "Control Inalámbrico para PS5.", image: "img/play5 accesorio 2.avif" }
];


// ---------- ESTADO GLOBAL DE LA APP ----------
const state = {
  products: [],             // lista de productos cargados (JSON o fallback)
  filter: 'Todos',          // categoría activa
  q: '',                    // texto de búsqueda
  order: 'popular',         // criterio de orden
  cart: JSON.parse(localStorage.getItem('cart') || '[]') // carrito persistido
};


// ---------- CARGA DE PRODUCTOS (JSON o fallback) ----------
fetch('products.json')
  .then(r => {
    if (!r.ok) throw new Error('No JSON'); // si no hay JSON válido, forzamos el catch
    return r.json();
  })
  .then(list => {
    // si el JSON trae un array válido lo uso; si no, uso el estático
    state.products = Array.isArray(list) && list.length ? list : staticGallery;
    render(); // pinto el catálogo
    const grid = document.getElementById('grid');
    if (grid) grid.setAttribute('aria-busy', 'false'); // accesibilidad: ya no está "ocupado"
  })
  .catch(() => {
    // error al cargar JSON → uso el catálogo estático
    state.products = staticGallery;
    render();
    const grid = document.getElementById('grid');
    if (grid) grid.setAttribute('aria-busy', 'false');
  });


// ---------- RENDER DEL CATÁLOGO ----------
function render() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  // 1) Parto de todos los productos
  let items = [...state.products];

  // 2) Filtro por categoría (si no es "Todos")
  if (state.filter && state.filter !== 'Todos') {
    items = items.filter(p => p.category === state.filter);
  }

  // 3) Filtro por texto (nombre + descripción)
  if (state.q) {
    const q = state.q.toLowerCase();
    items = items.filter(p => (p.name + ' ' + (p.description || '')).toLowerCase().includes(q));
  }

  // 4) Orden (precio asc/desc o nombre asc)
  if (state.order === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (state.order === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (state.order === 'name-asc') items.sort((a, b) => a.name.localeCompare(b.name));

  // 5) Pinto las tarjetas en el grid
  grid.innerHTML = items.map(p => cardTpl(p)).join('');

  // 6) Actualizo los contadores del carrito (icono / dock)
  updateCounts();
}

// Plantilla de tarjeta de producto (HTML de cada card)
const cardTpl = (p) => `
  <article class="card" data-cat="${p.category}">
    <div class="media">
      <span class="tag">${p.category}</span>
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
    </div>
    <div class="body">
      <h3 class="title">${p.name}</h3>
      <div class="price">${money(p.price)}</div>
      <p class="desc">${(p.description || '').slice(0,120)}...</p>
      <div class="row">
        <!-- Paso el producto como string codificado para no perder campos -->
        <button class="btn" onclick='add("${encodeURIComponent(JSON.stringify(p))}")'>Agregar</button>
        <button class="btn primary" onclick='add("${encodeURIComponent(JSON.stringify(p))}");openCart()'>Comprar</button>
      </div>
    </div>
  </article>`;


// ---------- CARRITO: CRUD + PERSISTENCIA ----------
function add(encoded) {
  // Decodifico el producto que viene desde el botón
  const p = JSON.parse(decodeURIComponent(encoded));

  // Si ya existe en el carrito, aumento qty; si no, lo agrego con qty=1
  const found = state.cart.find(i => i.name === p.name);
  if (found) {
    found.qty += 1;
  } else {
    state.cart.push({ ...p, qty: 1 });
  }
  saveCart(); // guardo y redibujo
}

function remove(name) {
  // Elimina el producto por nombre
  state.cart = state.cart.filter(i => i.name !== name);
  saveCart();
}

function changeQty(name, d) {
  // Cambia la cantidad (d puede ser +1 o -1). Mínimo 1.
  const it = state.cart.find(i => i.name === name);
  if (!it) return;
  it.qty = Math.max(1, it.qty + d);
  saveCart();
}

function saveCart() {
  // Persisto el carrito y actualizo UI
  localStorage.setItem('cart', JSON.stringify(state.cart));
  drawCart();
  updateCounts();
}

function updateCounts() {
  // Cantidad total de ítems en el carrito (suma de qty)
  const c = state.cart.reduce((a, b) => a + b.qty, 0);
  const a = $('#cartCount');
  const b = $('#dockCount');
  if (a) a.textContent = c;
  if (b) b.textContent = c;
}

function openCart() {
  // Abre el panel del carrito y lo marca accesible
  const p = $('#cartPanel');
  if (!p) return;
  p.classList.add('open');
  p.setAttribute('aria-hidden', 'false');
  drawCart();
}

function closeCart() {
  // Cierra el panel del carrito
  const p = $('#cartPanel');
  if (!p) return;
  p.classList.remove('open');
  p.setAttribute('aria-hidden', 'true');
}

// Dibuja los ítems del carrito y el total
function drawCart() {
  const list = $('#cartItems');
  if (!list) return;

  // Render de cada ítem del carrito
  list.innerHTML = state.cart.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}"/>
      <div>
        <div style="font-weight:700">${i.name}</div>
        <div style="color:var(--text-2)">
          ${money(i.price)} ·
          <button class="btn" onclick='changeQty("${i.name}",-1)'>-</button>
          ${i.qty}
          <button class="btn" onclick='changeQty("${i.name}",1)'>+</button>
        </div>
      </div>
      <button class="btn" onclick='remove("${i.name}")'>Quitar</button>
    </div>`).join('');

  // Cálculo de total del carrito
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = money(total);
}


// ---------- BOLETA (RESUMEN DE LA COMPRA) ----------
function showReceipt() {
  // No dejo continuar si el carrito está vacío
  if (!state.cart.length) { alert('El carrito está vacío.'); return; }

  const fecha = new Date();
  const nroBoleta = Math.floor(Math.random() * 900000 + 100000); // número aleatorio

  // Descuento DUOC (si el email ingresado es @duoc.cl)
  let descuento = 0;
  let email = $('#email')?.value?.trim()?.toLowerCase() || '';
  if (/@duoc\.cl$/.test(email)) descuento = 0.2;

  // Armo filas e importes
  let totalSinDescuento = 0;
  let totalDescuento = 0;

  const items = state.cart.map(item => {
    const precioUnitario = item.price;
    const subtotal = precioUnitario * item.qty;

    let descuentoItem = 0;
    let precioFinal = subtotal;

    // Aplico descuento por ítem si corresponde
    if (descuento > 0) {
      descuentoItem = Math.round(subtotal * descuento);
      precioFinal = subtotal - descuentoItem;
    }

    totalSinDescuento += subtotal;
    totalDescuento += descuentoItem;

    // Fila del detalle
    return `
      <tr>
        <td>
          <div style="font-weight:600">${item.name}</div>
          <div style="font-size:12px;color:#888">${item.description || ''}</div>
        </td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${money(precioUnitario)}</td>
        <td style="text-align:right">${money(subtotal)}</td>
        <td style="text-align:right">${descuentoItem ? '-'+money(descuentoItem) : '<span style="color:#bbb">—</span>'}</td>
        <td style="text-align:right;font-weight:700">${money(precioFinal)}</td>
      </tr>
    `;
  }).join('');

  const totalFinal = totalSinDescuento - totalDescuento;

  // Estructura del modal de boleta
  const html = `
    <div class="modal open" id="receiptModal" style="z-index:100;">
      <div class="box" style="max-width:600px;background:linear-gradient(135deg,#181c2f 0%,#232a4d 100%);color:#fff;border-radius:18px;box-shadow:0 8px 32px #0004;">
        <div style="display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <div style="background:#fff;border-radius:50%;width:60px;height:60px;display:flex;align-items:center;justify-content:center;margin-right:12px;">
            <span style="font-family:Orbitron;font-size:2rem;color:#232a4d;font-weight:700;">LU</span>
          </div>
          <div>
            <h3 style="margin:0;font-family:Orbitron;font-size:1.5rem;color:#fff;">LevelUp Gamer</h3>
            <div style="font-size:13px;color:#b3b8d6;">Pedro Aguirre Cerda 5254, Huechuraba</div>
          </div>
        </div>

        <div style="font-size:13px;color:#b3b8d6;margin-bottom:12px;text-align:center">
          Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}<br>
          N° Boleta: <b style="color:#ffd700">${nroBoleta}</b>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:15px;background:#232a4d;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#232a4d;color:#ffd700">
              <th style="text-align:left;padding:8px">Producto</th>
              <th style="text-align:center;padding:8px">Cantidad</th>
              <th style="text-align:right;padding:8px">Precio unitario</th>
              <th style="text-align:right;padding:8px">Subtotal</th>
              <th style="text-align:right;padding:8px">Descuento</th>
              <th style="text-align:right;padding:8px">Total</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>

        <div style="display:flex;justify-content:flex-end;gap:32px;margin-bottom:10px">
          <div>
            <div style="color:#b3b8d6">Total sin descuento:</div>
            <div style="font-weight:700">${money(totalSinDescuento)}</div>
          </div>
          <div>
            <div style="color:#b3b8d6">Descuento aplicado:</div>
            <div style="font-weight:700;color:#ffd700">${descuento ? '-'+money(totalDescuento) : '$0'}</div>
          </div>
          <div>
            <div style="color:#b3b8d6">Total a pagar:</div>
            <div style="font-weight:700;font-size:18px;color:#ffd700">${money(totalFinal)}</div>
          </div>
        </div>

        <div style="text-align:right">
          <button class="btn primary" id="closeReceipt" style="background:#ffd700;color:#232a4d;font-weight:700;">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  // Inserto el modal y configuro el botón de cierre
  document.body.insertAdjacentHTML('beforeend', html);
  $('#closeReceipt').onclick = () => {
    $('#receiptModal').remove(); // cierro modal
    closeCart();                 // cierro panel de carrito
    state.cart = [];             // limpio carrito
    saveCart();                  // persisto vacío y actualizo UI
  };
}


// ---------- RESEÑAS EDITABLES ----------
let reviews = [
  {id:1, name:'Felipe Retamal', text:'Funciona perfecto. Primera compra y repetiré ✨', score:5, editing:false},
  {id:2, name:'Ronaldo Soto', text:'Confiables y rápidos. Feliz con la compra 😍', score:5, editing:false},
  {id:3, name:'Dgo', text:'Tercera vez comprando y plus todos los meses 🙌', score:5, editing:false},
];

// Pinta el bloque de reseñas según si están en modo lectura o edición
function renderReviews() {
  const container = document.getElementById('reviews');
  if (!container) return;

  container.innerHTML = '';
  reviews.forEach(review => {
    const div = document.createElement('div');
    div.className = 'review';

    // Si la reseña está en edición, muestro formulario inline
    if (review.editing) {
      div.innerHTML = `
        <form onsubmit="saveReview(event,${review.id})" class="review-edit-form">
          <input value="${review.name}" id="editName${review.id}" required style="margin-bottom:6px;width:100%;"/>
          <div class="stars" style="margin-bottom:6px;">${renderStars(review.score, review.id, true)}</div>
          <textarea id="editText${review.id}" required style="width:100%;margin-bottom:6px;">${review.text}</textarea>
          <button type="submit" class="btn primary">Guardar</button>
          <button type="button" class="btn" onclick="cancelEdit(${review.id})">Cancelar</button>
        </form>
      `;
    } else {
      // Modo lectura: nombre, estrellas, texto y botones
      div.innerHTML = `
        <strong>${review.name}</strong>
        <div class="stars">${renderStars(review.score, review.id, false)}</div>
        <p class="desc">${review.text}</p>
        <div style="margin-top:8px;">
          <button class="btn" onclick="editReview(${review.id})">Editar</button>
          <button class="btn" onclick="deleteReview(${review.id})">Borrar</button>
        </div>
      `;
    }
    container.appendChild(div);
  });
}

// Dibuja 5 estrellas; si es editable, permite click para cambiar la puntuación
function renderStars(score, id, editable) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span style="cursor:${editable?'pointer':'default'};color:${i<=score?'gold':'#888'}" ${editable?`onclick="setStars(${id},${i})"`:''}>&#9733;</span>`;
  }
  return html;
}

// Funciones globales para manejar edición, guardado, borrado y puntuación
window.setStars = function(id, score) {
  const review = reviews.find(r => r.id === id);
  if (review && review.editing) { review.score = score; renderReviews(); }
};
window.editReview = function(id) {
  reviews.forEach(r => r.editing = false);
  const review = reviews.find(r => r.id === id);
  if (review) review.editing = true;
  renderReviews();
};
window.cancelEdit = function(id) {
  const review = reviews.find(r => r.id === id);
  if (review) review.editing = false;
  renderReviews();
};
window.saveReview = function(e, id) {
  e.preventDefault();
  const review = reviews.find(r => r.id === id);
  if (review) {
    review.name = document.getElementById('editName' + id).value;
    review.text = document.getElementById('editText' + id).value;
    review.editing = false;
  }
  renderReviews();
};
window.deleteReview = function(id) {
  reviews = reviews.filter(r => r.id !== id);
  renderReviews();
};

// Pinta las reseñas al cargar
renderReviews();


// ---------- INTERACCIONES GENERALES ----------
// Abre carrito desde botón del header y del dock flotante
$$('#btnCart, #dockCart').forEach(b => b.addEventListener('click', openCart));

// Tecla Escape cierra carrito, login y boleta si están abiertos
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCart();
    $('#loginModal')?.classList.remove('open');
    $('#receiptModal')?.remove();
  }
});

// Click fuera del panel del carrito → cierra (comportamiento tipo "drawer")
document.body.addEventListener('click', e => {
  const panel = $('.cart-panel');
  if (!panel) return;
  const clickedCartBtn = e.target.closest('#btnCart, #dockCart');
  if (panel.classList.contains('open') && !e.target.closest('.cart-panel') && !clickedCartBtn) {
    closeCart();
  }
});


// ---------- FILTROS, ORDEN Y BÚSQUEDA ----------
// Ordenar (precio asc/desc, nombre)
const orderEl = $('#order');
if (orderEl) orderEl.addEventListener('change', e => { state.order = e.target.value; render(); });

// Búsqueda: reacciona al escribir y también con Enter o botón Buscar
const qEl = $('#q');
if (qEl) {
  qEl.addEventListener('input', e => { state.q = e.target.value; render(); });
  qEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); state.q = qEl.value; render(); }
  });
}
const btnSearch = $('#btnSearch');
if (btnSearch && qEl) btnSearch.addEventListener('click', () => { state.q = qEl.value; render(); });

// Chips / enlaces de navegación para filtrar por categoría
$$('.chip, nav a').forEach(ch => ch.addEventListener('click', e => {
  e.preventDefault();
  $$('.chip, nav a').forEach(c => c.classList.remove('active'));
  ch.classList.add('active');
  state.filter = ch.dataset.chip || ch.dataset.filter || 'Todos';
  render();
}));


// ---------- MODAL DE LOGIN + VALIDACIONES ----------
const btnLogin = $('#btnLogin');
if (btnLogin) btnLogin.addEventListener('click', () => $('#loginModal').classList.add('open'));

const closeLogin = $('#closeLogin');
if (closeLogin) closeLogin.addEventListener('click', () => $('#loginModal').classList.remove('open'));

const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const age = parseInt($('#age').value || '0', 10);
    if (age < 18) { alert('Debes ser mayor de 18 años para registrarte.'); return; }

    const email = $('#email').value.trim().toLowerCase();
    const isDuoc = /@duoc\.cl$/.test(email);
    const duocMsg = $('#duocMsg');

    // Mensaje personalizado si es correo DUOC
    if (duocMsg) duocMsg.textContent = isDuoc
      ? '🎉 Descuento permanente de 20% aplicado a tu cuenta (@duoc.cl)'
      : 'Cuenta creada. ¡Bienvenid@ a LevelUp!';

    // Cierro el modal con un pequeño delay (animación)
    setTimeout(() => $('#loginModal').classList.remove('open'), 1200);
  });
}


// ---------- PEQUEÑOS DETALLES ----------
// Año dinámico en el footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Suscripción simple (muestra un aviso)
const btnSub = $('#btnSubscribe');
if (btnSub) btnSub.addEventListener('click', () => {
  alert('Suscripción registrada. Revisa tu correo para el cupón de -20% en tu primera compra.');
});

// Botón de pagar → abre boleta/resumen
const checkout = $('#checkout');
if (checkout) checkout.addEventListener('click', showReceipt);


// ======================================================
// BANNER / CARRUSEL DE PORTADA
// ======================================================
(function initBillboard() {
  const wrap = document.getElementById('billboard');
  if (!wrap) return; // si no existe el contenedor, no hago nada

  // Lista de imágenes del carrusel (src + posición del foco)
  const data = [
    { src:'img/banner_ps5_cod_wwii.webp', pos:'left center'   },
    { src:'img/banner_ps5_fc24.jpg',      pos:'center center' },
    { src:'img/banner_ps5_ufc5.jpg',      pos:'right center'  }
  ];

  // Creo cada slide con su imagen
  const slides = data.map((s, idx) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (idx === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.src = s.src;
    img.alt = 'Banner ' + (idx + 1);
    img.loading = idx === 0 ? 'eager' : 'lazy';         // la 1ª carga rápido; el resto perezoso
    img.style.objectPosition = s.pos || 'center center';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    slide.appendChild(img);
    wrap.appendChild(slide);
    return slide;
  });

  // Dots de navegación (abajo del carrusel)
  const dotsWrap = document.getElementById('bbDots');
  const dots = data.map((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.setAttribute('aria-label', 'Ir al banner ' + (i + 1));
    b.addEventListener('click', () => go(i, true)); // ir manual a un slide
    dotsWrap && dotsWrap.appendChild(b);
    return b;
  });

  // Botones anterior / siguiente
  const prev = wrap.querySelector('.bb-nav.prev');
  const next = wrap.querySelector('.bb-nav.next');

  // Estado interno del carrusel
  let i = 0;             // índice del slide activo
  let t = null;          // timer del auto-rotado
  const INTERVAL = 3500; // ms entre cambios
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cambia la clase "active" para mostrar un slide y su dot correspondiente
  function setActive(n) {
    slides[i].classList.remove('active');
    dots[i]?.classList.remove('active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i]?.classList.add('active');
  }

  // Ir a un slide (manual reinicia el timer)
  function go(n, manual = false) { setActive(n); if (manual) restart(); }
  function nextSlide() { go(i + 1); }
  function prevSlide() { go(i - 1, true); }

  prev?.addEventListener('click', prevSlide);
  next?.addEventListener('click', () => go(i + 1, true));

  // Auto-rotado (si el usuario NO pidió reducir movimiento)
  function start() { if (reduce) return; stop(); t = setInterval(nextSlide, INTERVAL); }
  function stop()  { if (t) { clearInterval(t); t = null; } }
  function restart(){ stop(); start(); }

  // Pausa al pasar el mouse / pestaña oculta
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  // Gestos en móvil (swipe izquierda/derecha)
  let x0 = null;
  wrap.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) (dx > 0 ? prevSlide() : go(i + 1, true));
    x0 = null;
  }, { passive: true });

  // Teclado (flechas)
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prevSlide();
    if (e.key === 'ArrowRight') go(i + 1, true);
  });

  // ¡a rodar!
  start();
})();
