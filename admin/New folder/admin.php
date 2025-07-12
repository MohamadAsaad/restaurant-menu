<?php
// يمكنك إضافة أي وظائف تحقق من جلسات تسجيل الدخول هنا
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم الحديثة</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
</head>

<body>
    <div id="app-wrapper">
        <aside id="sidebar">
            <header class="sidebar-header">
                <h2 id="restaurant-name-display">اسم المطعم</h2>
                <button id="edit-restaurant-info" class="icon-button"><i class="fas fa-edit"></i></button>
            </header>
            <div id="sections-list" class="sortable-list">
            </div>
            <footer class="sidebar-footer">
                <button id="add-section-btn" class="button-primary full-width">
                    <i class="fas fa-plus"></i> إضافة قسم جديد
                </button>
            </footer>
        </aside>

        <main id="main-content">
            <header class="main-header">
                <h1 id="current-section-name">اختر قسمًا لعرض أصنافه</h1>
                <div id="save-banner" class="save-banner hidden">
                    <span>لديك تغييرات غير محفوظة</span>
                    <div class="banner-buttons">
                        <button id="discard-changes-btn" class="button-secondary">تجاهل</button>
                        <button id="save-changes-btn" class="button-success">حفظ التغييرات</button>
                    </div>
                </div>
            </header>
            <div id="items-container" class="sortable-list">
            </div>
        </main>
    </div>

    <div id="modal-backdrop" class="hidden">
        <div id="modal-content">
            <header class="modal-header">
                <h3 id="modal-title"></h3>
                <button id="modal-close-btn" class="icon-button"><i class="fas fa-times"></i></button>
            </header>
            <div id="modal-body">
            </div>
        </div>
    </div>

    <div id="toast-container"></div>

    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <script src="admin.js"></script>
</body>

</html>