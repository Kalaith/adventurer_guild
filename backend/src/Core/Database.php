<?php

declare(strict_types=1);

namespace AdventurerGuild\Core;

use PDO;

final class Database
{
    public static function connect(): PDO
    {
        $host = (string) ($_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '');
        $port = (string) ($_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306');
        $name = (string) ($_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: '');
        $user = (string) ($_ENV['DB_USER'] ?? getenv('DB_USER') ?: '');
        $password = (string) ($_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '');

        if ($host === '' || $name === '' || $user === '') {
            throw new \RuntimeException('Database configuration missing. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.');
        }

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
