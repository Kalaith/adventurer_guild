<?php

declare(strict_types=1);

namespace AdventurerGuild\Repositories;

use PDO;

final class UserRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function findOrCreate(array $authUser): array
    {
        $authUserId = (string) ($authUser['id'] ?? '');
        if ($authUserId === '') {
            throw new \InvalidArgumentException('Missing auth user id');
        }

        $existing = $this->findByAuthUserId($authUserId);
        if ($existing) {
            $this->db->prepare(
                'UPDATE users SET email = :email, username = :username, display_name = :display_name, role = :role, auth_type = :auth_type, is_guest = :is_guest, last_seen_at = CURRENT_TIMESTAMP WHERE id = :id'
            )->execute([
                'email' => (string) ($authUser['email'] ?? ''),
                'username' => (string) ($authUser['username'] ?? ''),
                'display_name' => (string) ($authUser['display_name'] ?? $authUser['username'] ?? ''),
                'role' => (string) ($authUser['role'] ?? 'user'),
                'auth_type' => (string) ($authUser['auth_type'] ?? 'frontpage'),
                'is_guest' => !empty($authUser['is_guest']) ? 1 : 0,
                'id' => (int) $existing['id'],
            ]);
            return $this->findByAuthUserId($authUserId) ?? $existing;
        }

        $this->db->prepare(
            'INSERT INTO users (auth_user_id, email, username, display_name, role, auth_type, is_guest, last_seen_at) VALUES (:auth_user_id, :email, :username, :display_name, :role, :auth_type, :is_guest, CURRENT_TIMESTAMP)'
        )->execute([
            'auth_user_id' => $authUserId,
            'email' => (string) ($authUser['email'] ?? ''),
            'username' => (string) ($authUser['username'] ?? ''),
            'display_name' => (string) ($authUser['display_name'] ?? $authUser['username'] ?? ''),
            'role' => (string) ($authUser['role'] ?? 'user'),
            'auth_type' => (string) ($authUser['auth_type'] ?? 'frontpage'),
            'is_guest' => !empty($authUser['is_guest']) ? 1 : 0,
        ]);

        return $this->findByAuthUserId($authUserId) ?? throw new \RuntimeException('Failed to create user');
    }

    private function findByAuthUserId(string $authUserId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE auth_user_id = :auth_user_id LIMIT 1');
        $stmt->execute(['auth_user_id' => $authUserId]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }
}
