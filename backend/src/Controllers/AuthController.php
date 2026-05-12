<?php

declare(strict_types=1);

namespace AdventurerGuild\Controllers;

use AdventurerGuild\Actions\AuthActions;
use AdventurerGuild\Core\Database;
use AdventurerGuild\Core\Environment;
use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Repositories\UserRepository;
use Throwable;

final class AuthController
{
    public function loginInfo(Request $request, Response $response): Response
    {
        return $this->handle(
            $response,
            fn(): array => (new AuthActions())->loginInfo()
        );
    }

    public function session(Request $request, Response $response): Response
    {
        return $this->handle(
            $response,
            fn(): array => (new AuthActions())->session($this->authUser($request))
        );
    }

    public function guestSession(Request $request, Response $response): Response
    {
        return $this->handle(
            $response,
            fn(): array => (new AuthActions())->createGuestSession()
        );
    }

    public function linkGuest(Request $request, Response $response): Response
    {
        return $this->handle(
            $response,
            fn(): array => $this->actions()->linkGuest($this->authUser($request), $request->getParsedBody())
        );
    }

    private function actions(): AuthActions
    {
        return new AuthActions(new UserRepository(Database::connect()));
    }

    private function handle(Response $response, callable $callback): Response
    {
        try {
            return $this->json($response, ['success' => true, 'data' => $callback()]);
        } catch (Throwable $exception) {
            return $this->json($response->withStatus($this->statusFor($exception)), $this->errorPayload($exception));
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function authUser(Request $request): array
    {
        $authUser = $request->getAttribute('auth_user', []);

        return is_array($authUser) ? $authUser : [];
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function json(Response $response, array $payload): Response
    {
        $response->getBody()->write((string) json_encode($payload, JSON_THROW_ON_ERROR));

        return $response->withHeader('Content-Type', 'application/json');
    }

    private function statusFor(Throwable $exception): int
    {
        if ($exception->getMessage() === 'Authentication required') {
            return 401;
        }

        if ($exception instanceof \DomainException) {
            return 403;
        }

        if ($exception instanceof \InvalidArgumentException || $exception instanceof \RuntimeException) {
            return 422;
        }

        return 500;
    }

    /**
     * @return array<string, mixed>
     */
    private function errorPayload(Throwable $exception): array
    {
        if ($exception->getMessage() === 'Authentication required') {
            return [
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Unauthorized',
                'login_url' => Environment::required('WEB_HATCHERY_LOGIN_URL'),
            ];
        }

        return [
            'success' => false,
            'error' => $exception->getMessage(),
            'message' => $exception->getMessage(),
        ];
    }
}
