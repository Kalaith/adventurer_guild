<?php

declare(strict_types=1);

namespace AdventurerGuild\Core;

use RuntimeException;

final class Environment
{
    public static function load(string $directory): void
    {
        $dotenvClass = 'Dotenv\\Dotenv';
        if (class_exists($dotenvClass)) {
            $dotenvClass::createImmutable($directory)->safeLoad();
            return;
        }

        $envFile = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.env';
        if (!is_file($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            throw new RuntimeException('Unable to read environment file.');
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $trimmed, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }

    public static function required(string $key, bool $allowEmpty = false): string
    {
        $value = self::optional($key);
        if ($value === null || (!$allowEmpty && trim($value) === '')) {
            throw new RuntimeException('Missing required environment variable: ' . $key);
        }

        return $value;
    }

    public static function optional(string $key): ?string
    {
        if (array_key_exists($key, $_ENV) && is_string($_ENV[$key])) {
            return $_ENV[$key];
        }

        $value = getenv($key);
        return is_string($value) ? $value : null;
    }
}
