/* ==========================================
   1. DATA MENU RESTORAN KALDOKU
   ========================================== */
const menuKaldoku = [
  {
    id: 1,
    nama: "Kaldoku Signature Shoyu",
    kategori: "signature",
    harga: 38000,
    badge: "Best Seller",
    deskripsi: "Ramen kuah kaldu ayam pekat 12 jam, dipadu shoyu spesial, mie kenyal, ajitama tamago, dan 2 slices chashu lembut.",
    gambar: "./assets/shoyu.webp"
  },
  {
    id: 2,
    nama: "Kaldoku Miso Butter",
    kategori: "signature",
    harga: 42000,
    badge: "Favorit",
    deskripsi: "Perpaduan miso fermentasi khas Jepang dengan sentuhan butter gurih di atas kuah kaldu pekat dan jagung manis.",
    gambar: "./assets/miso.webp"
  },
  {
    id: 3,
    nama: "Tantanmen Vulkanik",
    kategori: "spicy",
    harga: 45000,
    badge: "Pedas Level 3",
    deskripsi: "Ramen pedas gurih dengan saus wijen hitam (neri-goma), minyak cabai Sichuan, daging cincang pedas, dan daun bawang.",
    gambar: "./assets/tantan.webp"
  },
  {
    id: 4,
    nama: "Spicy Shoyu Ramen",
    kategori: "spicy",
    harga: 40000,
    badge: "Pedas",
    deskripsi: "Varian shoyu klasik dengan tambahan chili oil buatan rumah yang memberikan sensasi hangat dan menggigit.",
    gambar: "./assets/shoyu.webp"
  },
  {
    id: 5,
    nama: "Extra Ajitama Tamago",
    kategori: "side",
    harga: 6000,
    badge: "Topping",
    deskripsi: "Telur ramen setengah matang dengan kuning telur lumer yang dimarinasi dalam kecap asin spesial.",
    gambar: "./assets/shoyu.webp"
  },
  {
    id: 6,
    nama: "Ocha Dingin / Hangat",
    kategori: "side",
    harga: 5000,
    badge: "Minuman",
    deskripsi: "Teh hijau khas Jepang (Green Tea) segar yang dapat direfill atau disajikan dingin/hangat.",
    gambar: "./assets/shoyu.webp"
  }
];

/* ==========================================
   2. STATE APLIKASI & KERANJANG (localStorage)
   ========================================== */
let keranjang = JSON.parse(localStorage.getItem('kaldoku_cart')) || [];
let currentCategory = 'all';

// Referensi Elemen DOM
const menuListEl = document.getElementById('menu-list');
const orderItemsEl = document.getElementById('order-items-list');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const floatingCartEl = document.getElementById('floating-cart');
const cartCountEl = document.getElementById('cart-count');
const cartFloatingTotalEl = document.getElementById('cart-floating-total');
const subtotalPriceEl = document.getElementById('subtotal-price');
const taxPriceEl = document.getElementById('tax-price');
const totalPriceEl = document.getElementById('total-price');
const checkoutForm = document.getElementById('checkout-form');
const orderTypeSelect = document.getElementById('order-type');
const tableGroup = document.getElementById('table-group');
const btnInstall = document.getElementById('btn-install');

/* ==========================================
   3. INISIALISASI SAAT HALAMAN DIMUAT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderMenu('all');
  updateCartUI();
  setupEventListeners();
  setupPWAInstallPrompt();
});

/* ==========================================
   4. RENDER MENU & FILTER KATEGORI
   ========================================== */
function renderMenu(kategori) {
  menuListEl.innerHTML = '';
  
  const filteredMenu = kategori === 'all' 
    ? menuKaldoku 
    : menuKaldoku.filter(item => item.kategori === kategori);

  if (filteredMenu.length === 0) {
    menuListEl.innerHTML = `<p class="loading-text">Belum ada menu pada kategori ini.</p>`;
    return;
  }

  filteredMenu.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <img src="${item.gambar}" alt="${item.nama}" loading="lazy" onerror="this.src='./assets/icon-192.png'">
      <div class="menu-info">
        <div>
          <div class="menu-title-row">
            <h3>${item.nama}</h3>
            <span class="menu-badge">${item.badge}</span>
          </div>
          <p>${item.deskripsi}</p>
        </div>
        <div class="menu-footer">
          <span class="menu-price">Rp ${item.harga.toLocaleString('id-ID')}</span>
          <button class="btn-add" onclick="tambahKeKeranjang(${item.id})">+</button>
        </div>
      </div>
    `;
    menuListEl.appendChild(card);
  });
}

/* ==========================================
   5. LOGIKA KERANJANG (Add, Update, Save)
   ========================================== */
function tambahKeKeranjang(id) {
  const produk = menuKaldoku.find(item => item.id === id);
  if (!produk) return;

  const itemAda = keranjang.find(item => item.id === id);
  if (itemAda) {
    itemAda.qty += 1;
  } else {
    keranjang.push({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      qty: 1
    });
  }

  simpanDanPerbarui();
}

function ubahQty(index, delta) {
  keranjang[index].qty += delta;
  if (keranjang[index].qty <= 0) {
    keranjang.splice(index, 1);
  }
  simpanDanPerbarui();
}

function simpanDanPerbarui() {
  localStorage.setItem('kaldoku_cart', JSON.stringify(keranjang));
  updateCartUI();
}

function updateCartUI() {
  const totalItem = keranjang.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  const pajak = subtotal * 0.10; // Pajak restoran 10%
  const totalKeseluruhan = subtotal + pajak;

  // Update Floating Cart Bar
  if (totalItem > 0) {
    floatingCartEl.classList.remove('hidden');
    cartCountEl.innerText = `${totalItem} Item`;
    cartFloatingTotalEl.innerText = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;
  } else {
    floatingCartEl.classList.add('hidden');
  }

  // Update Tampilan Halaman Rincian Pesanan
  if (orderItemsEl) {
    orderItemsEl.innerHTML = '';
    if (keranjang.length === 0) {
      emptyCartMsg.classList.remove('hidden');
      document.getElementById('price-summary-card').classList.add('hidden');
      checkoutForm.classList.add('hidden');
    } else {
      emptyCartMsg.classList.add('hidden');
      document.getElementById('price-summary-card').classList.remove('hidden');
      checkoutForm.classList.remove('hidden');

      keranjang.forEach((item, index) => {
        const itemSubtotal = item.harga * item.qty;
        const row = document.createElement('div');
        row.className = 'order-item-row';
        row.innerHTML = `
          <div class="item-detail">
            <h4>${item.nama}</h4>
            <p>Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty} = <strong>Rp ${itemSubtotal.toLocaleString('id-ID')}</strong></p>
          </div>
          <div class="item-quantity-controls">
            <button onclick="ubahQty(${index}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="ubahQty(${index}, 1)">+</button>
          </div>
        `;
        orderItemsEl.appendChild(row);
      });
    }

    subtotalPriceEl.innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    taxPriceEl.innerText = `Rp ${pajak.toLocaleString('id-ID')}`;
    totalPriceEl.innerText = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;
  }
}

/* ==========================================
   6. EVENT LISTENERS & NAVIGASI HALAMAN
   ========================================== */
function setupEventListeners() {
  // Tombol Kategori Menu
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderMenu(currentCategory);
    });
  });

  // Navigasi ke Halaman Pesanan
  document.getElementById('btn-view-order').addEventListener('click', () => {
    document.getElementById('page-menu').classList.add('hidden');
    document.getElementById('page-order').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Navigasi Kembali ke Menu
  const backAction = () => {
    document.getElementById('page-order').classList.add('hidden');
    document.getElementById('page-menu').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.getElementById('btn-back-menu').addEventListener('click', backAction);
  document.getElementById('btn-empty-back').addEventListener('click', backAction);

  // Tipe Pesanan (Dine-In vs Takeaway)
  orderTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'Takeaway') {
      tableGroup.classList.add('hidden');
    } else {
      tableGroup.classList.remove('hidden');
    }
  });

  // Submit Checkout ke WhatsApp
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    kirimPesanWhatsApp();
  });
}

/* ==========================================
   7. FORMAT & KIRIM PESAN KE WHATSAPP
   ========================================== */
function kirimPesanWhatsApp() {
  const nama = document.getElementById('customer-name').value.trim();
  const tipePesanan = orderTypeSelect.value;
  const noMeja = document.getElementById('table-number').value.trim();
  const catatan = document.getElementById('order-notes').value.trim();

  if (!nama) {
    alert('Mohon masukkan nama pemesan terlebih dahulu.');
    return;
  }

  let subtotal = 0;
  let teks = `🍜 *PESANAN BARU - KALDOKU RAMEN* 🍜\n\n`;
  teks += `👤 *Nama:* ${nama}\n`;
  teks += `📍 *Tipe:* ${tipePesanan}\n`;
  if (tipePesanan === 'Dine-In' && noMeja) {
    teks += `🪑 *No. Meja:* ${noMeja}\n`;
  }
  teks += `\n*Rincian Menu:* \n`;

  keranjang.forEach((item, idx) => {
    const itemSubtotal = item.harga * item.qty;
    subtotal += itemSubtotal;
    teks += `${idx + 1}. ${item.nama} (${item.qty}x) - Rp ${itemSubtotal.toLocaleString('id-ID')}\n`;
  });

  const pajak = subtotal * 0.10;
  const totalAkhir = subtotal + pajak;

  teks += `\n--------------------------\n`;
  teks += `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
  teks += `Pajak PB1 (10%): Rp ${pajak.toLocaleString('id-ID')}\n`;
  teks += `💰 *TOTAL: Rp ${totalAkhir.toLocaleString('id-ID')}*\n`;
  
  if (catatan) {
    teks += `\n📝 *Catatan:* ${catatan}\n`;
  }

  teks += `\nTerima kasih! Mohon segera diproses ya kak. 🙏`;

  // Nomor WhatsApp Kasir Kaldoku (Ganti dengan nomor WhatsApp aktif Anda, diawali 62)
  const nomorWhatsApp = '6281231827300'; 
  const encodedURL = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(teks)}`;

  // Kosongkan keranjang setelah pesanan dikirim (opsional)
  // localStorage.removeItem('kaldoku_cart');
  // keranjang = [];

  window.open(encodedURL, '_blank');
}

/* ==========================================
   8. PWA INSTALL PROMPT HANDLER (Android)
   ========================================== */
let deferredPrompt;
function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.classList.remove('hidden');

    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('Pengguna meng-install aplikasi Kaldoku');
        }
        deferredPrompt = null;
        btnInstall.classList.add('hidden');
      }
    });
  });

  window.addEventListener('appinstalled', () => {
    btnInstall.classList.add('hidden');
    console.log('Aplikasi Kaldoku berhasil ter-install di perangkat.');
  });
}
