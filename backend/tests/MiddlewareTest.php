<?php

declare(strict_types=1);

use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Middleware\WebHatcheryJwtMiddleware;
use PHPUnit\Framework\TestCase;

final class MiddlewareTest extends TestCase
{
    public function testMissingBearerTokenReturnsLoginUrl(): void
    {
        $_ENV['WEB_HATCHERY_LOGIN_URL'] = 'http://127.0.0.1/login';

        $response = (new WebHatcheryJwtMiddleware())(
            new Request([], [], [], [], 'GET', '/api/guild/summary'),
            new Response()
        );

        self::assertInstanceOf(Response::class, $response);
        self::assertSame(401, $response->getStatusCode());

        $payload = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('Authentication required', $payload['error']);
        self::assertSame('http://127.0.0.1/login', $payload['login_url']);
    }
}
