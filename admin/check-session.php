<?php
session_start();
header('Content-Type: application/json');

$response = ['valid' => false];

if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    // التحقق من مدة الجلسة (30 دقيقة)
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] <= 1800)) {
        $response['valid'] = true;
    } else {
        session_unset();
        session_destroy();
    }
}

echo json_encode($response);
