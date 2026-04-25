<?php

declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'AdventurerGuild\\';
    if (strpos($class, $prefix) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($path)) {
        require $path;
    }
});

$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

use AdventurerGuild\Core\Router;

$router = new Router();

if (isset($_ENV['APP_BASE_PATH']) && $_ENV['APP_BASE_PATH'] !== '') {
    $router->setBasePath(rtrim($_ENV['APP_BASE_PATH'], '/'));
} else {
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '';
    $apiPos = strpos($requestPath, '/api');
    if ($apiPos !== false) {
        $basePath = substr($requestPath, 0, $apiPos);
        if ($basePath !== '') {
            $router->setBasePath($basePath);
        }
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Origin, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    http_response_code(200);
    exit;
}

(require dirname(__DIR__) . '/src/Routes/router.php')($router);
$router->handle();
