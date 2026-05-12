<?php

declare(strict_types=1);

namespace AdventurerGuild\Controllers;

use AdventurerGuild\Actions\GuildActions;
use AdventurerGuild\Core\Database;
use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Repositories\GuildRepository;
use AdventurerGuild\Repositories\UserRepository;
use AdventurerGuild\Services\GuildService;
use Throwable;

final class GuildController
{
    private GuildActions $actions;

    public function __construct()
    {
        $db = Database::connect();
        $service = new GuildService(new UserRepository($db), new GuildRepository($db));
        $this->actions = new GuildActions($service);
    }

    public function summary(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->getSummary($authUser), $this->authUser($request));
    }

    public function roster(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->getRoster($authUser), $this->authUser($request));
    }

    public function activity(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->getActivity($authUser), $this->authUser($request));
    }

    public function worldState(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->getWorldState($authUser), $this->authUser($request));
    }

    public function upgradeFacility(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->upgradeFacility($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function craftRecipe(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->craftRecipe($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function equipInventoryItem(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->equipInventoryItem($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function unequipInventoryItem(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->unequipInventoryItem($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function retireAdventurer(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->retireAdventurer($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function refreshRecruits(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->refreshRecruits($authUser), $this->authUser($request));
    }

    public function hireRecruit(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->hireRecruit($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function questBoard(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->getQuestBoard($authUser), $this->authUser($request));
    }

    public function assignQuest(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->assignQuest($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function resolveQuest(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->resolveQuest($authUser, $request->getParsedBody()), $this->authUser($request));
    }

    public function saveSlot(Request $request, Response $response, array $routeParams): Response
    {
        $slotNumber = isset($routeParams['slotNumber']) ? (int) $routeParams['slotNumber'] : 0;
        return $this->handle($response, fn(array $authUser): array => $this->actions->saveSlot($authUser, $slotNumber, $request->getParsedBody()), $this->authUser($request));
    }

    public function loadSlot(Request $request, Response $response, array $routeParams): Response
    {
        $slotNumber = isset($routeParams['slotNumber']) ? (int) $routeParams['slotNumber'] : 0;
        return $this->handle($response, fn(array $authUser): array => $this->actions->loadSlot($authUser, $slotNumber), $this->authUser($request));
    }

    public function listSaveSlots(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->actions->listSaveSlots($authUser), $this->authUser($request));
    }

    private function handle(Response $response, callable $callback, array $authUser): Response
    {
        try {
            $response->getBody()->write((string) json_encode(['success' => true, 'data' => $callback($authUser)], JSON_THROW_ON_ERROR));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Throwable $exception) {
            $response->getBody()->write((string) json_encode([
                'success' => false,
                'error' => $exception->getMessage(),
                'message' => $exception->getMessage(),
            ], JSON_THROW_ON_ERROR));

            return $response->withStatus($this->statusFor($exception))->withHeader('Content-Type', 'application/json');
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
}
