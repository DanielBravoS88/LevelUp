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
        <button class="btn primary" onclick='add("${encodeURIComponent(JSON.stringify(p))}");openCart()'>Comprar</button>
      </div>
    </div>
  </article>`;

// Carrito
function add(encoded){ const p = JSON.parse(decodeURIComponent(encoded)); const found = state.cart.find(i=>i.name===p.name); if(found){ found.qty+=1; } else { state.cart.push({...p, qty:1}); } saveCart(); }
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

// Reseñas dummy
const sampleReviews = [
  {name:'Felipe Retamal', text:'Funciona perfecto. Primera compra y repetiré ✨', score:5},
  {name:'Ronaldo Soto', text:'Confiables y rápidos. Feliz con la compra 😍', score:5},
  {name:'Dgo', text:'Tercera vez comprando y plus todos los meses 🙌', score:5},
];
$('#reviews').innerHTML = sampleReviews.map(r=>`<div class="review"><strong>${r.name}</strong><div>${'⭐'.repeat(r.score)}</div><p class="desc">${r.text}</p></div>`).join('');

// Interacciones
$$('#btnCart, #dockCart').forEach(b=>b.addEventListener('click', openCart));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeCart(); });
document.body.addEventListener('click', e=>{ if(e.target.closest('.cart-panel')) return; if(e.target.id==='btnCart' || e.target.id==='dockCart') return; if($('.cart-panel').classList.contains('open') && !e.target.closest('.cart-panel')) closeCart(); });

// Filtros + búsqueda
document.getElementById('order').addEventListener('change', e=>{ state.order=e.target.value; render(); });
document.getElementById('q').addEventListener('input', e=>{ state.q=e.target.value; render(); });
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
