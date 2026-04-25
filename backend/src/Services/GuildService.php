<?php

declare(strict_types=1);

namespace AdventurerGuild\Services;

use AdventurerGuild\Repositories\GuildRepository;
use AdventurerGuild\Repositories\UserRepository;

final class GuildService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly GuildRepository $guildRepository
    ) {
    }

    public function getSummary(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->getSummary((int) $user['id']);
    }

    public function getRoster(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->getRoster((int) $user['id']);
    }

    public function getActivity(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->getActivity((int) $user['id']);
    }

    public function getWorldState(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->getWorldState((int) $user['id']);
    }

    public function upgradeFacility(array $authUser, string $facilityId): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->upgradeFacility((int) $user['id'], $facilityId);
    }

    public function craftRecipe(array $authUser, string $recipeId): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->craftRecipe((int) $user['id'], $recipeId);
    }

    public function equipInventoryItem(array $authUser, string $adventurerId, string $itemId): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->equipInventoryItem((int) $user['id'], $adventurerId, $itemId);
    }

    public function unequipInventoryItem(array $authUser, string $adventurerId, string $slotType): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->unequipInventoryItem((int) $user['id'], $adventurerId, $slotType);
    }

    public function retireAdventurer(array $authUser, string $adventurerId, ?string $role): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->retireAdventurer((int) $user['id'], $adventurerId, $role);
    }

    public function refreshRecruits(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->refreshRecruits((int) $user['id']);
    }

    public function hireRecruit(array $authUser, string $recruitId): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->hireRecruit((int) $user['id'], $recruitId);
    }

    public function getQuestBoard(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->getQuestBoard((int) $user['id']);
    }

    public function assignQuest(array $authUser, string $questId, array $adventurerIds): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->assignQuest((int) $user['id'], $questId, $adventurerIds);
    }

    public function resolveQuest(array $authUser, string $questId): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->resolveQuest((int) $user['id'], $questId);
    }

    public function saveSlot(array $authUser, int $slotNumber, ?string $slotName): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->saveSlot((int) $user['id'], $slotNumber, $slotName);
    }

    public function loadSlot(array $authUser, int $slotNumber): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->loadSlot((int) $user['id'], $slotNumber);
    }

    public function listSaveSlots(array $authUser): array
    {
        $user = $this->bootstrapUser($authUser);
        return $this->guildRepository->listSaveSlots((int) $user['id']);
    }

    private function bootstrapUser(array $authUser): array
    {
        $user = $this->userRepository->findOrCreate($authUser);
        $this->guildRepository->ensureBootstrap((int) $user['id']);
        return $user;
    }
}
