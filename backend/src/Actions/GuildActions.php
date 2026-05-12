<?php

declare(strict_types=1);

namespace AdventurerGuild\Actions;

use AdventurerGuild\Services\GuildService;

final class GuildActions
{
    public function __construct(private readonly GuildService $guildService)
    {
    }

    public function getSummary(array $authUser): array
    {
        return $this->guildService->getSummary($this->requireAuthUser($authUser));
    }

    public function getRoster(array $authUser): array
    {
        return $this->guildService->getRoster($this->requireAuthUser($authUser));
    }

    public function getActivity(array $authUser): array
    {
        return $this->guildService->getActivity($this->requireAuthUser($authUser));
    }

    public function getWorldState(array $authUser): array
    {
        return $this->guildService->getWorldState($this->requireAuthUser($authUser));
    }

    public function upgradeFacility(array $authUser, array $body): array
    {
        return $this->guildService->upgradeFacility($this->requireAuthUser($authUser), $this->requiredString($body, 'facility_id'));
    }

    public function craftRecipe(array $authUser, array $body): array
    {
        return $this->guildService->craftRecipe($this->requireAuthUser($authUser), $this->requiredString($body, 'recipe_id'));
    }

    public function equipInventoryItem(array $authUser, array $body): array
    {
        return $this->guildService->equipInventoryItem(
            $this->requireAuthUser($authUser),
            $this->requiredString($body, 'adventurer_id'),
            $this->requiredString($body, 'item_id')
        );
    }

    public function unequipInventoryItem(array $authUser, array $body): array
    {
        return $this->guildService->unequipInventoryItem(
            $this->requireAuthUser($authUser),
            $this->requiredString($body, 'adventurer_id'),
            $this->requiredString($body, 'slot_type')
        );
    }

    public function retireAdventurer(array $authUser, array $body): array
    {
        return $this->guildService->retireAdventurer(
            $this->requireAuthUser($authUser),
            $this->requiredString($body, 'adventurer_id'),
            isset($body['role']) ? (string) $body['role'] : null
        );
    }

    public function refreshRecruits(array $authUser): array
    {
        return $this->guildService->refreshRecruits($this->requireAuthUser($authUser));
    }

    public function hireRecruit(array $authUser, array $body): array
    {
        return $this->guildService->hireRecruit($this->requireAuthUser($authUser), $this->requiredString($body, 'recruit_id'));
    }

    public function getQuestBoard(array $authUser): array
    {
        return $this->guildService->getQuestBoard($this->requireAuthUser($authUser));
    }

    public function assignQuest(array $authUser, array $body): array
    {
        $adventurerIds = $body['adventurer_ids'] ?? [];
        if (!is_array($adventurerIds)) {
            throw new \InvalidArgumentException('adventurer_ids must be an array');
        }

        return $this->guildService->assignQuest(
            $this->requireAuthUser($authUser),
            $this->requiredString($body, 'quest_id'),
            $adventurerIds
        );
    }

    public function resolveQuest(array $authUser, array $body): array
    {
        return $this->guildService->resolveQuest($this->requireAuthUser($authUser), $this->requiredString($body, 'quest_id'));
    }

    public function saveSlot(array $authUser, int $slotNumber, array $body): array
    {
        return $this->guildService->saveSlot(
            $this->requireAuthUser($authUser),
            $slotNumber,
            isset($body['slot_name']) ? (string) $body['slot_name'] : null
        );
    }

    public function loadSlot(array $authUser, int $slotNumber): array
    {
        return $this->guildService->loadSlot($this->requireAuthUser($authUser), $slotNumber);
    }

    public function listSaveSlots(array $authUser): array
    {
        return $this->guildService->listSaveSlots($this->requireAuthUser($authUser));
    }

    /**
     * @param array<string, mixed> $authUser
     * @return array<string, mixed>
     */
    private function requireAuthUser(array $authUser): array
    {
        if (empty($authUser['id'])) {
            throw new \RuntimeException('Authentication required');
        }

        return $authUser;
    }

    /**
     * @param array<string, mixed> $body
     */
    private function requiredString(array $body, string $key): string
    {
        $value = isset($body[$key]) ? trim((string) $body[$key]) : '';
        if ($value === '') {
            throw new \InvalidArgumentException($key . ' is required');
        }

        return $value;
    }
}
