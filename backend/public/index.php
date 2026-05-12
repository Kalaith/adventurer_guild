<?php

declare(strict_types=1);

$autoloadCandidates = [
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/../../../../vendor/autoload.php',
];

$loader = null;
foreach ($autoloadCandidates as $candidate) {
    if (file_exists($candidate)) {
        $loader = require_once $candidate;
        break;
    }
}

$appSrcPath = realpath(__DIR__ . '/../src');
if ($loader instanceof \Composer\Autoload\ClassLoader && $appSrcPath !== false) {
    $loader->addPsr4('AdventurerGuild\\', $appSrcPath . DIRECTORY_SEPARATOR, true);
}

spl_autoload_register(static function (string $class) use ($appSrcPath): void {
    $prefix = 'AdventurerGuild\\';
    if ($appSrcPath === false || strpos($class, $prefix) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = $appSrcPath . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relative) . '.php';
    if (file_exists($path)) {
        require $path;
    }
});

use AdventurerGuild\Core\Environment;
use AdventurerGuild\Core\Router;

Environment::load(dirname(__DIR__));

$router = new Router();

$configuredBasePath = Environment::optional('APP_BASE_PATH');
if ($configuredBasePath !== null && $configuredBasePath !== '') {
    $router->setBasePath(rtrim($configuredBasePath, '/'));
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
