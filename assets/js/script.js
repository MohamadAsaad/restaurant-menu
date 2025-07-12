document.addEventListener('DOMContentLoaded', function () {
    // تهيئة السلة عند تحميل الصفحة
    initCartSystem();

    // تحميل قائمة الطعام
    loadMenu();

    // إعداد تأثيرات الصفحة
    setupPageEffects();
});

// ============== متغيرات النظام ==============
let cart = [];
const whatsappNumber = "+905398847282"; // رقم الواتساب
const menuDataUrl = 'data/menu.json'; // مسار ملف القائمة

// ============== نظام السلة ==============
function initCartSystem() {
    loadCartFromStorage();
    setupCartButton();
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('restaurantCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (e) {
        console.error("Error loading cart from storage:", e);
        localStorage.removeItem('restaurantCart');
        cart = [];
    }
}

function saveCartToStorage() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function setupCartButton() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartModal);
    }
}

// ============== نظام القائمة ==============
async function loadMenu() {
    try {
        const response = await fetch(`${menuDataUrl}?t=${new Date().getTime()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const menuData = await response.json();

        if (!menuData.sections || !Array.isArray(menuData.sections)) {
            throw new Error("Invalid menu data structure");
        }

        displayRestaurantInfo(menuData);
        renderMenuSections(menuData.sections);

    } catch (error) {
        console.error("Failed to load menu:", error);
        showError("تعذر تحميل قائمة الطعام. يرجى المحاولة لاحقاً.");
    }
}

function displayRestaurantInfo(data) {
    const nameElement = document.getElementById('restaurant-name');
    const descElement = document.getElementById('restaurant-description');

    if (nameElement) nameElement.textContent = data.restaurant_name || "اسم المطعم";
    if (descElement) descElement.textContent = data.description || "وصف المطعم";
}

function renderMenuSections(sections) {
    const filterContainer = document.getElementById('category-filter');
    const menuContainer = document.getElementById('menu-container');

    if (!filterContainer || !menuContainer) return;

    // عرض أزرار التصنيفات
    filterContainer.innerHTML = `
        <button class="btn btn-outline-primary filter-btn active" data-filter="all">الكل</button>
        ${sections.map(section => `
            <button class="btn btn-outline-primary filter-btn" data-filter="section-${section.id}">
                ${section.name}
            </button>
        `).join('')}
    `;

    // عرض عناصر القائمة
    menuContainer.innerHTML = sections.map(section => `
        ${section.items.map(item => createMenuItemHTML(section, item)).join('')}
    `).join('');

    // إعداد أحداث الفلترة
    setupFilterEvents();

    // إعداد أحداث إضافة للسلة
    setupAddToCartEvents();
}

function createMenuItemHTML(section, item) {
    return `
    <div class="col-lg-4 col-md-6 menu-item" data-category="section-${section.id}">
        <div class="menu-card h-100">
            ${item.image ? `
                <div class="menu-img-container">
                    <img src="${item.image}" alt="${item.name}" class="menu-img" loading="lazy">
                </div>
            ` : ''}
            <div class="menu-card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h3 class="item-name">${item.name}</h3>
                    <span class="item-price">${item.price.toFixed(2)} ر.س</span>
                </div>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge badge-category">${section.name}</span>
                    <button class="btn btn-sm btn-primary add-to-cart-btn" 
                            data-item='${JSON.stringify(item)}'>
                        <i class="fas fa-plus me-1"></i> أضف للسلة
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

function setupFilterEvents() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // إزالة التنشيط من جميع الأزرار
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

            // تنشيط الزر الحالي
            this.classList.add('active');

            // تطبيق الفلترة
            const filterValue = this.getAttribute('data-filter');
            filterMenuItems(filterValue);
        });
    });
}

function filterMenuItems(filter) {
    document.querySelectorAll('.menu-item').forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setupAddToCartEvents() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            try {
                const itemData = JSON.parse(this.getAttribute('data-item'));
                addItemToCart(itemData);
            } catch (e) {
                console.error("Error parsing item data:", e);
            }
        });
    });
}

// ============== إدارة السلة ==============
function addItemToCart(item) {
    // التحقق من أن العنصر يحتوي على البيانات المطلوبة
    if (!item || !item.id || !item.name || !item.price) {
        console.error("Invalid item data:", item);
        return;
    }

    // البحث إذا كان العنصر موجوداً بالفعل في السلة
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || '',
            quantity: 1
        });
    }

    // تحديث الواجهة والتخزين
    updateCartCount();
    saveCartToStorage();

    // عرض تنبيه بالإضافة
    showToast(`تمت إضافة ${item.name} إلى السلة`, 'success');
}

function openCartModal() {
    const modal = new bootstrap.Modal('#cartModal');
    renderCartItems();
    modal.show();
}

function renderCartItems() {
    const cartContainer = document.getElementById('cart-items');

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-message text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">سلة التسوق فارغة</p>
            </div>
        `;
        return;
    }

    let total = 0;
    let itemsCount = 0;

    cartContainer.innerHTML = `
        <div class="cart-header d-flex justify-content-between align-items-center mb-3">
            <h5>عناصر السلة</h5>
            <button class="btn btn-sm btn-outline-danger" onclick="clearCart()">
                <i class="fas fa-trash-alt me-1"></i> إفراغ السلة
            </button>
        </div>
        <ul class="list-group cart-items-list mb-3">
            ${cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsCount += item.quantity;

        return `
                <li class="list-group-item cart-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            ${item.image ? `
                                <img src="${item.image}" alt="${item.name}" 
                                     class="cart-item-image me-3 rounded" width="60" height="60">
                            ` : ''}
                            <div>
                                <h6 class="cart-item-title mb-1">${item.name}</h6>
                                <p class="cart-item-price mb-0">${item.price.toFixed(2)} ر.س</p>
                            </div>
                        </div>
                        <div class="cart-item-controls d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="updateCartItemQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="updateCartItemQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <span class="item-total ms-3 fw-bold">${itemTotal.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                </li>
                `;
    }).join('')}
        </ul>
        <div class="cart-summary p-3 bg-light rounded">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>عدد العناصر:</span>
                <span class="fw-bold">${itemsCount}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">الإجمالي:</h5>
                <h5 class="mb-0">${total.toFixed(2)} ر.س</h5>
            </div>
        </div>
    `;
}

function updateCartItemQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    // إذا كانت الكمية أقل من 1، نزيل العنصر من السلة
    if (cart[itemIndex].quantity < 1) {
        cart.splice(itemIndex, 1);
        showToast('تم إزالة العنصر من السلة', 'info');
    }

    // حفظ التحديثات
    updateCartCount();
    saveCartToStorage();

    // إعادة عرض السلة
    renderCartItems();
}

function clearCart() {
    if (cart.length === 0) return;

    cart = [];
    updateCartCount();
    saveCartToStorage();
    renderCartItems();

    showToast('تم إفراغ السلة بنجاح', 'info');
}

// ============== إرسال الطلب ==============
function confirmOrder() {
    if (cart.length === 0) {
        showToast('السلة فارغة، أضف عناصر أولاً', 'warning');
        return;
    }

    const confirmModal = new bootstrap.Modal('#confirmModal');
    confirmModal.show();
}

function sendOrder() {
    const note = document.getElementById('order-note').value.trim();

    // تحضير رسالة الطلب
    const orderSummary = cart.map(item =>
        `• ${item.name} - ${item.quantity} × ${item.price.toFixed(2)} ر.س = ${(item.quantity * item.price).toFixed(2)} ر.س`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const message = `🎯 طلب جديد من مطعم النخبة الذهبية\n\n` +
        `📅 ${new Date().toLocaleString('ar-SA')}\n\n` +
        `📋 تفاصيل الطلب:\n${orderSummary}\n\n` +
        `🛒 عدد العناصر: ${itemsCount}\n` +
        `💰 الإجمالي: ${total.toFixed(2)} ر.س\n` +
        `📝 الملاحظات: ${note || 'لا توجد'}\n` +
        `💵 طريقة الدفع: عند الاستلام`;

    // تشفير الرسالة لإرسالها عبر واتساب
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // فتح الرابط في نافذة جديدة
    window.open(whatsappUrl, '_blank');

    // إفراغ السلة بعد الإرسال
    clearCart();

    // إغلاق النوافذ
    bootstrap.Modal.getInstance('#cartModal').hide();
    bootstrap.Modal.getInstance('#confirmModal').hide();
}

// ============== أدوات مساعدة ==============
function setupPageEffects() {
    // تأثيرات التمرير لشريط التنقل
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // تهيئة تأثيرات WOW.js
    new WOW().init();
}

function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.className = `toast-notification toast-${type}`;
    toastContainer.innerHTML = `
        <div class="toast-message">${message}</div>
        <i class="fas fa-${type === 'success' ? 'check' : 'info'} toast-icon"></i>
    `;

    document.body.appendChild(toastContainer);

    // إظهار التنبيه
    setTimeout(() => {
        toastContainer.classList.add('show');
    }, 10);

    // إخفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
        toastContainer.classList.remove('show');
        setTimeout(() => toastContainer.remove(), 300);
    }, 3000);
}

function showError(message) {
    const errorContainer = document.getElementById('error-container') || createErrorContainer();
    errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
            <strong>خطأ:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'error-container fixed-top';
    document.body.prepend(container);
    return container;
}