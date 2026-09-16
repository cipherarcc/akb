// ============================================
// AL KHAYAM RESTAURANT - MAIN SCRIPT
// ============================================

let cart = JSON.parse(localStorage.getItem('alkhayamCart')) || [];
let activeCat = 'all';
let searchTerm = '';

// ============ RENDER MENU ============
function renderMenu() {
  const container = document.getElementById('menuContainer');
  if (!container) return;

  let filtered = MENU;
  if (activeCat !== 'all') filtered = filtered.filter(item => item.cat === activeCat);
  if (searchTerm) filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No items found 🔍</p>';
    return;
  }

  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  });

  let html = '';
  Object.keys(grouped).forEach(cat => {
    html += '<h2 class="section-title">' + (CATEGORIES[cat] || cat) + '</h2>';
    grouped[cat].forEach(item => {
      const priceDisplay = typeof item.price === 'number' ? 'AED ' + item.price : 'AED ' + item.price;
      const priceValue = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;

      const cartItem = cart.find(i => i.name === item.name);
      const qty = cartItem ? cartItem.qty : 0;

      let qtyControls = '';
      if (qty > 0) {
        qtyControls =
          '<div class="qty-inline">' +
            '<button class="qty-btn-inline" onclick="decreaseItem(\'' + item.name.replace(/'/g, "\\'") + '\')">−</button>' +
            '<span class="qty-display">' + qty + '</span>' +
            '<button class="qty-btn-inline" onclick="addToCart(\'' + item.name.replace(/'/g, "\\'") + '\', ' + priceValue + ')">+</button>' +
          '</div>';
      } else {
        qtyControls = '<button class="add-btn" onclick="addToCart(\'' + item.name.replace(/'/g, "\\'") + '\', ' + priceValue + ')">+</button>';
      }

      html += '<div class="menu-item">' +
        '<div class="item-info"><h3>' + item.name + '</h3><div class="price">' + priceDisplay + '</div></div>' +
        qtyControls +
        '</div>';
    });
  });
  container.innerHTML = html;
}

// ============ ADD TO CART ============
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, qty: 1 });
  saveCart();
  updateCartCount();
  renderMenu();
  showToast('✓ ' + name + ' added!');
}

// ============ DECREASE FROM MENU ============
function decreaseItem(name) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty--;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
    showToast('Removed: ' + name);
  } else {
    showToast('−1 ' + name);
  }
  saveCart();
  updateCartCount();
  renderMenu();
}

// ============ SAVE CART ============
function saveCart() {
  localStorage.setItem('alkhayamCart', JSON.stringify(cart));
}

// ============ UPDATE CART COUNT ============
function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) {
    el.textContent = total;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

// ============ OPEN CART ============
function openCart() {
  document.getElementById('cartModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderCart();
}

// ============ CLOSE CART ============
function closeCart() {
  document.getElementById('cartModal').classList.remove('show');
  document.body.style.overflow = '';
  renderMenu();
}

// ============ RENDER CART ============
function renderCart() {
  const itemsDiv = document.getElementById('cartItems');
  const footerDiv = document.getElementById('cartFooter');
  if (!itemsDiv) return;

  if (cart.length === 0) {
    itemsDiv.innerHTML = '<div class="empty-cart">🛒<br><br>Your cart is empty</div>';
    footerDiv.innerHTML = '';
    return;
  }

  let html = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    html += '<div class="cart-item">' +
      '<div class="cart-item-info"><h4>' + item.name + '</h4><span>AED ' + item.price + ' × ' + item.qty + ' = AED ' + itemTotal + '</span></div>' +
      '<div class="qty-controls">' +
      '<button class="qty-btn" onclick="changeQty(' + idx + ', -1)">−</button>' +
      '<strong>' + item.qty + '</strong>' +
      '<button class="qty-btn" onclick="changeQty(' + idx + ', 1)">+</button>' +
      '</div></div>';
  });
  itemsDiv.innerHTML = html;
  footerDiv.innerHTML = '<div class="cart-total"><span>Total</span><span>AED ' + total + '</span></div>' +
    '<button class="checkout-btn" onclick="checkoutWhatsApp()">📱 Order via WhatsApp</button>';
}

// ============ CHANGE QUANTITY ============
function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

// ============ CHECKOUT ============
function checkoutWhatsApp() {
  if (cart.length === 0) return;
  let msg = '*New Order — Al Khayam Restaurant*\n\n*Items:*\n';
  let total = 0;
  cart.forEach((item, i) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    msg += (i + 1) + '. ' + item.name + ' × ' + item.qty + ' = AED ' + itemTotal + '\n';
  });
  msg += '\n*Total: AED ' + total + '*\n\n---\nName: \nPhone: \nPickup / Delivery: \nAddress: \nNotes: ';
  window.open('https://wa.me/971565043688?text=' + encodeURIComponent(msg), '_blank');
}

// ============ TOAST ============
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1500);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', function () {
  renderMenu();
  updateCartCount();

  const catContainer = document.getElementById('categories');
  if (catContainer) {
    catContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('cat-btn')) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCat = e.target.dataset.cat;
        renderMenu();
      }
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      searchTerm = e.target.value;
      renderMenu();
    });
  }

  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.id === 'cartModal') closeCart();
    });
  }
});