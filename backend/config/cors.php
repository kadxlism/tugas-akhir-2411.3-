<?php

return [
    'paths' => ['api/*', 'login', 'logout', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://127.0.0.1:5173', // ⬅️ ini saja yang diperlukan saat production/dev build
    ],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,
];

