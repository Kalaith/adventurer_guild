<?php

declare(strict_types=1);

namespace AdventurerGuild\Controllers;

use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Support\Jwt;

final class AuthController
{
    public function session(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('auth_user');
        if (!is_array($authUser) || empty($authUser['id'])) {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Unauthorized',
                'login_url' => $_ENV['LOGIN_URL'] ?? '',
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write((string) json_encode([
            'success' => true,
            'data' => [
                'user' => $this->serializeUser($authUser),
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function guestSession(Request $request, Response $response): Response
    {
        $secret = (string) ($_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: '');
        if ($secret === '') {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => 'JWT secret not configured',
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $issuedAt = time();
        $guestUserId = 'guest_' . bin2hex(random_bytes(16));
        $guestName = 'Guest ' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $token = Jwt::encode([
            'sub' => $guestUserId,
            'user_id' => $guestUserId,
            'username' => $guestName,
            'display_name' => $guestName,
            'role' => 'guest',
            'roles' => ['guest'],
            'auth_type' => 'guest',
            'is_guest' => true,
            'iat' => $issuedAt,
            'exp' => $issuedAt + (60 * 60 * 24 * 30),
        ], $secret);

        $response->getBody()->write((string) json_encode([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $this->serializeUser([
                    'id' => $guestUserId,
                    'username' => $guestName,
                    'display_name' => $guestName,
                    'role' => 'guest',
                    'roles' => ['guest'],
                    'auth_type' => 'guest',
                    'is_guest' => true,
                ]),
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function linkGuest(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('auth_user');
        if (!is_array($authUser) || empty($authUser['id'])) {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Unauthorized',
                'login_url' => $_ENV['LOGIN_URL'] ?? '',
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $body = $request->getParsedBody();
        $guestUserId = is_array($body) ? (string) ($body['guest_user_id'] ?? '') : '';
        if ($guestUserId === '' || strpos($guestUserId, 'guest_') !== 0) {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => 'Invalid guest user identifier',
            ]));
            return $response->withStatus(422)->withHeader('Content-Type', 'application/json');
        }

        if (($authUser['role'] ?? '') === 'admin') {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => 'Guest accounts cannot be linked to admin accounts',
            ]));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write((string) json_encode([
            'success' => true,
            'data' => [
                'linked' => true,
                'guest_user_id' => $guestUserId,
                'linked_to_user_id' => (string) $authUser['id'],
                'moved_rows_by_table' => [],
                'total_moved_rows' => 0,
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    private function serializeUser(array $authUser): array
    {
        return [
            'id' => (string) $authUser['id'],
            'email' => $authUser['email'] ?? null,
            'username' => $authUser['username'] ?? null,
            'display_name' => $authUser['display_name'] ?? ($authUser['username'] ?? null),
            'role' => $authUser['role'] ?? 'user',
            'roles' => $authUser['roles'] ?? [],
            'auth_type' => $authUser['auth_type'] ?? 'frontpage',
            'is_guest' => (bool) ($authUser['is_guest'] ?? false),
        ];
    }
}
