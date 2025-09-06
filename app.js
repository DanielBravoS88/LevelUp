// Utilidades
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP', maximumFractionDigits:0}).format(n||0);

// --------- Galería estática imágenes locales ---------
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

// Estado
const state = { products: [], filter:'Todos', q:'', order:'popular', cart: JSON.parse(localStorage.getItem('cart')||'[]') };

// ---- Cargar productos: intenta JSON; si falla, usa galería estática ----
fetch('products.json').then(r=>{
  if(!r.ok) throw new Error('No JSON');
  return r.json();
}).then(list=>{
  state.products = Array.isArray(list) && list.length ? list : staticGallery;
  render();
  document.getElementById('grid').setAttribute('aria-busy','false');
}).catch(()=>{
  state.products = staticGallery;
  render();
  document.getElementById('grid').setAttribute('aria-busy','false');
});

// Toast de confirmación
function showToast(msg) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 1800);
  }, 10);
}

// Render catálogo
function render(){
  const grid = document.getElementById('grid');
  let items = [...state.products];
  if(state.filter && state.filter!=='Todos') items = items.filter(p=>p.category===state.filter);
  if(state.q) items = items.filter(p=> (p.name+' '+(p.description||'')).toLowerCase().includes(state.q.toLowerCase()));
  if(state.order==='price-asc') items.sort((a,b)=>a.price-b.price);
  if(state.order==='price-desc') items.sort((a,b)=>b.price-a.price);
  if(state.order==='name-asc') items.sort((a,b)=>a.name.localeCompare(b.name));

  grid.innerHTML = items.map(p=>cardTpl(p)).join('');
  updateCounts();
}

const cardTpl = (p) => `
  <article class="card" data-cat="${p.category}">
    <div class="media">
      <span class="tag">${p.category}</span>
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
    </div>
    <div class="body">
      <h3 class="title">${p.name}</h3>
      <div class="price">${money(p.price)}</div>
      <p class="desc">${(p.description||'').slice(0,120)}...</p>
      <div class="row">
        <button class="btn" onclick='add("${encodeURIComponent(JSON.stringify(p))}")'>Agregar</button>
        <button class="btn primary" onclick='add("${encodeURIComponent(JSON.stringify(p))}");openCart();showToast("¡Compraste: ${p.name}!")'>Comprar</button>
      </div>
    </div>
  </article>`;

// Carrito
function add(encoded){
  const p = JSON.parse(decodeURIComponent(encoded));
  const found = state.cart.find(i=>i.name===p.name);
  if(found){
    found.qty+=1;
  } else {
    state.cart.push({...p, qty:1});
  }
  saveCart();
  showToast(`Agregado: ${p.name}`);
}
function remove(name){ state.cart = state.cart.filter(i=>i.name!==name); saveCart(); }
function changeQty(name, d){ const it = state.cart.find(i=>i.name===name); if(!it) return; it.qty = Math.max(1, it.qty + d); saveCart(); }
function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); drawCart(); updateCounts(); }
function updateCounts(){ const c = state.cart.reduce((a,b)=>a+b.qty,0); document.getElementById('cartCount').textContent=c; document.getElementById('dockCount').textContent=c; }
function openCart(){ document.getElementById('cartPanel').classList.add('open'); document.getElementById('cartPanel').setAttribute('aria-hidden','false'); drawCart(); }
function closeCart(){ document.getElementById('cartPanel').classList.remove('open'); document.getElementById('cartPanel').setAttribute('aria-hidden','true'); }

function drawCart(){
  const list = document.getElementById('cartItems');
  list.innerHTML = state.cart.map(i=>`
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}"/>
      <div>
        <div style="font-weight:700">${i.name}</div>
        <div style="color:var(--text-2)">${money(i.price)} · <button class="btn" onclick='changeQty("${i.name}",-1)'>-</button> ${i.qty} <button class="btn" onclick='changeQty("${i.name}",1)'>+</button></div>
      </div>
      <button class="btn" onclick='remove("${i.name}")'>Quitar</button>
    </div>`).join('');
  const total = state.cart.reduce((s,i)=> s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = money(total);
}

// ----------- BOLETA REAL (modal mejorada) -----------
function showReceipt() {
  if (!state.cart.length) {
    alert('El carrito está vacío.');
    return;
  }
  const fecha = new Date();
  const nroBoleta = Math.floor(Math.random()*900000+100000);

  // Si el usuario tiene descuento DUOC
  let descuento = 0;
  let email = $('#email')?.value?.trim()?.toLowerCase() || '';
  if (/@duoc\.cl$/.test(email)) {
    descuento = 0.2;
  }

  // Calcular totales y filas
  let totalSinDescuento = 0;
  let totalDescuento = 0;
  const items = state.cart.map(item => {
    const precioUnitario = item.price;
    const subtotal = precioUnitario * item.qty;
    let descuentoItem = 0;
    let precioFinal = subtotal;

    // Aplica descuento DUOC si corresponde
    if (descuento > 0) {
      descuentoItem = Math.round(subtotal * descuento);
      precioFinal = subtotal - descuentoItem;
    }

    totalSinDescuento += subtotal;
    totalDescuento += descuentoItem;

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
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('closeReceipt').onclick = () => {
    document.getElementById('receiptModal').remove();
    closeCart();
    state.cart = [];
    saveCart();
  };
}

// ----------- RESEÑAS EDITABLES -----------
let reviews = [
  {id:1, name:'Felipe Retamal', text:'Funciona perfecto. Primera compra y repetiré ✨', score:5, editing:false},
  {id:2, name:'Ronaldo Soto', text:'Confiables y rápidos. Feliz con la compra 😍', score:5, editing:false},
  {id:3, name:'Dgo', text:'Tercera vez comprando y plus todos los meses 🙌', score:5, editing:false},
];

function renderReviews() {
  const container = document.getElementById('reviews');
  container.innerHTML = '';
  reviews.forEach(review => {
    const div = document.createElement('div');
    div.className = 'review';
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

function renderStars(score, id, editable) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span style="cursor:${editable?'pointer':'default'};color:${i<=score?'gold':'#888'}" ${editable?`onclick="setStars(${id},${i})"`:''}>&#9733;</span>`;
  }
  return html;
}

window.setStars = function(id, score) {
  const review = reviews.find(r => r.id === id);
  if (review && review.editing) {
    review.score = score;
    renderReviews();
  }
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
    review.name = document.getElementById('editName'+id).value;
    review.text = document.getElementById('editText'+id).value;
    review.editing = false;
  }
  renderReviews();
};

window.deleteReview = function(id) {
  reviews = reviews.filter(r => r.id !== id);
  renderReviews();
};

// Inicializa reseñas
renderReviews();

// Interacciones
$$('#btnCart, #dockCart').forEach(b=>b.addEventListener('click', openCart));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeCart(); });
document.body.addEventListener('click', e=>{ if(e.target.closest('.cart-panel')) return; if(e.target.id==='btnCart' || e.target.id==='dockCart') return; if($('.cart-panel').classList.contains('open') && !e.target.closest('.cart-panel')) closeCart(); });

// Filtros + búsqueda
document.getElementById('order').addEventListener('change', e=>{ state.order=e.target.value; render(); });

// Solo busca al apretar el botón
document.getElementById('btnSearch').addEventListener('click', () => {
  state.q = document.getElementById('q').value;
  render();
});

$$('.chip, nav a').forEach(ch=>ch.addEventListener('click', e=>{ e.preventDefault(); $$('.chip, nav a').forEach(c=>c.classList.remove('active')); ch.classList.add('active'); state.filter = ch.dataset.chip || ch.dataset.filter || 'Todos'; render(); }));

// Login modal
$('#btnLogin').addEventListener('click', ()=>$('#loginModal').classList.add('open'));
$('#closeLogin').addEventListener('click', ()=>$('#loginModal').classList.remove('open'));
$('#loginForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const age = parseInt($('#age').value||'0',10);
  if(age<18){ alert('Debes ser mayor de 18 años para registrarte.'); return; }
  const email = $('#email').value.trim().toLowerCase();
  const isDuoc = /@duoc\.cl$/.test(email);
  $('#duocMsg').textContent = isDuoc ? '🎉 Descuento permanente de 20% aplicado a tu cuenta (@duoc.cl)' : 'Cuenta creada. ¡Bienvenid@ a LevelUp!';
  setTimeout(()=>$('#loginModal').classList.remove('open'), 1200);
});

// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Suscripción
document.getElementById('btnSubscribe').addEventListener('click', ()=>{
  alert('Suscripción registrada. Revisa tu correo para el cupón de -20% en tu primera compra.');
});

// --------- BOTÓN PAGAR: mostrar boleta ---------
document.getElementById('checkout').addEventListener('click', showReceipt);

// --------- HERO IMAGE AUTO-CHANGE CON FADE ---------
const heroImages = [
  "img/play5-2.jpg",
  "img/nintendo1.jpg",
  "img/Audifonos-Gamer-Inalambricos.png",
  "img/play5-3.jpg",
  "img/nintendo5.jpg"
];
let heroIndex = 0;
window.addEventListener('DOMContentLoaded', () => {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  setInterval(() => {
    heroImg.classList.add('fade');
    setTimeout(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
      heroImg.src = heroImages[heroIndex];
      heroImg.classList.remove('fade');
    }, 700); // Tiempo igual al transition del CSS
  }, 2500);