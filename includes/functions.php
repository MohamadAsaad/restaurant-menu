<?php
session_start();

function generateId()
{
    return rand(1000, 9999);
}

function displayMessage()
{
    if (!empty($_SESSION['message'])) {
        $message = $_SESSION['message'];
        echo '<div class="alert alert-' . htmlspecialchars($message['type']) . ' alert-dismissible fade show">';
        echo htmlspecialchars($message['text']);
        echo '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
        echo '</div>';

        unset($_SESSION['message']);
    }
}

function ensureMenuFileExists()
{
    $filePath = '../data/menu.json';
    $dirPath = dirname($filePath);

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!file_exists($dirPath)) {
        mkdir($dirPath, 0755, true);
    }

    if (!file_exists($filePath)) {
        $initialData = [
            'restaurant_name' => 'مطعم جديد',
            'description' => 'وصف المطعم',
            'sections' => []
        ];
        file_put_contents($filePath, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

function logError($error)
{
    $logFile = '../data/error_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $errorMessage = "[$timestamp] $error\n";

    // إضافة الخطأ إلى ملف السجل
    file_put_contents($logFile, $errorMessage, FILE_APPEND);

    // إرسال بريد إلكتروني في حالة الأخطاء الحرجة (اختياري)
    if (strpos($error, 'CRITICAL') !== false) {
        // mail('admin@example.com', 'خطأ حرج في النظام', $errorMessage);
    }
}

function validateImageUrl($url)
{
    if (empty($url)) return true;
    return filter_var($url, FILTER_VALIDATE_URL);
}
