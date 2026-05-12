<?php

declare(strict_types=1);

use AdventurerGuild\Actions\AuthActions;
use AdventurerGuild\Support\Jwt;
use PHPUnit\Framework\TestCase;

final class AuthActionsTest extends TestCase
{
    public function testGuestSessionCreatesSignedGuestJwt(): void
    {
        $_ENV['JWT_SECRET'] = 'test-secret';

        $result = (new AuthActions())->createGuestSession();
        $decoded = Jwt::decode($result['token'], 'test-secret');

        self::assertTrue($decoded['is_guest']);
        self::assertSame('guest', $decoded['role']);
        self::assertContains('guest', $decoded['roles']);
        self::assertStringStartsWith('guest_', (string) $decoded['sub']);
        self::assertSame($decoded['sub'], $result['user']['id']);
    }

    public function testLinkGuestRejectsCallerSuppliedGuestIdWithoutToken(): void
    {
        $_ENV['JWT_SECRET'] = 'test-secret';

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('guest_token is required');

        (new AuthActions())->linkGuest(['id' => 'real-user', 'is_guest' => false], ['guest_user_id' => 'guest_abc']);
    }

    public function testRepositoryContainsRealGuestMoveContract(): void
    {
        $source = file_get_contents(__DIR__ . '/../src/Repositories/UserRepository.php');
        self::assertIsString($source);

        self::assertStringContainsString('moveGuestProgressToUser', $source);
        self::assertStringContainsString('No guest progress found for this token', $source);
        self::assertStringContainsString('DELETE FROM users WHERE id = :id', $source);
        self::assertStringContainsString('total_moved_rows', $source);
        self::assertDoesNotMatchRegularExpression('/guest_user_id.+total_moved_rows.+0/s', $source);
    }
}
