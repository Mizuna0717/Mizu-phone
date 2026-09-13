// ========== shop.js ==========
// Depends: state.js, utils.js

// 鈹€鈹€ Static Data 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const SHOP_PRODUCTS = [
  { id: 1,  name: 'Linen Shirt',          price: 39.99, desc: 'Breathable everyday linen shirt.', seller: 'Nordic Basics',    cat: 'Fashion',     color: '#e8e8ed' },
  { id: 2,  name: 'Wireless Earbuds',     price: 59.99, desc: 'True wireless, 24h battery life.', seller: 'SoundCo',          cat: 'Electronics', color: '#d8d8dc' },
  { id: 3,  name: 'Ceramic Mug',          price: 18.99, desc: 'Handmade, 380ml, dishwasher safe.', seller: 'Clay & Co',       cat: 'Home',        color: '#ececf0' },
  { id: 4,  name: 'Moisturizer SPF 30',   price: 24.99, desc: 'Daily UV protection, lightweight.', seller: 'Glow Lab',        cat: 'Beauty',      color: '#e0e0e4' },
  { id: 5,  name: 'Running Sneakers',     price: 89.99, desc: 'Cushioned sole, mesh upper.',       seller: 'StridePro',        cat: 'Sports',      color: '#d4d4d8' },
  { id: 6,  name: 'Graphic Novel Vol.1',  price: 14.99, desc: '200-page illustrated story.',       seller: 'InkBound Press',   cat: 'Books',       color: '#e8e8ed' },
  { id: 7,  name: 'Wooden Puzzle 500pc',  price: 22.99, desc: 'Forest landscape, 500 pieces.',     seller: 'Puzzle House',     cat: 'Toys',        color: '#dcdce0' },
  { id: 8,  name: 'Desk Lamp LED',        price: 34.99, desc: 'Adjustable color temp & brightness.','seller':'LightForm',     cat: 'Electronics', color: '#d0d0d4' },
  { id: 9,  name: 'Canvas Tote Bag',      price: 16.99, desc: 'Heavy-duty cotton, natural finish.', seller: 'EcoCarry',       cat: 'Fashion',     color: '#ececf0' },
  { id: 10, name: 'Essential Oil Set',    price: 28.99, desc: '6 scents, pure plant extracts.',    seller: 'Aroma Pure',       cat: 'Beauty',      color: '#e4e4e8' },
  { id: 11, name: 'Yoga Mat',             price: 44.99, desc: 'Non-slip, 6mm thick, eco rubber.',  seller: 'FlexLife',         cat: 'Sports',      color: '#d8d8dc' },
  { id: 12, name: 'Smart Notebook',       price: 19.99, desc: 'Reusable, scan-to-cloud pages.',    seller: 'Rocketbook',       cat: 'Books',       color: '#e0e0e4' },
];

const SHOP_DELIVERY = [
  { id: 101, name: 'Classic Burger',       price: 9.99,  desc: 'Beef patty, cheddar, lettuce.', seller: 'Burger Station',   cat: 'Fast Food', color: '#ececf0' },
  { id: 102, name: 'Kung Pao Chicken',     price: 11.99, desc: 'Spicy peanut stir-fry.',         seller: 'Golden Wok',       cat: 'Chinese',   color: '#e4e4e8' },
  { id: 103, name: 'Salmon Sushi Set',     price: 16.99, desc: '8 pcs nigiri + miso soup.',      seller: 'Sakura Kitchen',   cat: 'Japanese',  color: '#d8d8dc' },
  { id: 104, name: 'Matcha Latte',         price: 5.99,  desc: 'Oat milk, ceremonial grade.',    seller: 'Brew & Co',        cat: 'Drinks',    color: '#e8e8ed' },
  { id: 105, name: 'Tiramisu Slice',       price: 7.49,  desc: 'House-made, espresso-soaked.',   seller: 'Sweet Corner',     cat: 'Dessert',   color: '#dcdce0' },
  { id: 106, name: 'Margherita Pizza',     price: 13.99, desc: 'Tomato, mozzarella, basil.',     seller: 'Forno Napoli',     cat: 'Italian',   color: '#e0e0e4' },
  { id: 107, name: 'Caesar Salad',         price: 8.99,  desc: 'Romaine, parmesan, croutons.',   seller: 'Green Bowl',       cat: 'Salad',     color: '#ececf0' },
  { id: 108, name: 'Chicken Ramen',        price: 12.99, desc: 'Rich tonkotsu broth, soft egg.', seller: 'Noodle Lab',       cat: 'Japanese',  color: '#d4d4d8' },
  { id: 109, name: 'Dim Sum Basket',       price: 14.99, desc: 'Har gow, siu mai, 6 pcs.',       seller: 'Golden Wok',       cat: 'Chinese',   color: '#e4e4e8' },
  { id: 110, name: 'Berry Smoothie',       price: 6.49,  desc: 'Mixed berries, banana, almond.', seller: 'Brew & Co',        cat: 'Drinks',    color: '#d8d8dc' },
];

// Cart state
let _shopCart = [
  { id: 1,  name: 'Linen Shirt',    price: 39.99, qty: 1 },
  { id: 103, name: 'Salmon Sushi Set', price: 16.99, qty: 2 },
];
let _shopCurrentProduct = null;

// 鈹€鈹€ Init 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function initShop() {
  _renderShopGrid();
  _renderDeliveryGrid();
  _renderCartList();
  _updateCartBadge();
}

// 鈹€鈹€ Tab Switching 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function shopSwitchTab(tab) {
  document.querySelectorAll('#screen-shop .shop-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#screen-shop .shop-tab-content').forEach(el => el.classList.remove('active'));
  const tabEl = document.getElementById('shopTab-' + tab);
  const panelEl = document.getElementById('shopPanel-' + tab);
  if (tabEl) tabEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');
  
  // Update header title
  const headerTitle = document.querySelector('.shop-header-title');
  if (headerTitle) {
    const titles = {
      'shop': 'Shop',
      'delivery': 'Delivery',
      'cart': 'Cart',
      'wallet': 'Wallet'
    };
    headerTitle.textContent = titles[tab] || 'Shop';
  }
}

// 鈹€鈹€ Category Selection 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function shopSelectCat(el, panel) {
  const container = el.closest('.shop-categories');
  if (!container) return;
  container.querySelectorAll('.shop-cat').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// 鈹€鈹€ Render Grids 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function _shopCard(item) {
  return `
    <div class="shop-product-card" onclick="shopOpenModal(${item.id}, '${_escapeAttr(item.name)}', ${item.price}, '${_escapeAttr(item.desc)}', '${_escapeAttr(item.seller)}', '${item.color}')">
      <div class="shop-product-img" style="background:${item.color}">
        <svg viewBox="0 0 48 48" class="shop-product-img-ph">
          <rect x="8" y="8" width="32" height="32" rx="4"/>
          <circle cx="18" cy="20" r="3"/>
          <path d="M40 36L30 24 20 34 14 28 8 36"/>
        </svg>
      </div>
      <div class="shop-product-info">
        <div class="shop-product-name">${_escapeHtml(item.name)}</div>
        <div class="shop-product-price">$${item.price.toFixed(2)}</div>
        <div class="shop-product-desc">${_escapeHtml(item.desc)}</div>
      </div>
    </div>`;
}

function _renderShopGrid() {
  const grid = document.getElementById('shopProductGrid');
  if (!grid) return;
  grid.innerHTML = SHOP_PRODUCTS.map(_shopCard).join('');
}

function _renderDeliveryGrid() {
  const grid = document.getElementById('shopDeliveryGrid');
  if (!grid) return;
  grid.innerHTML = SHOP_DELIVERY.map(_shopCard).join('');
}

// 鈹€鈹€ Modal 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function shopOpenModal(id, name, price, desc, seller, color) {
  _shopCurrentProduct = { id, name, price, desc, seller };
  const overlay = document.getElementById('shopModalOverlay');
  const imgWrap = document.getElementById('shopModalImgWrap');
  const nameEl  = document.getElementById('shopModalName');
  const priceEl = document.getElementById('shopModalPrice');
  const sellerEl= document.getElementById('shopModalSeller');
  const descEl  = document.getElementById('shopModalDesc');
  if (imgWrap) imgWrap.style.background = color;
  if (nameEl)  nameEl.textContent  = name;
  if (priceEl) priceEl.textContent = '$' + price.toFixed(2);
  if (sellerEl)sellerEl.textContent= 'Sold by ' + seller;
  if (descEl)  descEl.textContent  = desc;
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('show'), 10);
  }
}

function shopCloseModal(e) {
  if (e && e.target !== document.getElementById('shopModalOverlay') && !e.target.closest('.shop-modal-close')) return;
  const overlay = document.getElementById('shopModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => { overlay.style.display = 'none'; }, 250);
}

function shopAddToCart() {
  if (!_shopCurrentProduct) return;
  const existing = _shopCart.find(i => i.id === _shopCurrentProduct.id);
  if (existing) {
    existing.qty += 1;
  } else {
    _shopCart.push({ ..._shopCurrentProduct, qty: 1 });
  }
  _updateCartBadge();
  shopCloseModal({ target: document.getElementById('shopModalOverlay') });
  shopToast('Added to cart');
}

// 鈹€鈹€ Cart 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function _renderCartList() {
  const list = document.getElementById('shopCartList');
  if (!list) return;
  if (_shopCart.length === 0) {
    list.innerHTML = '<div class="shop-cart-empty">Your cart is empty</div>';
    _updateCartTotal();
    return;
  }
  list.innerHTML = _shopCart.map((item, idx) => `
    <div class="shop-cart-item" id="shopCartItem-${idx}">
      <div class="shop-cart-item-img" style="background:#e8e8ed">
        <svg viewBox="0 0 32 32" class="shop-cart-img-ph">
          <rect x="4" y="4" width="24" height="24" rx="3"/>
          <circle cx="12" cy="13" r="2"/>
          <path d="M28 25L21 17 14 23 10 19 4 25"/>
        </svg>
      </div>
      <div class="shop-cart-item-info">
        <div class="shop-cart-item-name">${_escapeHtml(item.name)}</div>
        <div class="shop-cart-item-price">$${item.price.toFixed(2)} each</div>
        <div class="shop-cart-qty-row">
          <button class="shop-qty-btn" onclick="shopChangeQty(${idx}, -1)">-</button>
          <span class="shop-qty-val" id="shopQty-${idx}">${item.qty}</span>
          <button class="shop-qty-btn" onclick="shopChangeQty(${idx}, 1)">+</button>
        </div>
      </div>
      <div class="shop-cart-item-subtotal">$${(item.price * item.qty).toFixed(2)}</div>
    </div>`).join('');
  _updateCartTotal();
}

function shopChangeQty(idx, delta) {
  if (!_shopCart[idx]) return;
  _shopCart[idx].qty = Math.max(1, _shopCart[idx].qty + delta);
  const qtyEl = document.getElementById('shopQty-' + idx);
  if (qtyEl) qtyEl.textContent = _shopCart[idx].qty;
  const subtotalEl = document.querySelector(`#shopCartItem-${idx} .shop-cart-item-subtotal`);
  if (subtotalEl) subtotalEl.textContent = '$' + (_shopCart[idx].price * _shopCart[idx].qty).toFixed(2);
  _updateCartTotal();
  _updateCartBadge();
}

function shopClearCart() {
  _shopCart = [];
  _renderCartList();
  _updateCartBadge();
  shopToast('Cart cleared');
}

function _updateCartTotal() {
  const total = _shopCart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const el = document.getElementById('shopCartTotal');
  if (el) el.textContent = '$' + total.toFixed(2);
}

function _updateCartBadge() {
  const count = _shopCart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('shopCartBadge');
  if (!badge) return;
  if (count > 0) { badge.textContent = count; badge.style.display = 'inline-flex'; }
  else { badge.style.display = 'none'; }
}

// 鈹€鈹€ Card Selection 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function shopSelectCard(el) {
  document.querySelectorAll('#shopPanel-wallet .shop-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// 鈹€鈹€ Toast 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function shopToast(msg) {
  const toast = document.getElementById('shopToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// 鈹€鈹€ Helpers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function _escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _escapeAttr(str) {
  return String(str).replace(/'/g, "\\\'").replace(/"/g, '&quot;');
}
