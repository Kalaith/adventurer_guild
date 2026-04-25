<?php

declare(strict_types=1);

namespace AdventurerGuild\Support;

use RuntimeException;

final class Jwt
{
    public static function encode(array $payload, string $secret): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            self::base64UrlEncode((string) json_encode($header)),
            self::base64UrlEncode((string) json_encode($payload)),
        ];
        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);
        return implode('.', $segments);
    }

    public static function decode(string $jwt, string $secret): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token format');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true));
        if (!hash_equals($expected, $encodedSignature)) {
            throw new RuntimeException('Invalid token signature');
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!is_array($payload)) {
            throw new RuntimeException('Invalid token payload');
        }

        $expiresAt = isset($payload['exp']) ? (int) $payload['exp'] : 0;
        if ($expiresAt > 0 && $expiresAt < time()) {
            throw new RuntimeException('Token expired');
        }

        return $payload;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }
        return (string) base64_decode(strtr($value, '-_', '+/'));
    }
}
