document.addEventListener('DOMContentLoaded', () => {
    // --- الحالة العامة للتطبيق ---
    const state = {
        menuData: null,
        originalMenuData: null,
        activeSectionId: null,
        hasChanges: false,
    };

    // --- عناصر الواجهة ---
    const ui = {
        sidebar: document.getElementById('sidebar'),
        mainContent: document.getElementById('main-content'),
        sectionsList: document.getElementById('sections-list'),
        itemsContainer: document.getElementById('items-container'),
        restaurantNameDisplay: document.getElementById('restaurant-name-display'),
        currentSectionName: document.getElementById('current-section-name'),
        saveBanner: document.getElementById('save-banner'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        modalContent: document.getElementById('modal-content'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        toastContainer: document.getElementById('toast-container'),
    };

    // --- دوال العرض (Render) ---
    const render = {
        sidebar: () => {
            ui.restaurantNameDisplay.textContent = state.menuData.restaurant_name;
            ui.sectionsList.innerHTML = '';
            state.menuData.sections.forEach(section => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'section-item';
                if (section.id === state.activeSectionId) {
                    sectionEl.classList.add('active');
                }
                sectionEl.dataset.id = section.id;
                sectionEl.innerHTML = `
                    <i class="fas fa-grip-vertical"></i>
                    <span class="section-name">${section.name}</span>
                    <button class="icon-button edit-section-btn"><i class="fas fa-edit"></i></button>
                    <button class="icon-button delete-section-btn"><i class="fas fa-trash"></i></button>
                `;
                ui.sectionsList.appendChild(sectionEl);
            });
            render.content();
        },
        content: () => {
            if (!state.activeSectionId) {
                ui.currentSectionName.textContent = 'اختر قسمًا لعرض أصنافه';
                ui.itemsContainer.innerHTML = '<p class="placeholder">أو قم بإضافة صنف جديد في القسم المختار.</p>';
                return;
            }
            const section = state.menuData.sections.find(s => s.id === state.activeSectionId);
            if (!section) return;

            ui.currentSectionName.textContent = section.name;
            ui.itemsContainer.innerHTML = '';

            const items = section.items || [];
            if (items.length > 0) {
                items.forEach(item => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card';
                    itemCard.dataset.id = item.id;
                    itemCard.innerHTML = `
                        <img src="${item.image || 'https://via.placeholder.com/300x180.png?text=No+Image'}" alt="${item.name}" class="item-image">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p class="item-description">${item.description || ''}</p>
                            <div class="item-price">${item.price} ر.س</div>
                        </div>
                        <div class="item-actions">
                             <button class="icon-button edit-item-btn"><i class="fas fa-edit"></i></button>
                             <button class="icon-button delete-item-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    ui.itemsContainer.appendChild(itemCard);
                });
            } else {
                ui.itemsContainer.innerHTML = '<p class="placeholder">لا توجد أصناف في هذا القسم. قم بإضافة صنف جديد.</p>';
            }

            // إضافة زر لإضافة صنف جديد
            const addItemCard = document.createElement('div');
            addItemCard.className = 'item-card add-new';
            addItemCard.innerHTML = `<button id="add-item-btn" class="button-primary full-width" style="height:100%;"><i class="fas fa-plus"></i> إضافة صنف جديد</button>`;
            ui.itemsContainer.appendChild(addItemCard);
        },
        saveBanner: () => {
            ui.saveBanner.classList.toggle('hidden', !state.hasChanges);
        }
    };

    // --- دوال التعامل مع الخادم (API) ---
    const api = {
        load: async () => {
            try {
                const response = await secureFetch('../data/menu.json?t=' + new Date().getTime());
                if (!response.ok) throw new Error('فشل تحميل القائمة');
                const data = await response.json();
                state.menuData = data;
                state.originalMenuData = JSON.parse(JSON.stringify(data)); // نسخة عميقة
                helpers.showToast('تم تحميل القائمة بنجاح');
            } catch (error) {
                console.error(error);
                helpers.showToast('خطأ في تحميل القائمة', 'danger');
                // في حالة الفشل، يتم إنشاء قائمة فارغة
                state.menuData = { restaurant_name: "مطعمي", description: "", sections: [] };
                state.originalMenuData = JSON.parse(JSON.stringify(state.menuData));
            }
        },
        save: async () => {
            helpers.showToast('جاري حفظ التغييرات...');
            try {
                const response = await secureFetch('save-menu.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state.menuData)
                });
                const result = await response.json();
                if (!result.success) throw new Error(result.message || 'فشل حفظ القائمة');

                state.originalMenuData = JSON.parse(JSON.stringify(state.menuData));
                state.hasChanges = false;
                render.saveBanner();
                helpers.showToast('تم حفظ التغييرات بنجاح');
            } catch (error) {
                console.error(error);
                helpers.showToast(error.message, 'danger');
            }
        }
    };

    // --- دوال مساعدة ---
    const helpers = {
        generateId: () => Date.now(),
        showToast: (message, type = 'success') => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            ui.toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        },
        setChanges: (changed = true) => {
            state.hasChanges = changed;
            render.saveBanner();
        },
        confirmAction: (title, onConfirm) => {
            if (confirm(title)) {
                onConfirm();
            }
        },
        checkSession: async () => {
            try {
                const response = await fetch('check-session.php');
                const data = await response.json();
                if (!data.valid) {
                    window.location.href = 'login.php?session=expired';
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        }
    };

    // --- دوال النوافذ المنبثقة (Modal) ---
    const modal = {
        open: (title, bodyHtml) => {
            ui.modalTitle.textContent = title;
            ui.modalBody.innerHTML = bodyHtml;
            ui.modalBackdrop.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        },
        close: () => {
            ui.modalBackdrop.classList.add('hidden');
            ui.modalBody.innerHTML = '';
            document.body.style.overflow = '';
        },
        openRestaurantInfo: () => {
            const formHtml = `
                <div class="form-group">
                    <label for="name">اسم المطعم</label>
                    <input type="text" id="name" value="${state.menuData.restaurant_name}">
                </div>
                <div class="form-group">
                    <label for="desc">وصف المطعم</label>
                    <textarea id="desc">${state.menuData.description}</textarea>
                </div>
                <div class="modal-footer">
                    <button id="save-restaurant" class="button-primary">حفظ</button>
                </div>
            `;
            modal.open('تعديل معلومات المطعم', formHtml);
            document.getElementById('save-restaurant').onclick = () => {
                state.menuData.restaurant_name = document.getElementById('name').value;
                state.menuData.description = document.getElementById('desc').value;
                helpers.setChanges();
                render.sidebar();
                modal.close();
            };
        },
        openSection: (sectionId = null) => {
            const isNew = sectionId === null;
            const section = isNew ? { name: '' } : state.menuData.sections.find(s => s.id === sectionId);
            if (!section) return;

            const title = isNew ? 'إضافة قسم جديد' : 'تعديل القسم';
            const formHtml = `
                <div class="form-group">
                    <label for="sectionName">اسم القسم</label>
                    <input type="text" id="sectionName" value="${section.name}">
                </div>
                <div class="modal-footer">
                     <button id="save-section" class="button-primary">حفظ</button>
                </div>
            `;
            modal.open(title, formHtml);
            document.getElementById('save-section').onclick = () => {
                const newName = document.getElementById('sectionName').value;
                if (!newName) {
                    helpers.showToast('يجب إدخال اسم للقسم', 'danger');
                    return;
                }
                if (isNew) {
                    const newSection = { id: helpers.generateId(), name: newName, items: [] };
                    state.menuData.sections.push(newSection);
                    state.activeSectionId = newSection.id;
                } else {
                    section.name = newName;
                }
                helpers.setChanges();
                render.sidebar();
                modal.close();
            };
        },
        openItem: (itemId = null) => {
            const isNew = itemId === null;
            const section = state.menuData.sections.find(s => s.id === state.activeSectionId);
            const item = isNew ? { name: '', description: '', price: 0, image: '' } : section.items.find(i => i.id === itemId);
            if (!item) return;

            const title = isNew ? 'إضافة صنف جديد' : 'تعديل الصنف';
            const formHtml = `
                <div class="form-group">
                    <label for="itemName">اسم الصنف</label>
                    <input type="text" id="itemName" value="${item.name}">
                </div>
                 <div class="form-group">
                    <label for="itemDesc">الوصف</label>
                    <textarea id="itemDesc">${item.description}</textarea>
                </div>
                 <div class="form-group">
                    <label for="itemPrice">السعر</label>
                    <input type="number" id="itemPrice" value="${item.price}">
                </div>
                 <div class="form-group">
                    <label for="itemImage">رابط الصورة</label>
                    <input type="text" id="itemImage" value="${item.image}">
                    <img src="${item.image || ''}" class="image-preview ${!item.image && 'hidden'}">
                </div>
                <div class="modal-footer">
                     <button id="save-item" class="button-primary">حفظ</button>
                </div>
            `;
            modal.open(title, formHtml);

            document.getElementById('itemImage').oninput = (e) => {
                const preview = document.querySelector('.image-preview');
                preview.src = e.target.value;
                preview.classList.remove('hidden');
            };

            document.getElementById('save-item').onclick = () => {
                const newItemData = {
                    name: document.getElementById('itemName').value,
                    description: document.getElementById('itemDesc').value,
                    price: parseFloat(document.getElementById('itemPrice').value) || 0,
                    image: document.getElementById('itemImage').value
                };

                if (!newItemData.name) {
                    helpers.showToast('يجب إدخال اسم للصنف', 'danger');
                    return;
                }

                if (isNew) {
                    newItemData.id = helpers.generateId();
                    section.items.push(newItemData);
                } else {
                    const itemIndex = section.items.findIndex(i => i.id === itemId);
                    section.items[itemIndex] = { ...item, ...newItemData };
                }
                helpers.setChanges();
                render.content();
                modal.close();
            };
        }
    };

    // --- معالجة الأحداث (Event Handlers) ---
    function setupEventListeners() {
        // تعديل معلومات المطعم
        document.getElementById('edit-restaurant-info').addEventListener('click', modal.openRestaurantInfo);

        // إضافة قسم جديد
        document.getElementById('add-section-btn').addEventListener('click', () => modal.openSection());

        // إغلاق النافذة
        ui.modalCloseBtn.addEventListener('click', modal.close);
        ui.modalBackdrop.addEventListener('click', (e) => {
            if (e.target === ui.modalBackdrop) modal.close();
        });

        // الأحداث داخل القوائم (Sections & Items)
        ui.sidebar.addEventListener('click', e => {
            const sectionItem = e.target.closest('.section-item');
            if (sectionItem) {
                // تفعيل القسم
                if (!e.target.closest('button')) {
                    state.activeSectionId = Number(sectionItem.dataset.id);
                    render.sidebar();
                }
                // تعديل القسم
                if (e.target.closest('.edit-section-btn')) {
                    modal.openSection(Number(sectionItem.dataset.id));
                }
                // حذف القسم
                if (e.target.closest('.delete-section-btn')) {
                    helpers.confirmAction('هل أنت متأكد من حذف هذا القسم وكل أصنافه؟', () => {
                        state.menuData.sections = state.menuData.sections.filter(s => s.id !== Number(sectionItem.dataset.id));
                        if (state.activeSectionId === Number(sectionItem.dataset.id)) {
                            state.activeSectionId = null;
                        }
                        helpers.setChanges();
                        render.sidebar();
                    });
                }
            }
        });

        ui.mainContent.addEventListener('click', e => {
            const itemCard = e.target.closest('.item-card');
            // إضافة صنف
            if (e.target.closest('#add-item-btn')) {
                modal.openItem();
            }
            // تعديل صنف
            if (e.target.closest('.edit-item-btn')) {
                modal.openItem(Number(itemCard.dataset.id));
            }
            // حذف صنف
            if (e.target.closest('.delete-item-btn')) {
                helpers.confirmAction('هل أنت متأكد من حذف هذا الصنف؟', () => {
                    const section = state.menuData.sections.find(s => s.id === state.activeSectionId);
                    section.items = section.items.filter(i => i.id !== Number(itemCard.dataset.id));
                    helpers.setChanges();
                    render.content();
                });
            }
        });

        // أزرار الحفظ والتجاهل
        document.getElementById('save-changes-btn').addEventListener('click', api.save);
        document.getElementById('discard-changes-btn').addEventListener('click', async () => {
            await api.load();
            state.hasChanges = false;
            render.sidebar();
            render.saveBanner();
        });
    }

    // --- دوال السحب والإفلات ---
    function initSortable() {
        // فرز الأقسام
        new Sortable(ui.sectionsList, {
            animation: 150,
            handle: '.fa-grip-vertical',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;
                const [movedItem] = state.menuData.sections.splice(oldIndex, 1);
                state.menuData.sections.splice(newIndex, 0, movedItem);
                helpers.setChanges();
            }
        });
        // فرز الأصناف
        new Sortable(ui.itemsContainer, {
            animation: 150,
            filter: '.add-new', // لا تسمح بفرز زر الإضافة
            onEnd: (evt) => {
                const section = state.menuData.sections.find(s => s.id === state.activeSectionId);
                if (!section) return;
                const { oldIndex, newIndex } = evt;
                const [movedItem] = section.items.splice(oldIndex, 1);
                section.items.splice(newIndex, 0, movedItem);
                helpers.setChanges();
            }
        });
    }

    // --- دوال الأمان ---
    async function secureFetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                // غير مصرح - توجيه إلى تسجيل الدخول
                window.location.href = 'login.php?session=expired';
                return Promise.reject('Session expired');
            }
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // --- بدء تشغيل التطبيق ---
    async function init() {
        // التحقق من الجلسة عند التحميل
        await helpers.checkSession();

        // تحميل البيانات
        await api.load();

        // تهيئة الواجهة
        render.sidebar();
        setupEventListeners();
        initSortable();

        // تفعيل مؤقت التحقق من الجلسة
        setInterval(helpers.checkSession, 5 * 60 * 1000); // كل 5 دقائق

        // تفعيل مؤقت عدم النشاط
        let inactivityTimer;
        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                helpers.showToast('جلسة العمل على وشك الانتهاء بسبب عدم النشاط', 'warning');
            }, 25 * 60 * 1000); // 25 دقيقة
        };

        // تفعيل المؤقت مع أحداث المستخدم
        ['click', 'mousemove', 'keypress'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer);
        });

        resetInactivityTimer();
    }

    init();
});