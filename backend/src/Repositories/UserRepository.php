<?php

declare(strict_types=1);

namespace AdventurerGuild\Repositories;

use PDO;

final class UserRepository
{
    private const USER_DATA_TABLES = [
        'ag_adventurer_equipment_slots',
        'ag_equipment_inventory',
        'ag_retired_adventurers',
        'ag_save_slots',
        'ag_activity_log',
        'ag_runs',
        'ag_active_quests',
        'ag_completed_quests',
        'ag_campaign_progress',
        'ag_world_event_progress',
        'ag_faction_reputations',
        'ag_facilities',
        'ag_territories',
        'ag_votes',
        'ag_material_inventory',
        'ag_recipe_unlocks',
        'ag_adventurers',
        'ag_recruits',
        'ag_guild_profiles',
    ];

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

    public function findByAuthUserId(string $authUserId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE auth_user_id = :auth_user_id LIMIT 1');
        $stmt->execute(['auth_user_id' => $authUserId]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    /**
     * Replace the target user's current guild data with the guest user's progress.
     *
     * @return array{deleted_rows_by_table: array<string, int>, moved_rows_by_table: array<string, int>, total_deleted_rows: int, total_moved_rows: int}
     */
    public function moveGuestProgressToUser(string $guestAuthUserId, int $targetUserId): array
    {
        $guest = $this->findByAuthUserId($guestAuthUserId);
        if (!$guest) {
            throw new \RuntimeException('No guest progress found for this token');
        }

        $guestUserId = (int) $guest['id'];
        if ($guestUserId === $targetUserId) {
            throw new \RuntimeException('Guest progress is already linked to this user');
        }

        return $this->transaction(function () use ($guestUserId, $targetUserId): array {
            $deleted = [];
            foreach (self::USER_DATA_TABLES as $table) {
                $statement = $this->db->prepare(sprintf('DELETE FROM `%s` WHERE user_id = :user_id', $table));
                $statement->execute(['user_id' => $targetUserId]);
                $deleted[$table] = $statement->rowCount();
            }

            $moved = [];
            foreach (array_reverse(self::USER_DATA_TABLES) as $table) {
                $statement = $this->db->prepare(sprintf('UPDATE `%s` SET user_id = :target_user_id WHERE user_id = :guest_user_id', $table));
                $statement->execute([
                    'target_user_id' => $targetUserId,
                    'guest_user_id' => $guestUserId,
                ]);
                $moved[$table] = $statement->rowCount();
            }

            $deleteGuest = $this->db->prepare('DELETE FROM users WHERE id = :id');
            $deleteGuest->execute(['id' => $guestUserId]);
            $moved['users'] = $deleteGuest->rowCount();

            $totalMoved = array_sum($moved);
            if ($totalMoved === 0) {
                throw new \RuntimeException('No guest progress was moved');
            }

            return [
                'deleted_rows_by_table' => $deleted,
                'moved_rows_by_table' => $moved,
                'total_deleted_rows' => array_sum($deleted),
                'total_moved_rows' => $totalMoved,
            ];
        });
    }

    private function transaction(callable $callback): mixed
    {
        $this->db->beginTransaction();
        try {
            $result = $callback();
            $this->db->commit();
            return $result;
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $exception;
        }
    }
}
