<?php

declare(strict_types=1);

namespace AdventurerGuild\Controllers;

use AdventurerGuild\Core\Database;
use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;
use AdventurerGuild\Repositories\GuildRepository;
use AdventurerGuild\Repositories\UserRepository;
use AdventurerGuild\Services\GuildService;

final class GuildController
{
    private GuildService $service;

    public function __construct()
    {
        $db = Database::connect();
        $this->service = new GuildService(new UserRepository($db), new GuildRepository($db));
    }

    public function summary(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->getSummary($authUser), $request->getAttribute('auth_user'));
    }

    public function roster(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->getRoster($authUser), $request->getAttribute('auth_user'));
    }

    public function activity(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->getActivity($authUser), $request->getAttribute('auth_user'));
    }

    public function worldState(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->getWorldState($authUser), $request->getAttribute('auth_user'));
    }

    public function upgradeFacility(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->upgradeFacility($authUser, (string) ($body['facility_id'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function craftRecipe(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->craftRecipe($authUser, (string) ($body['recipe_id'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function equipInventoryItem(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->equipInventoryItem($authUser, (string) ($body['adventurer_id'] ?? ''), (string) ($body['item_id'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function unequipInventoryItem(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->unequipInventoryItem($authUser, (string) ($body['adventurer_id'] ?? ''), (string) ($body['slot_type'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function retireAdventurer(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->retireAdventurer($authUser, (string) ($body['adventurer_id'] ?? ''), isset($body['role']) ? (string) $body['role'] : null), $request->getAttribute('auth_user'));
    }

    public function refreshRecruits(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->refreshRecruits($authUser), $request->getAttribute('auth_user'));
    }

    public function hireRecruit(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->hireRecruit($authUser, (string) ($body['recruit_id'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function questBoard(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->getQuestBoard($authUser), $request->getAttribute('auth_user'));
    }

    public function assignQuest(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->assignQuest($authUser, (string) ($body['quest_id'] ?? ''), is_array($body['adventurer_ids'] ?? null) ? $body['adventurer_ids'] : []), $request->getAttribute('auth_user'));
    }

    public function resolveQuest(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        return $this->handle($response, fn(array $authUser): array => $this->service->resolveQuest($authUser, (string) ($body['quest_id'] ?? '')), $request->getAttribute('auth_user'));
    }

    public function saveSlot(Request $request, Response $response, array $routeParams): Response
    {
        $body = $request->getParsedBody();
        $slotNumber = isset($routeParams['slotNumber']) ? (int) $routeParams['slotNumber'] : 0;
        return $this->handle($response, fn(array $authUser): array => $this->service->saveSlot($authUser, $slotNumber, isset($body['slot_name']) ? (string) $body['slot_name'] : null), $request->getAttribute('auth_user'));
    }

    public function loadSlot(Request $request, Response $response, array $routeParams): Response
    {
        $slotNumber = isset($routeParams['slotNumber']) ? (int) $routeParams['slotNumber'] : 0;
        return $this->handle($response, fn(array $authUser): array => $this->service->loadSlot($authUser, $slotNumber), $request->getAttribute('auth_user'));
    }

    public function listSaveSlots(Request $request, Response $response): Response
    {
        return $this->handle($response, fn(array $authUser): array => $this->service->listSaveSlots($authUser), $request->getAttribute('auth_user'));
    }

    private function handle(Response $response, callable $callback, mixed $authUser): Response
    {
        try {
            if (!is_array($authUser) || empty($authUser['id'])) {
                throw new \RuntimeException('Authentication required');
            }
            $response->getBody()->write((string) json_encode(['success' => true, 'data' => $callback($authUser)]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Throwable $exception) {
            $message = $exception->getMessage();
            $status = str_contains($message, 'required')
                || str_contains($message, 'not found')
                || str_contains($message, 'Not enough')
                || str_contains($message, 'Maximum')
                || str_contains($message, 'already')
                || str_contains($message, 'progress')
                || str_contains($message, 'eligible')
                ? 422
                : 500;
            $response->getBody()->write((string) json_encode(['success' => false, 'error' => $exception->getMessage()]));
            return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
        }
    }
}
