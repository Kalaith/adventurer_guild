<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

$failed = false;
foreach ($iterator as $file) {
    if (!$file instanceof SplFileInfo || $file->getExtension() !== 'php') {
        continue;
    }

    $path = $file->getPathname();
    if (str_contains($path, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR)) {
        continue;
    }

    $contents = file_get_contents($path);
    if ($contents === false || !str_contains($contents, 'declare(strict_types=1);')) {
        fwrite(STDERR, "Missing strict_types declaration: {$path}\n");
        $failed = true;
        continue;
    }

    $command = 'php -l ' . escapeshellarg($path);
    passthru($command, $exitCode);
    if ($exitCode !== 0) {
        $failed = true;
    }
}

exit($failed ? 1 : 0);
