<?php

declare(strict_types=1);

return [
    'demo_login_enabled' => filter_var(env('LOBO_DEMO_LOGIN_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
    'demo_admin_email' => (string) env('LOBO_DEMO_ADMIN_EMAIL', 'admin@loboclub.com'),
    'demo_admin_password' => env('LOBO_DEMO_ADMIN_PASSWORD'),
    'demo_member_email' => (string) env('LOBO_DEMO_MEMBER_EMAIL', 'alex.rivera@loboclub.com'),
    'demo_member_password' => env('LOBO_DEMO_MEMBER_PASSWORD'),
];
