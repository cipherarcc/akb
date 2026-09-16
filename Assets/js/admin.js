// ============================================
// AL KHAYAM ADMIN PANEL LOGIC
// ============================================

let adminMenu = [];
const ADMIN_PASSWORD = "alkhayam123";

// ============ LOGIN ============
function login() {
  const pass = document.getElementById('passwordInput').value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadMenu();
  } else {
    alert("❌ Wrong password!");
  }
}

// ============ LOGOUT ============
function logout() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('passwordInput').value = '';
}

// ============ LOAD MENU ============
function loadMenu() {
  const saved = localStorage.getItem('alkhayamMenu');
  if (saved) {
    adminMenu = JSON.parse(saved);
  } else {
    adminMenu = JSON.parse(JSON.stringify(MENU));
  }
  updateStats();
  renderAdminList();
}

// ============ UPDATE STATS ============
function updateStats() {
  document.getElementById('totalItems').textContent = adminMenu.length;
  const cats = new Set(adminMenu.map(i => i.cat));
  document.getElementById('totalCategories').textContent = cats.size;
}

// ============ SAVE MENU ============
function saveMenu() {
  localStorage.setItem('alkhayamMenu', JSON.stringify(adminMenu));
}

// ============ RENDER LIST ============
function renderAdminList() {
  const list = document.getElementById('adminList');
  const search = document.getElementById('searchAdmin').value.toLowerCase();

  let filtered = adminMenu;
  if (search) filtered = adminMenu.filter(item => item.name.toLowerCase().includes(search));

  if (filtered.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No items found.</p>';
    return;
  }

  let html = '';
  filtered.forEach((item) => {
    const originalIndex = adminMenu.indexOf(item);
    const displayPrice = typeof item.price === 'number' ? 'AED ' + item.price : 'AED ' + item.price;

    html += `
      <div class="admin-item">
        <div class="admin-item-info">
          <h4>${item.name}</h4>
          <span>${CATEGORIES[item.cat] || item.cat} | ${displayPrice}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-edit" onclick="editItem(${originalIndex})">Edit</button>
          <button class="btn-delete" onclick="deleteItem(${originalIndex})">Delete</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

// ============ ADD ITEM ============
function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const cat = document.getElementById('itemCategory').value;
  const priceInput = document.getElementById('itemPrice').value.trim();

  if (!name || !priceInput) {
    alert("Please enter both name and price.");
    return;
  }

  let price = priceInput.includes('/') ? priceInput : parseFloat(priceInput);
  if (typeof price === 'number' && isNaN(price)) {
    alert("Please enter a valid price.");
    return;
  }

  adminMenu.push({ cat: cat, name: name, price: price });
  saveMenu();
  updateStats();
  renderAdminList();

  document.getElementById('itemName').value = '';
  document.getElementById('itemPrice').value = '';
  alert("✅ Item added! Click 'Export' to save permanently.");
}

// ============ EDIT ITEM ============
function editItem(index) {
  const item = adminMenu[index];
  const newName = prompt("Edit Name:", item.name);
  if (newName === null || newName.trim() === '') return;

  const newPriceStr = prompt("Edit Price (e.g., 15 or 6/10):", item.price);
  if (newPriceStr === null) return;

  let newPrice = newPriceStr.includes('/') ? newPriceStr : parseFloat(newPriceStr);
  if (typeof newPrice === 'number' && isNaN(newPrice)) {
    alert("Invalid price.");
    return;
  }

  adminMenu[index].name = newName.trim();
  adminMenu[index].price = newPrice;
  saveMenu();
  renderAdminList();
  alert("✅ Item updated! Click 'Export' to save permanently.");
}

// ============ DELETE ITEM ============
function deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    adminMenu.splice(index, 1);
    saveMenu();
    updateStats();
    renderAdminList();
    alert("✅ Item deleted! Click 'Export' to save permanently.");
  }
}

// ============ EXPORT MENU.JS ============
function exportMenu() {
  let content = "// ============================================\n";
  content += "// AL KHAYAM RESTAURANT - MENU DATA (UPDATED)\n";
  content += "// ============================================\n\n";

  content += "const RESTAURANT = {\n";
  content += "  name: \"Al Khayam\",\n";
  content += "  tagline: \"Bakery & Restaurant\",\n";
  content += "  whatsapp: \"971565043688\",\n";
  content += "  maps: \"https://maps.app.goo.gl/Lop6t3asYqe2o2Xo8\"\n";
  content += "};\n\n";

  content += "const CATEGORIES = {\n";
  Object.keys(CATEGORIES).forEach(key => {
    content += `  ${key}: "${CATEGORIES[key]}",\n`;
  });
  content += "};\n\n";

  content += "const MENU = [\n";
  adminMenu.forEach(item => {
    const priceValue = typeof item.price === 'number' ? item.price : `"${item.price}"`;
    content += `  { cat: "${item.cat}", name: "${item.name}", price: ${priceValue} },\n`;
  });
  content += "];\n";

  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'menu.js';
  a.click();
  URL.revokeObjectURL(url);
  alert("✅ menu.js downloaded! Replace the old file in Assets/data/ with this new one.");
}

// ============ RESET MENU ============
function resetMenu() {
  if (confirm("This will reset the menu to the original. Are you sure?")) {
    localStorage.removeItem('alkhayamMenu');
    loadMenu();
    alert("✅ Menu reset to original.");
  }
}