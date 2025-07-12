document.addEventListener('DOMContentLoaded', function () {
    // تغيير شريط التنقل عند التمرير
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            document.querySelector('.navbar').classList.add('scrolled');
        } else {
            document.querySelector('.navbar').classList.remove('scrolled');
        }
    });

    // تحميل قائمة الطعام
    fetchMenuData();

    // فلترة الأصناف
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterMenuItems(filter);
        });
    });
});

function fetchMenuData() {
    fetch('data/menu.json?' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            document.getElementById('restaurant-name').textContent = data.restaurant_name;
            document.getElementById('restaurant-description').textContent = data.description;
            renderMenu(data.sections);

            // إضافة تأثيرات ظهور تدريجي
            setTimeout(() => {
                document.querySelectorAll('.menu-item').forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.1}s`;
                    item.classList.add('menu-item');
                });
            }, 100);
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            document.getElementById('menu-container').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        حدث خطأ في تحميل قائمة الطعام. يرجى تحديث الصفحة.
                    </div>
                </div>
            `;
        });
}

function renderMenu(sections) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';

    if (!sections || sections.length === 0) {
        menuContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    لا توجد أقسام في القائمة حالياً.
                </div>
            </div>
        `;
        return;
    }

    sections.forEach(section => {
        section.items.forEach(item => {
            const itemHtml = `
                <div class="col-lg-4 col-md-6 menu-item" data-category="${section.id}">
                    <div class="menu-card h-100">
                        ${item.image ? `
                            <div class="menu-img-container" style="overflow: hidden;">
                                <img src="${item.image}" alt="${item.name}" class="menu-img">
                            </div>
                        ` : ''}
                        <div class="menu-card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h3 class="item-name">${item.name}</h3>
                                <span class="item-price">${item.price.toFixed(2)} ر.س</span>
                            </div>
                            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                            <span class="badge badge-category">${section.name}</span>
                        </div>
                    </div>
                </div>
            `;
            menuContainer.innerHTML += itemHtml;
        });
    });
}

function filterMenuItems(filter) {
    const allItems = document.querySelectorAll('.menu-item');

    allItems.forEach(item => {
        item.style.display = 'none';

        if (filter === 'all' || item.getAttribute('data-category') === filter) {
            setTimeout(() => {
                item.style.display = 'block';
            }, 50);
        }
    });
}