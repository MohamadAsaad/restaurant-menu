<?php
header('Content-Type: application/json');

// تحديد مسار ملف القائمة
$menuFilePath = '../data/menu.json';
$response = ['success' => false, 'message' => 'حدث خطأ غير متوقع.'];

// التحقق من أن الطلب هو POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // قراءة البيانات الخام من الطلب
    $json_data = file_get_contents('php://input');

    // فك تشفير بيانات JSON
    $menuData = json_decode($json_data, true);

    // التحقق من أن فك التشفير تم بنجاح
    if (json_last_error() === JSON_ERROR_NONE) {
        try {
            // قم بعمل نسخة احتياطية من الملف الحالي قبل الكتابة عليه
            if (file_exists($menuFilePath)) {
                copy($menuFilePath, $menuFilePath . '.bak');
            }

            // كتابة البيانات الجديدة إلى الملف
            // JSON_PRETTY_PRINT لجعل الملف مقروءًا
            // JSON_UNESCAPED_UNICODE للحفاظ على الأحرف العربية
            $bytesWritten = file_put_contents($menuFilePath, json_encode($menuData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            if ($bytesWritten !== false) {
                $response['success'] = true;
                $response['message'] = 'تم حفظ القائمة بنجاح.';
            } else {
                $response['message'] = 'فشل في كتابة البيانات إلى الملف.';
            }
        } catch (Exception $e) {
            $response['message'] = 'خطأ أثناء حفظ الملف: ' . $e->getMessage();
        }
    } else {
        $response['message'] = 'بيانات JSON غير صالحة. خطأ: ' . json_last_error_msg();
    }
} else {
    $response['message'] = 'يجب أن يكون الطلب من نوع POST.';
}

echo json_encode($response);
