<?php
// Forward Vercel requests to the normal Laravel index.php
try {
    // Set error reporting for production
    error_reporting(E_ALL);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');

    // CRITICAL FIX: Strip /api prefix from REQUEST_URI before Laravel processes it
    // Vercel routes /api/* to this file, but Laravel will add /api prefix to routes automatically
    // So we need to remove /api from REQUEST_URI so Laravel can match routes correctly
    if (isset($_SERVER['REQUEST_URI'])) {
        // Remove /api prefix if present at the start
        if (strpos($_SERVER['REQUEST_URI'], '/api') === 0) {
            $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 4); // Remove '/api'
            // Ensure it starts with / or is empty (handles /api -> '' and /api/ -> /)
            if (empty($_SERVER['REQUEST_URI']) || $_SERVER['REQUEST_URI'] === '') {
                $_SERVER['REQUEST_URI'] = '/';
            } elseif ($_SERVER['REQUEST_URI'][0] !== '/') {
                $_SERVER['REQUEST_URI'] = '/' . $_SERVER['REQUEST_URI'];
            }
        }
    }

    // Also update PATH_INFO if it exists and contains /api
    if (isset($_SERVER['PATH_INFO']) && strpos($_SERVER['PATH_INFO'], '/api') === 0) {
        $_SERVER['PATH_INFO'] = substr($_SERVER['PATH_INFO'], 4);
        if (empty($_SERVER['PATH_INFO']) || $_SERVER['PATH_INFO'] === '') {
            $_SERVER['PATH_INFO'] = '/';
        } elseif ($_SERVER['PATH_INFO'][0] !== '/') {
            $_SERVER['PATH_INFO'] = '/' . $_SERVER['PATH_INFO'];
        }
    }

    // Ensure the path exists
    $laravelIndex = __DIR__ . '/../public/index.php';

    if (!file_exists($laravelIndex)) {
        http_response_code(500);
        echo json_encode(['error' => 'Laravel application not found']);
        exit;
    }

    // CRITICAL FIX: Capture Laravel's response and ensure it's output as a string
    // Vercel requires the response body to be a string, not a stream or binary response object
    // Use output buffering to capture Laravel's response
    ob_start();

    try {
        require $laravelIndex;

        // Get the output buffer content
        $output = ob_get_clean();

        // Ensure output is always a string (Vercel requirement)
        // Laravel's handleRequest() should output the response, but we need to ensure it's a string
        if ($output === false) {
            $output = '';
        }

        if (!is_string($output)) {
            // If output is not a string, convert it
            if (is_object($output) || is_array($output)) {
                $output = json_encode($output);
            } else {
                $output = (string) $output;
            }
        }

        // Output the response as a string
        echo $output;

    } catch (Throwable $innerException) {
        // Clean output buffer on exception
        if (ob_get_level() > 0) {
            ob_end_clean();
        }
        throw $innerException;
    }

} catch (Throwable $e) {
    // Clean any output buffer on error
    if (ob_get_level() > 0) {
        ob_end_clean();
    }

    error_log('Vercel API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : 'An error occurred'
    ]);
    exit;
}
