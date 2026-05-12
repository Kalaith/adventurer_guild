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

if ($loader === null) {
    throw new RuntimeException('Composer autoload.php not found.');
}

$appSrcPath = realpath(__DIR__ . '/../src');
if ($appSrcPath !== false && $loader instanceof \Composer\Autoload\ClassLoader) {
    $loader->addPsr4('AdventurerGuild\\', $appSrcPath . DIRECTORY_SEPARATOR, true);
}

spl_autoload_register(static function (string $class) use ($appSrcPath): void {
    $prefix = 'AdventurerGuild\\';
    if ($appSrcPath === false || strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $file = $appSrcPath . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relative) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
}, true, true);
