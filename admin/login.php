<?php
session_start();

// بيانات المستخدمين المسموح لهم (يفضل استبدالها بقاعدة بيانات في الإنتاج)
$valid_users = [
    'admin' => [
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'role' => 'admin'
    ]
];

// إذا كان المستخدم مسجل دخول بالفعل، توجيهه إلى لوحة التحكم
if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    header('Location: admin.php');
    exit;
}

// معالجة تسجيل الدخول
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (isset($valid_users[$username]) && password_verify($password, $valid_users[$username]['password'])) {
        $_SESSION['authenticated'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $valid_users[$username]['role'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['login_time'] = time();

        // إعادة توجيه إلى لوحة التحكم
        header('Location: admin.php');
        exit;
    } else {
        $error = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول إلى لوحة التحكم</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #f4f7f6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .login-container h2 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Tajawal', sans-serif;
            font-size: 1rem;
        }

        .login-button {
            width: 100%;
            padding: 0.75rem;
            background-color: #5d78ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Tajawal', sans-serif;
            font-size: 1rem;
            transition: background-color 0.2s;
        }

        .login-button:hover {
            background-color: #4a67e0;
        }

        .error {
            color: #dc3545;
            text-align: center;
            margin-bottom: 1rem;
        }
    </style>
</head>

<body>
    <div class="login-container">
        <h2>تسجيل الدخول إلى لوحة التحكم</h2>
        <?php if (isset($error)): ?>
            <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>
        <form method="POST">
            <div class="form-group">
                <label for="username">اسم المستخدم</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="login-button">تسجيل الدخول</button>
        </form>
    </div>
</body>

</html>