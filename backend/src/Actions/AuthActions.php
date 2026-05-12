<?php

declare(strict_types=1);

namespace AdventurerGuild\Actions;

use AdventurerGuild\Core\Environment;
use AdventurerGuild\Repositories\UserRepository;
use AdventurerGuild\Support\Jwt;

final class AuthActions
{
    public function __construct(private readonly ?UserRepository $userRepository = null)
    {
    }

    /**
     * @return array{login_url: string}
     */
    public function loginInfo(): array
    {
        return ['login_url' => Environment::required('WEB_HATCHERY_LOGIN_URL')];
    }

    /**
     * @return array{user: array<string, mixed>}
     */
    public function session(array $authUser): array
    {
        if (empty($authUser['id'])) {
            throw new \RuntimeException('Authentication required');
        }

        return ['user' => $this->serializeUser($authUser)];
    }

    /**
     * @return array{token: string, user: array<string, mixed>}
     */
    public function createGuestSession(): array
    {
        $issuedAt = time();
        $guestUserId = 'guest_' . bin2hex(random_bytes(16));
        $guestName = 'Guest ' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $guestUser = [
            'id' => $guestUserId,
            'username' => $guestName,
            'display_name' => $guestName,
            'role' => 'guest',
            'roles' => ['guest'],
            'auth_type' => 'guest',
            'is_guest' => true,
        ];

        return [
            'token' => Jwt::encode([
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
            ], Environment::required('JWT_SECRET')),
            'user' => $this->serializeUser($guestUser),
        ];
    }

    /**
     * @param array<string, mixed> $authUser
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function linkGuest(array $authUser, array $body): array
    {
        if (empty($authUser['id'])) {
            throw new \RuntimeException('Authentication required');
        }

        if (!empty($authUser['is_guest'])) {
            throw new \DomainException('Guest accounts cannot link guest progress');
        }

        $guestToken = isset($body['guest_token']) ? trim((string) $body['guest_token']) : '';
        if ($guestToken === '') {
            throw new \InvalidArgumentException('guest_token is required');
        }

        $decoded = Jwt::decode($guestToken, Environment::required('JWT_SECRET'));
        if (empty($decoded['is_guest'])) {
            throw new \InvalidArgumentException('guest_token must belong to a guest session');
        }

        $guestUserId = (string) ($decoded['sub'] ?? $decoded['user_id'] ?? '');
        if ($guestUserId === '' || !str_starts_with($guestUserId, 'guest_')) {
            throw new \InvalidArgumentException('Invalid guest token user identifier');
        }

        if ($this->userRepository === null) {
            throw new \RuntimeException('User repository is required for guest linking');
        }

        $targetUser = $this->userRepository->findOrCreate($authUser);
        $moveResult = $this->userRepository->moveGuestProgressToUser($guestUserId, (int) $targetUser['id']);

        return [
            'linked' => true,
            'guest_user_id' => $guestUserId,
            'linked_to_user_id' => (string) $authUser['id'],
            ...$moveResult,
        ];
    }

    /**
     * @param array<string, mixed> $authUser
     * @return array<string, mixed>
     */
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
