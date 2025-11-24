<?php
// Forward Vercel requests to the normal Laravel index.php
try {
    // Set error reporting for production
    error_reporting(E_ALL);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');

    // Ensure the path exists
    $laravelIndex = __DIR__ . '/../public/index.php';
    if (!file_exists($laravelIndex)) {
        http_response_code(500);
        echo json_encode(['error' => 'Laravel application not found']);
        exit;
    }

    require $laravelIndex;
} catch (Throwable $e) {
    error_log('Vercel API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : 'An error occurred'
    ]);
    exit;
}
