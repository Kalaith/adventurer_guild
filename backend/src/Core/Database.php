<?php

declare(strict_types=1);

namespace AdventurerGuild\Core;

use PDO;

final class Database
{
    public static function connect(): PDO
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            Environment::required('DB_HOST'),
            Environment::required('DB_PORT'),
            Environment::required('DB_NAME')
        );

        return new PDO($dsn, Environment::required('DB_USER'), Environment::required('DB_PASSWORD', true), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
