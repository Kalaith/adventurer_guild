<?php

declare(strict_types=1);

namespace AdventurerGuild\Middleware;

use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Support\Jwt;
use Throwable;

final class WebHatcheryJwtMiddleware
{
    public function __invoke(Request $request, Response $response): Request|Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        $token = '';

        if ($authHeader !== '' && preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token = trim((string) $matches[1]);
        } else {
            $queryParams = $request->getQueryParams();
            if (isset($queryParams['token']) && is_string($queryParams['token'])) {
                $token = trim($queryParams['token']);
            }
        }

        $secret = (string) ($_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: '');
        if ($token === '' || $secret === '') {
            return $this->unauthorized($response, 'Authentication required');
        }

        try {
            $decoded = Jwt::decode($token, $secret);
            $userId = (string) ($decoded['sub'] ?? $decoded['user_id'] ?? '');
            if ($userId === '') {
                return $this->unauthorized($response, 'Token missing user identifier');
            }

            $roles = $decoded['roles'] ?? (($decoded['role'] ?? null) ? [$decoded['role']] : ['user']);
            if (!is_array($roles)) {
                $roles = [(string) $roles];
            }

            return $request->withAttribute('auth_user', [
                'id' => $userId,
                'email' => $decoded['email'] ?? null,
                'username' => $decoded['username'] ?? null,
                'display_name' => $decoded['display_name'] ?? ($decoded['username'] ?? null),
                'role' => (string) ($roles[0] ?? 'user'),
                'roles' => $roles,
                'auth_type' => (string) ($decoded['auth_type'] ?? ((bool) ($decoded['is_guest'] ?? false) ? 'guest' : 'frontpage')),
                'is_guest' => (bool) ($decoded['is_guest'] ?? false),
            ]);
        } catch (Throwable $exception) {
            error_log('AdventurerGuild JWT decode failed: ' . $exception->getMessage());
            return $this->unauthorized($response, 'Invalid token');
        }
    }

    private function unauthorized(Response $response, string $message): Response
    {
        $response->getBody()->write((string) json_encode([
            'success' => false,
            'error' => 'Authentication required',
            'message' => $message,
            'login_url' => $_ENV['LOGIN_URL'] ?? '',
        ]));

        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}
