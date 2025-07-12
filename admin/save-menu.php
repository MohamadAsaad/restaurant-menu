<?php
session_start();
header('Content-Type: application/json');

// التحقق من أن المستخدم مسجل الدخول
if (!isset($_SESSION['authenticated'])) {
    echo json_encode(['success' => false, 'message' => 'غير مصرح بالوصول']);
    exit;
}

// التحقق من أن الطلب هو POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'يجب أن يكون الطلب من نوع POST']);
    exit;
}

// التحقق من رأس Content-Type
if (!isset($_SERVER['CONTENT_TYPE']) || stripos($_SERVER['CONTENT_TYPE'], 'application/json') === false) {
    echo json_encode(['success' => false, 'message' => 'يجب أن يكون رأس Content-Type: application/json']);
    exit;
}

// تحديد مسار ملف القائمة
$menuFilePath = '../data/menu.json';
$response = ['success' => false, 'message' => 'حدث خطأ غير متوقع.'];

// قراءة البيانات الخام من الطلب
$json_data = file_get_contents('php://input');

// فك تشفير بيانات JSON
$menuData = json_decode($json_data, true);

// التحقق من أن فك التشفير تم بنجاح
if (json_last_error() !== JSON_ERROR_NONE) {
    $response['message'] = 'بيانات JSON غير صالحة. خطأ: ' . json_last_error_msg();
    echo json_encode($response);
    exit;
}

try {
    // قم بعمل نسخة احتياطية من الملف الحالي قبل الكتابة عليه
    if (file_exists($menuFilePath)) {
        $backupPath = '../data/backups/menu_' . date('Y-m-d_His') . '.json';
        if (!is_dir('../data/backups')) {
            mkdir('../data/backups', 0755, true);
        }
        copy($menuFilePath, $backupPath);
    }

    // كتابة البيانات الجديدة إلى الملف
    $bytesWritten = file_put_contents(
        $menuFilePath,
        json_encode($menuData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    if ($bytesWritten !== false) {
        $response['success'] = true;
        $response['message'] = 'تم حفظ القائمة بنجاح.';
    } else {
        $response['message'] = 'فشل في كتابة البيانات إلى الملف.';
    }
} catch (Exception $e) {
    $response['message'] = 'خطأ أثناء حفظ الملف: ' . $e->getMessage();
}

echo json_encode($response);
