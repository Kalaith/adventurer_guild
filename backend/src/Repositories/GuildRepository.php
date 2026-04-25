<?php

declare(strict_types=1);

namespace AdventurerGuild\Repositories;

use PDO;

final class GuildRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function ensureBootstrap(int $userId): void
    {
        $this->db->beginTransaction();
        try {
            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_guild_profiles WHERE user_id = :user_id', ['user_id' => $userId])) {
                $this->db->prepare('INSERT INTO ag_guild_profiles (user_id, guild_name, gold, reputation, guild_level, current_season, generation, legacy_bonuses_json, last_save_at) VALUES (:user_id, :guild_name, 1000, 0, 1, :current_season, 1, :legacy_bonuses_json, NOW())')->execute([
                    'user_id' => $userId,
                    'guild_name' => 'Adventurer Guild',
                    'current_season' => $this->getCurrentSeason(),
                    'legacy_bonuses_json' => json_encode(['experienceMultiplier' => 1, 'goldMultiplier' => 1, 'reputationMultiplier' => 1], JSON_UNESCAPED_SLASHES),
                ]);
                $this->appendActivity($userId, 'guild_created', 'Guild established', 'A new Adventurer Guild record was created and is ready for its first contracts.');
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_adventurers WHERE user_id = :user_id', ['user_id' => $userId])) {
                $templates = $this->fetchAll('SELECT * FROM ag_starter_adventurer_templates ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_adventurers (user_id, external_id, name, class, rank_name, level, experience, status, strength, intelligence, dexterity, vitality, personality_json, skills_json, relationships_json, quests_completed, years_in_guild, retirement_eligible, raw_payload_json) VALUES (:user_id, :external_id, :name, :class, :rank_name, :level, :experience, :status, :strength, :intelligence, :dexterity, :vitality, :personality_json, :skills_json, :relationships_json, :quests_completed, :years_in_guild, :retirement_eligible, NULL)');
                foreach ($templates as $template) {
                    $insert->execute([
                        'user_id' => $userId,
                        'external_id' => $template['id'],
                        'name' => $template['name'],
                        'class' => $template['class'],
                        'rank_name' => $template['rank_name'],
                        'level' => (int) $template['level'],
                        'experience' => (int) $template['experience'],
                        'status' => $template['status'],
                        'strength' => (int) $template['strength'],
                        'intelligence' => (int) $template['intelligence'],
                        'dexterity' => (int) $template['dexterity'],
                        'vitality' => (int) $template['vitality'],
                        'personality_json' => $template['personality_json'],
                        'skills_json' => $template['skills_json'],
                        'relationships_json' => $template['relationships_json'],
                        'quests_completed' => (int) $template['quests_completed'],
                        'years_in_guild' => (int) $template['years_in_guild'],
                        'retirement_eligible' => (int) $template['retirement_eligible'],
                    ]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_campaign_progress WHERE user_id = :user_id', ['user_id' => $userId])) {
                $campaigns = $this->fetchAll('SELECT id FROM ag_campaign_definitions ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_campaign_progress (user_id, campaign_id, current_quest_index, completed) VALUES (:user_id, :campaign_id, 0, 0)');
                foreach ($campaigns as $campaign) {
                    $insert->execute(['user_id' => $userId, 'campaign_id' => $campaign['id']]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_faction_reputations WHERE user_id = :user_id', ['user_id' => $userId])) {
                $factions = $this->fetchAll('SELECT id, base_reputation FROM ag_faction_definitions ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_faction_reputations (user_id, faction_id, reputation, standing_label) VALUES (:user_id, :faction_id, :reputation, :standing_label)');
                foreach ($factions as $faction) {
                    $standing = $this->getFactionStanding((int) $faction['base_reputation']);
                    $insert->execute(['user_id' => $userId, 'faction_id' => $faction['id'], 'reputation' => (int) $faction['base_reputation'], 'standing_label' => $standing]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_world_event_progress WHERE user_id = :user_id', ['user_id' => $userId])) {
                $events = $this->fetchAll('SELECT id, active_default, duration_days FROM ag_world_event_definitions ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_world_event_progress (user_id, event_id, active, started_at, ends_at) VALUES (:user_id, :event_id, :active, :started_at, :ends_at)');
                foreach ($events as $event) {
                    $active = (int) $event['active_default'] === 1;
                    $startedAt = $active ? date('Y-m-d H:i:s') : null;
                    $endsAt = $active ? date('Y-m-d H:i:s', time() + ((int) $event['duration_days'] * 86400)) : null;
                    $insert->execute([
                        'user_id' => $userId,
                        'event_id' => $event['id'],
                        'active' => $active ? 1 : 0,
                        'started_at' => $startedAt,
                        'ends_at' => $endsAt,
                    ]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_facilities WHERE user_id = :user_id', ['user_id' => $userId])) {
                $insert = $this->db->prepare('INSERT INTO ag_facilities (user_id, facility_id, name, level, max_level, cost, description) VALUES (:user_id, :facility_id, :name, :level, :max_level, :cost, :description)');
                foreach ($this->fetchAll('SELECT id, name, description, base_cost, max_level FROM ag_facility_definitions ORDER BY sort_order ASC') as $facility) {
                    $benefits = $this->calculateFacilityBenefits((string) $facility['id'], 1);
                    $insert->execute([
                        'user_id' => $userId,
                        'facility_id' => $facility['id'],
                        'name' => $facility['name'],
                        'level' => 1,
                        'max_level' => (int) $facility['max_level'],
                        'cost' => $this->calculateFacilityUpgradeCost((string) $facility['id'], 1),
                        'description' => $facility['description'],
                    ]);
                    $facilityRowId = (int) $this->db->lastInsertId();
                    $this->replaceFacilityBenefits($facilityRowId, $benefits);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_territories WHERE user_id = :user_id', ['user_id' => $userId])) {
                $insert = $this->db->prepare('INSERT INTO ag_territories (user_id, territory_id, controlled, influence_level, cost) VALUES (:user_id, :territory_id, :controlled, :influence_level, :cost)');
                foreach ($this->fetchAll('SELECT id, base_cost FROM ag_territory_definitions ORDER BY sort_order ASC') as $territory) {
                    $insert->execute([
                        'user_id' => $userId,
                        'territory_id' => $territory['id'],
                        'controlled' => 0,
                        'influence_level' => 0,
                        'cost' => (int) $territory['base_cost'],
                    ]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_material_inventory WHERE user_id = :user_id', ['user_id' => $userId])) {
                $materials = $this->fetchAll('SELECT id FROM ag_crafting_material_definitions ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_material_inventory (user_id, material_id, quantity) VALUES (:user_id, :material_id, 0)');
                foreach ($materials as $material) {
                    $insert->execute([
                        'user_id' => $userId,
                        'material_id' => $material['id'],
                    ]);
                }
            }

            if (!(int) $this->fetchScalar('SELECT COUNT(*) FROM ag_recipe_unlocks WHERE user_id = :user_id', ['user_id' => $userId])) {
                $recipes = $this->fetchAll('SELECT id FROM ag_crafting_recipe_definitions WHERE required_facility_level <= 1 ORDER BY sort_order ASC');
                $insert = $this->db->prepare('INSERT INTO ag_recipe_unlocks (user_id, recipe_id) VALUES (:user_id, :recipe_id)');
                foreach ($recipes as $recipe) {
                    $insert->execute([
                        'user_id' => $userId,
                        'recipe_id' => $recipe['id'],
                    ]);
                }
            }

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }
    }

    public function getSummary(int $userId): array
    {
        $profile = $this->fetchOne('SELECT * FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1', ['user_id' => $userId]) ?? [];
        return [
            'gold' => (int) ($profile['gold'] ?? 0),
            'reputation' => (int) ($profile['reputation'] ?? 0),
            'level' => (int) ($profile['guild_level'] ?? 1),
            'currentSeason' => (string) ($profile['current_season'] ?? 'spring'),
            'generation' => (int) ($profile['generation'] ?? 1),
            'legacyBonuses' => $this->decodeJson($profile['legacy_bonuses_json'] ?? '{}', []),
            'lastSave' => isset($profile['last_save_at']) && $profile['last_save_at'] ? strtotime((string) $profile['last_save_at']) * 1000 : null,
            'activeQuestCount' => (int) $this->fetchScalar('SELECT COUNT(*) FROM ag_active_quests WHERE user_id = :user_id', ['user_id' => $userId]),
            'completedQuestCount' => (int) $this->fetchScalar('SELECT COUNT(*) FROM ag_completed_quests WHERE user_id = :user_id', ['user_id' => $userId]),
        ];
    }

    public function getRoster(int $userId): array
    {
        $adventurerRows = $this->fetchAll('SELECT * FROM ag_adventurers WHERE user_id = :user_id AND is_retired = 0 ORDER BY created_at ASC, id ASC', ['user_id' => $userId]);
        $equipmentByAdventurer = $this->fetchEquippedItemsByAdventurerIds($userId, array_map(fn(array $row): string => (string) $row['external_id'], $adventurerRows));

        return [
            'adventurers' => array_map(fn(array $row): array => $this->mapAdventurer($row, $equipmentByAdventurer[(string) $row['external_id']] ?? []), $adventurerRows),
            'recruits' => array_map(fn(array $row): array => $this->mapRecruit($row), $this->fetchAll('SELECT * FROM ag_recruits WHERE user_id = :user_id ORDER BY created_at ASC, id ASC', ['user_id' => $userId])),
        ];
    }

    public function getActivity(int $userId): array
    {
        return array_map(
            fn(array $row): array => [
                'id' => (int) $row['id'],
                'eventType' => (string) $row['event_type'],
                'title' => (string) $row['title'],
                'description' => (string) $row['description'],
                'metadata' => $this->decodeJson($row['metadata_json'], []),
                'createdAt' => $row['created_at'] ? strtotime((string) $row['created_at']) * 1000 : null,
            ],
            $this->fetchAll('SELECT id, event_type, title, description, metadata_json, created_at FROM ag_activity_log WHERE user_id = :user_id ORDER BY created_at DESC, id DESC LIMIT 25', ['user_id' => $userId])
        );
    }

    public function getWorldState(int $userId): array
    {
        $factions = $this->fetchAll(
            'SELECT fd.id, fd.name, fd.description, fd.reward_multiplier, fr.reputation, fr.standing_label
             FROM ag_faction_definitions fd
             INNER JOIN ag_faction_reputations fr ON fr.faction_id = fd.id
             WHERE fr.user_id = :user_id
             ORDER BY fd.sort_order ASC',
            ['user_id' => $userId]
        );

        $facilities = $this->fetchAll(
            'SELECT id, facility_id, name, level, max_level, cost, description
             FROM ag_facilities
             WHERE user_id = :user_id
             ORDER BY id ASC',
            ['user_id' => $userId]
        );

        $worldEvents = $this->fetchAll(
            'SELECT wd.id, wd.name, wd.description, wd.duration_days, wd.quest_reward_multiplier, wd.adventurer_morale_bonus, wp.active, wp.started_at, wp.ends_at
             FROM ag_world_event_definitions wd
             INNER JOIN ag_world_event_progress wp ON wp.event_id = wd.id
             WHERE wp.user_id = :user_id
             ORDER BY wd.sort_order ASC',
            ['user_id' => $userId]
        );

        $territories = $this->fetchAll(
            'SELECT t.id, t.territory_id, td.name, t.controlled, t.influence_level, t.cost
             FROM ag_territories t
             INNER JOIN ag_territory_definitions td ON td.id = t.territory_id
             WHERE user_id = :user_id
             ORDER BY td.sort_order ASC, t.id ASC',
            ['user_id' => $userId]
        );

        $votes = $this->fetchAll(
            'SELECT external_id, topic, description, options_json, votes_json, deadline_at, passed
             FROM ag_votes
             WHERE user_id = :user_id
             ORDER BY deadline_at ASC, id ASC',
            ['user_id' => $userId]
        );

        $retiredAdventurers = $this->fetchAll(
            'SELECT id, external_id, name, class, rank_name, level, experience, status, strength, intelligence, dexterity, vitality, quests_completed, years_in_guild, retirement_eligible, descendant_of_external_id, retirement_date, role
             FROM ag_retired_adventurers
             WHERE user_id = :user_id
             ORDER BY retirement_date DESC, id DESC',
            ['user_id' => $userId]
        );

        $materialRows = $this->fetchAll(
            'SELECT md.id, md.name, md.rarity, md.sources_json, mi.quantity
             FROM ag_crafting_material_definitions md
             LEFT JOIN ag_material_inventory mi ON mi.material_id = md.id AND mi.user_id = :user_id
             ORDER BY md.sort_order ASC',
            ['user_id' => $userId]
        );

        $recipeRows = $this->fetchAll(
            'SELECT rd.id, rd.name, rd.result_item_id, rd.gold_cost, rd.required_facility_level,
                    CASE WHEN ru.recipe_id IS NULL THEN 0 ELSE 1 END AS unlocked
             FROM ag_crafting_recipe_definitions rd
             LEFT JOIN ag_recipe_unlocks ru ON ru.recipe_id = rd.id AND ru.user_id = :user_id
             ORDER BY rd.sort_order ASC',
            ['user_id' => $userId]
        );

        $equipmentInventory = $this->fetchAll(
            'SELECT id, item_external_id, equipment_definition_id, name, type, rarity, crafted, source_type, source_ref, equipped_by_external_id
             FROM ag_equipment_inventory
             WHERE user_id = :user_id
             ORDER BY created_at DESC, id DESC',
            ['user_id' => $userId]
        );

        $recipeMaterialsByRecipeId = $this->fetchRecipeMaterialsByRecipeIds(array_map(fn(array $row): string => (string) $row['id'], $recipeRows));
        $definitionIds = array_values(array_filter(array_map(fn(array $row): ?string => $row['result_item_id'] ? (string) $row['result_item_id'] : null, $recipeRows)));
        $definitionMap = $this->fetchEquipmentDefinitionsByIds($definitionIds);
        $inventoryIds = array_map(fn(array $row): int => (int) $row['id'], $equipmentInventory);
        $inventoryStats = $this->fetchInventoryStatsByInventoryIds($inventoryIds);
        $inventoryMaterials = $this->fetchInventoryMaterialsByInventoryIds($inventoryIds);
        $facilityBenefits = $this->fetchFacilityBenefitsByRowIds(array_map(fn(array $row): int => (int) $row['id'], $facilities));
        $factionQuestTypes = $this->fetchFactionQuestTypesByFactionIds(array_map(fn(array $row): string => (string) $row['id'], $factions));
        $worldEventSpecialQuests = $this->fetchWorldEventSpecialQuestsByEventIds(array_map(fn(array $row): string => (string) $row['id'], $worldEvents));
        $territoryBenefits = $this->fetchTerritoryBenefitsByRowIds(array_map(fn(array $row): int => (int) $row['id'], $territories));
        $retiredPayloads = $this->fetchRetiredAdventurerPayloadsByRowIds(array_map(fn(array $row): int => (int) $row['id'], $retiredAdventurers));

        return [
            'factions' => array_map(fn(array $row): array => [
                'id' => (string) $row['id'],
                'name' => (string) $row['name'],
                'reputation' => (int) $row['reputation'],
                'description' => (string) $row['description'],
                'questModifiers' => [
                    'rewardMultiplier' => (float) $row['reward_multiplier'],
                    'availableQuestTypes' => $factionQuestTypes[(string) $row['id']] ?? [],
                ],
                'standingLabel' => (string) $row['standing_label'],
            ], $factions),
            'facilities' => array_map(fn(array $row): array => [
                'id' => (string) $row['facility_id'],
                'name' => (string) $row['name'],
                'level' => (int) $row['level'],
                'maxLevel' => (int) $row['max_level'],
                'cost' => (int) $row['cost'],
                'benefits' => $facilityBenefits[(int) $row['id']] ?? [],
                'description' => (string) ($row['description'] ?? ''),
            ], $facilities),
            'worldEvents' => array_map(fn(array $row): array => [
                'id' => (string) $row['id'],
                'name' => (string) $row['name'],
                'description' => (string) $row['description'],
                'active' => (bool) $row['active'],
                'duration' => (int) $row['duration_days'],
                'effects' => [
                    'questRewardMultiplier' => (float) $row['quest_reward_multiplier'],
                    'adventurerMoraleBonus' => $row['adventurer_morale_bonus'] === null ? null : (int) $row['adventurer_morale_bonus'],
                    'specialQuestsAvailable' => $worldEventSpecialQuests[(string) $row['id']] ?? [],
                ],
                'startedAt' => $row['started_at'] ? strtotime((string) $row['started_at']) * 1000 : null,
                'endsAt' => $row['ends_at'] ? strtotime((string) $row['ends_at']) * 1000 : null,
            ], $worldEvents),
            'territories' => array_map(fn(array $row): array => [
                'id' => (string) $row['territory_id'],
                'name' => (string) $row['name'],
                'controlled' => (bool) $row['controlled'],
                'influenceLevel' => (int) $row['influence_level'],
                'benefits' => $territoryBenefits[(int) $row['id']] ?? [],
                'cost' => (int) $row['cost'],
            ], $territories),
            'activeVotes' => array_map(fn(array $row): array => [
                'id' => (string) $row['external_id'],
                'topic' => (string) $row['topic'],
                'description' => (string) $row['description'],
                'options' => $this->decodeJson($row['options_json'], []),
                'votes' => $this->decodeJson($row['votes_json'], []),
                'deadline' => strtotime((string) $row['deadline_at']) * 1000,
                'passed' => $row['passed'] === null ? null : (bool) $row['passed'],
            ], $votes),
            'retiredAdventurers' => array_map(fn(array $row): array => [
                'id' => (string) $row['external_id'],
                'originalAdventurer' => $retiredPayloads[(int) $row['id']]['originalAdventurer'] ?? [],
                'retirementDate' => strtotime((string) $row['retirement_date']) * 1000,
                'role' => (string) $row['role'],
                'benefits' => $retiredPayloads[(int) $row['id']]['benefits'] ?? [],
            ], $retiredAdventurers),
            'materials' => array_reduce($materialRows, function (array $carry, array $row): array {
                $carry[(string) $row['id']] = (int) ($row['quantity'] ?? 0);
                return $carry;
            }, []),
            'materialCatalog' => array_map(fn(array $row): array => [
                'id' => (string) $row['id'],
                'name' => (string) $row['name'],
                'rarity' => (string) $row['rarity'],
                'sources' => $this->decodeJson($row['sources_json'], []),
            ], $materialRows),
            'availableRecipes' => array_values(array_map(
                fn(array $row): string => (string) $row['id'],
                array_filter($recipeRows, fn(array $row): bool => (int) $row['unlocked'] === 1)
            )),
            'recipeCatalog' => array_map(fn(array $row): array => [
                'id' => (string) $row['id'],
                'name' => (string) $row['name'],
                'result' => $definitionMap[(string) $row['result_item_id']] ?? [],
                'materials' => $recipeMaterialsByRecipeId[(string) $row['id']] ?? [],
                'goldCost' => (int) $row['gold_cost'],
                'requiredFacilityLevel' => (int) $row['required_facility_level'],
                'unlocked' => (int) $row['unlocked'] === 1,
            ], $recipeRows),
            'equipmentInventory' => array_map(fn(array $row): array => [
                'id' => (string) $row['item_external_id'],
                'name' => (string) $row['name'],
                'type' => (string) $row['type'],
                'rarity' => (string) $row['rarity'],
                'stats' => $inventoryStats[(int) $row['id']] ?? [],
                'crafted' => (bool) $row['crafted'],
                'materials' => $inventoryMaterials[(int) $row['id']] ?? [],
                'sourceType' => (string) $row['source_type'],
                'sourceRef' => $row['source_ref'] ?: null,
                'equippedBy' => $row['equipped_by_external_id'] ?: null,
            ], $equipmentInventory),
        ];
    }

    public function upgradeFacility(int $userId, string $facilityId): array
    {
        if ($facilityId === '') {
            throw new \InvalidArgumentException('Facility id is required');
        }

        $this->db->beginTransaction();
        try {
            $facility = $this->fetchOne(
                'SELECT * FROM ag_facilities WHERE user_id = :user_id AND facility_id = :facility_id LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'facility_id' => $facilityId]
            );
            if (!$facility) {
                throw new \RuntimeException('Facility not found');
            }

            $currentLevel = (int) $facility['level'];
            $maxLevel = (int) $facility['max_level'];
            if ($currentLevel >= $maxLevel) {
                throw new \RuntimeException('Facility already at maximum level');
            }

            $profile = $this->fetchOne('SELECT gold FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1 FOR UPDATE', ['user_id' => $userId]);
            if (!$profile) {
                throw new \RuntimeException('Guild profile not found');
            }

            $upgradeCost = $this->calculateFacilityUpgradeCost($facilityId, $currentLevel);
            if ((int) $profile['gold'] < $upgradeCost) {
                throw new \RuntimeException('Not enough gold to upgrade facility');
            }

            $newLevel = $currentLevel + 1;
            $benefits = $this->calculateFacilityBenefits($facilityId, $newLevel);

            $this->db->prepare(
                'UPDATE ag_facilities
                 SET level = :level, cost = :cost
                 WHERE id = :id'
            )->execute([
                'level' => $newLevel,
                'cost' => $this->calculateFacilityUpgradeCost($facilityId, $newLevel),
                'id' => (int) $facility['id'],
            ]);
            $this->replaceFacilityBenefits((int) $facility['id'], $benefits);

            $this->db->prepare('UPDATE ag_guild_profiles SET gold = gold - :gold, last_save_at = NOW() WHERE user_id = :user_id')->execute([
                'gold' => $upgradeCost,
                'user_id' => $userId,
            ]);

            if ($facilityId === 'forge') {
                $this->unlockRecipesForFacilityLevel($userId, $newLevel);
            }

            $this->appendActivity(
                $userId,
                'facility_upgraded',
                'Facility upgraded',
                sprintf('%s advanced to level %d for %d gold.', (string) $facility['name'], $newLevel, $upgradeCost),
                [
                    'facilityId' => $facilityId,
                    'newLevel' => $newLevel,
                    'cost' => $upgradeCost,
                ]
            );

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'summary' => $this->getSummary($userId),
            'worldState' => $this->getWorldState($userId),
        ];
    }

    public function craftRecipe(int $userId, string $recipeId): array
    {
        if ($recipeId === '') {
            throw new \InvalidArgumentException('Recipe id is required');
        }

        $this->db->beginTransaction();
        try {
            $recipe = $this->fetchOne('SELECT * FROM ag_crafting_recipe_definitions WHERE id = :id LIMIT 1', ['id' => $recipeId]);
            if (!$recipe) {
                throw new \RuntimeException('Recipe not found');
            }

            $unlocked = (int) $this->fetchScalar(
                'SELECT COUNT(*) FROM ag_recipe_unlocks WHERE user_id = :user_id AND recipe_id = :recipe_id',
                ['user_id' => $userId, 'recipe_id' => $recipeId]
            );
            if ($unlocked === 0) {
                throw new \RuntimeException('Recipe is not unlocked');
            }

            $profile = $this->fetchOne('SELECT gold FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1 FOR UPDATE', ['user_id' => $userId]);
            if (!$profile) {
                throw new \RuntimeException('Guild profile not found');
            }

            $forge = $this->fetchOne(
                "SELECT level FROM ag_facilities WHERE user_id = :user_id AND facility_id = 'forge' LIMIT 1 FOR UPDATE",
                ['user_id' => $userId]
            );
            $forgeLevel = (int) ($forge['level'] ?? 0);
            $requiredFacilityLevel = (int) $recipe['required_facility_level'];
            if ($forgeLevel < $requiredFacilityLevel) {
                throw new \RuntimeException(sprintf('Requires facility level %d', $requiredFacilityLevel));
            }

            $goldCost = (int) $recipe['gold_cost'];
            if ((int) $profile['gold'] < $goldCost) {
                throw new \RuntimeException('Not enough gold to craft recipe');
            }

            $materialRequirements = $this->fetchRecipeMaterialsByRecipeIds([$recipeId])[$recipeId] ?? [];
            if (!is_array($materialRequirements) || $materialRequirements === []) {
                throw new \RuntimeException('Recipe materials are invalid');
            }

            $inventoryRows = $this->fetchAll(
                'SELECT id, material_id, quantity FROM ag_material_inventory WHERE user_id = :user_id FOR UPDATE',
                ['user_id' => $userId]
            );
            $inventoryByMaterial = [];
            foreach ($inventoryRows as $row) {
                $inventoryByMaterial[(string) $row['material_id']] = $row;
            }

            foreach ($materialRequirements as $materialId => $requiredAmount) {
                $availableAmount = isset($inventoryByMaterial[$materialId]) ? (int) $inventoryByMaterial[$materialId]['quantity'] : 0;
                if ($availableAmount < (int) $requiredAmount) {
                    throw new \RuntimeException(sprintf('Missing material: %s', (string) $materialId));
                }
            }

            $consumeMaterial = $this->db->prepare('UPDATE ag_material_inventory SET quantity = quantity - :quantity WHERE id = :id');
            foreach ($materialRequirements as $materialId => $requiredAmount) {
                $consumeMaterial->execute([
                    'quantity' => (int) $requiredAmount,
                    'id' => (int) $inventoryByMaterial[$materialId]['id'],
                ]);
            }

            $this->db->prepare('UPDATE ag_guild_profiles SET gold = gold - :gold, last_save_at = NOW() WHERE user_id = :user_id')->execute([
                'gold' => $goldCost,
                'user_id' => $userId,
            ]);

            $definitionMap = $this->fetchEquipmentDefinitionsByIds([(string) $recipe['result_item_id']]);
            $craftedItem = $definitionMap[(string) $recipe['result_item_id']] ?? [];
            if ($craftedItem === []) {
                throw new \RuntimeException('Crafting result definition not found');
            }
            $this->createInventoryItemFromDefinition($userId, $craftedItem, 'crafting', $recipeId);
            $this->appendActivity(
                $userId,
                'recipe_crafted',
                'Crafting completed',
                sprintf('%s was crafted for %d gold.', (string) ($craftedItem['name'] ?? $recipe['name']), $goldCost),
                [
                    'recipeId' => $recipeId,
                    'equipmentDefinitionId' => $craftedItem['id'] ?? null,
                    'itemName' => $craftedItem['name'] ?? (string) $recipe['name'],
                    'goldCost' => $goldCost,
                    'materials' => $materialRequirements,
                ]
            );

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'summary' => $this->getSummary($userId),
            'worldState' => $this->getWorldState($userId),
        ];
    }

    public function equipInventoryItem(int $userId, string $adventurerId, string $itemId): array
    {
        if ($adventurerId === '' || $itemId === '') {
            throw new \InvalidArgumentException('Adventurer id and item id are required');
        }

        $this->db->beginTransaction();
        try {
            $adventurer = $this->fetchOne(
                'SELECT external_id, status FROM ag_adventurers WHERE user_id = :user_id AND external_id = :external_id LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'external_id' => $adventurerId]
            );
            if (!$adventurer) {
                throw new \RuntimeException('Adventurer not found');
            }
            if ((string) $adventurer['status'] !== 'available') {
                throw new \RuntimeException('Adventurer must be available to equip items');
            }

            $inventoryItem = $this->fetchOne(
                'SELECT id, item_external_id, type, equipped_by_external_id, name FROM ag_equipment_inventory WHERE user_id = :user_id AND item_external_id = :item_external_id LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'item_external_id' => $itemId]
            );
            if (!$inventoryItem) {
                throw new \RuntimeException('Inventory item not found');
            }
            if (!empty($inventoryItem['equipped_by_external_id']) && (string) $inventoryItem['equipped_by_external_id'] !== $adventurerId) {
                throw new \RuntimeException('Inventory item is already equipped');
            }

            $slotType = (string) $inventoryItem['type'];
            $existingSlot = $this->fetchOne(
                'SELECT id, inventory_item_id FROM ag_adventurer_equipment_slots WHERE user_id = :user_id AND adventurer_external_id = :adventurer_external_id AND slot_type = :slot_type LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'adventurer_external_id' => $adventurerId, 'slot_type' => $slotType]
            );
            if ($existingSlot) {
                $this->db->prepare('UPDATE ag_equipment_inventory SET equipped_by_external_id = NULL WHERE id = :id')->execute([
                    'id' => (int) $existingSlot['inventory_item_id'],
                ]);
                $this->db->prepare('DELETE FROM ag_adventurer_equipment_slots WHERE id = :id')->execute([
                    'id' => (int) $existingSlot['id'],
                ]);
            }

            $this->db->prepare(
                'INSERT INTO ag_adventurer_equipment_slots (user_id, adventurer_external_id, slot_type, inventory_item_id)
                 VALUES (:user_id, :adventurer_external_id, :slot_type, :inventory_item_id)'
            )->execute([
                'user_id' => $userId,
                'adventurer_external_id' => $adventurerId,
                'slot_type' => $slotType,
                'inventory_item_id' => (int) $inventoryItem['id'],
            ]);

            $this->db->prepare('UPDATE ag_equipment_inventory SET equipped_by_external_id = :equipped_by WHERE id = :id')->execute([
                'equipped_by' => $adventurerId,
                'id' => (int) $inventoryItem['id'],
            ]);

            $this->appendActivity($userId, 'item_equipped', 'Equipment assigned', sprintf('%s equipped %s.', $adventurerId, (string) $inventoryItem['name']), [
                'adventurerId' => $adventurerId,
                'itemId' => $itemId,
                'slotType' => $slotType,
            ]);

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'roster' => $this->getRoster($userId),
            'worldState' => $this->getWorldState($userId),
        ];
    }

    public function unequipInventoryItem(int $userId, string $adventurerId, string $slotType): array
    {
        if ($adventurerId === '' || $slotType === '') {
            throw new \InvalidArgumentException('Adventurer id and slot type are required');
        }

        $this->db->beginTransaction();
        try {
            $slot = $this->fetchOne(
                'SELECT id, inventory_item_id FROM ag_adventurer_equipment_slots WHERE user_id = :user_id AND adventurer_external_id = :adventurer_external_id AND slot_type = :slot_type LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'adventurer_external_id' => $adventurerId, 'slot_type' => $slotType]
            );
            if (!$slot) {
                throw new \RuntimeException('Equipped item not found');
            }

            $this->db->prepare('UPDATE ag_equipment_inventory SET equipped_by_external_id = NULL WHERE id = :id')->execute([
                'id' => (int) $slot['inventory_item_id'],
            ]);
            $this->db->prepare('DELETE FROM ag_adventurer_equipment_slots WHERE id = :id')->execute([
                'id' => (int) $slot['id'],
            ]);

            $this->appendActivity($userId, 'item_unequipped', 'Equipment removed', sprintf('%s unequipped their %s slot.', $adventurerId, $slotType), [
                'adventurerId' => $adventurerId,
                'slotType' => $slotType,
            ]);

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'roster' => $this->getRoster($userId),
            'worldState' => $this->getWorldState($userId),
        ];
    }

    public function retireAdventurer(int $userId, string $adventurerId, ?string $requestedRole = null): array
    {
        if ($adventurerId === '') {
            throw new \InvalidArgumentException('Adventurer id is required');
        }

        $this->db->beginTransaction();
        try {
            $adventurer = $this->fetchOne(
                'SELECT * FROM ag_adventurers WHERE user_id = :user_id AND external_id = :external_id AND is_retired = 0 LIMIT 1 FOR UPDATE',
                ['user_id' => $userId, 'external_id' => $adventurerId]
            );
            if (!$adventurer) {
                throw new \RuntimeException('Adventurer not found');
            }

            if ((string) $adventurer['status'] === 'on quest') {
                throw new \RuntimeException('Adventurer must return from their quest before retiring');
            }

            if (!$this->isRetirementEligibleRow($adventurer)) {
                throw new \RuntimeException('Adventurer is not eligible for retirement');
            }

            $adventurerPayload = $this->mapAdventurer($adventurer, $this->fetchEquippedItemsByAdventurerIds($userId, [$adventurerId])[$adventurerId] ?? []);
            $roleDefinition = $this->resolveRetirementRoleDefinition($adventurerPayload, $requestedRole);
            $benefits = $roleDefinition['benefits'];

            $this->db->prepare(
                'INSERT INTO ag_retired_adventurers (
                    user_id, external_id, name, class, rank_name, level, experience, status, strength, intelligence, dexterity, vitality,
                    quests_completed, years_in_guild, retirement_eligible, descendant_of_external_id, retirement_date, role
                 ) VALUES (
                    :user_id, :external_id, :name, :class, :rank_name, :level, :experience, :status, :strength, :intelligence, :dexterity, :vitality,
                    :quests_completed, :years_in_guild, :retirement_eligible, :descendant_of_external_id, NOW(), :role
                 )'
            )->execute([
                'user_id' => $userId,
                'external_id' => (string) $adventurer['external_id'],
                'name' => (string) $adventurer['name'],
                'class' => (string) $adventurer['class'],
                'rank_name' => (string) $adventurer['rank_name'],
                'level' => (int) $adventurer['level'],
                'experience' => (int) $adventurer['experience'],
                'status' => 'retired',
                'strength' => (int) $adventurer['strength'],
                'intelligence' => (int) $adventurer['intelligence'],
                'dexterity' => (int) $adventurer['dexterity'],
                'vitality' => (int) $adventurer['vitality'],
                'quests_completed' => (int) $adventurer['quests_completed'],
                'years_in_guild' => (int) $adventurer['years_in_guild'],
                'retirement_eligible' => 1,
                'descendant_of_external_id' => $adventurer['descendant_of_external_id'] ?: null,
                'role' => (string) $roleDefinition['role'],
            ]);
            $retiredAdventurerId = (int) $this->db->lastInsertId();

            $this->persistRetiredAdventurerSnapshot($retiredAdventurerId, $adventurerPayload, $benefits);

            $this->db->prepare(
                "UPDATE ag_equipment_inventory SET equipped_by_external_id = NULL WHERE user_id = :user_id AND equipped_by_external_id = :external_id"
            )->execute([
                'user_id' => $userId,
                'external_id' => $adventurerId,
            ]);
            $this->db->prepare(
                'DELETE FROM ag_adventurer_equipment_slots WHERE user_id = :user_id AND adventurer_external_id = :external_id'
            )->execute([
                'user_id' => $userId,
                'external_id' => $adventurerId,
            ]);

            $this->db->prepare(
                "UPDATE ag_adventurers
                 SET is_retired = 1, retired_role = :retired_role, retired_at = NOW(), status = 'retired'
                 WHERE id = :id"
            )->execute([
                'retired_role' => (string) $roleDefinition['role'],
                'id' => (int) $adventurer['id'],
            ]);

            $this->db->prepare('UPDATE ag_guild_profiles SET last_save_at = NOW() WHERE user_id = :user_id')->execute([
                'user_id' => $userId,
            ]);

            $this->appendActivity(
                $userId,
                'adventurer_retired',
                'Adventurer retired',
                sprintf('%s retired from active duty and now serves as %s.', (string) $adventurer['name'], (string) $roleDefinition['label']),
                [
                    'adventurerId' => $adventurerId,
                    'role' => (string) $roleDefinition['role'],
                    'benefits' => $benefits,
                ]
            );

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'summary' => $this->getSummary($userId),
            'roster' => $this->getRoster($userId),
            'worldState' => $this->getWorldState($userId),
        ];
    }

    public function refreshRecruits(int $userId): array
    {
        $refreshCost = $this->getNumericConstant('RECRUIT_REFRESH_COST', 50);
        $maxAdventurers = $this->getNumericConstant('MAX_ADVENTURERS', 25);

        $this->db->beginTransaction();
        try {
            $profile = $this->fetchOne('SELECT gold FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1 FOR UPDATE', ['user_id' => $userId]);
            if (!$profile) {
                throw new \RuntimeException('Guild profile not found');
            }

            if ((int) $profile['gold'] < $refreshCost) {
                throw new \RuntimeException('Not enough gold to refresh recruits');
            }

            $adventurerCount = (int) $this->fetchScalar('SELECT COUNT(*) FROM ag_adventurers WHERE user_id = :user_id AND is_retired = 0', ['user_id' => $userId]);
            if ($adventurerCount >= $maxAdventurers) {
                throw new \RuntimeException('Maximum adventurers reached');
            }

            $this->db->prepare('DELETE FROM ag_recruits WHERE user_id = :user_id')->execute(['user_id' => $userId]);
            $this->db->prepare('UPDATE ag_guild_profiles SET gold = gold - :gold, last_save_at = NOW() WHERE user_id = :user_id')->execute([
                'gold' => $refreshCost,
                'user_id' => $userId,
            ]);

            $insert = $this->db->prepare('INSERT INTO ag_recruits (user_id, external_id, name, class, level, cost, personality_json, potential_skills_json, descendant_of_external_id, raw_payload_json) VALUES (:user_id, :external_id, :name, :class, :level, :cost, :personality_json, :potential_skills_json, NULL, NULL)');
            for ($index = 0; $index < 3; $index++) {
                $recruit = $this->generateRecruit();
                $insert->execute([
                    'user_id' => $userId,
                    'external_id' => $recruit['id'],
                    'name' => $recruit['name'],
                    'class' => $recruit['class'],
                    'level' => $recruit['level'],
                    'cost' => $recruit['cost'],
                    'personality_json' => json_encode($recruit['personality'], JSON_UNESCAPED_SLASHES),
                    'potential_skills_json' => json_encode($recruit['potentialSkills'], JSON_UNESCAPED_SLASHES),
                ]);
            }
            $this->appendActivity($userId, 'recruit_refresh', 'Recruit roster refreshed', 'Three new recruits arrived at the guild hall.', [
                'refreshCost' => $refreshCost,
                'recruitCount' => 3,
            ]);

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'summary' => $this->getSummary($userId),
            'roster' => $this->getRoster($userId),
        ];
    }

    public function hireRecruit(int $userId, string $recruitId): array
    {
        if ($recruitId === '') {
            throw new \InvalidArgumentException('Recruit id is required');
        }

        $maxAdventurers = $this->getNumericConstant('MAX_ADVENTURERS', 25);

        $this->db->beginTransaction();
        try {
            $recruit = $this->fetchOne('SELECT * FROM ag_recruits WHERE user_id = :user_id AND external_id = :external_id LIMIT 1 FOR UPDATE', [
                'user_id' => $userId,
                'external_id' => $recruitId,
            ]);
            if (!$recruit) {
                throw new \RuntimeException('Recruit not found');
            }

            $profile = $this->fetchOne('SELECT gold FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1 FOR UPDATE', ['user_id' => $userId]);
            if (!$profile) {
                throw new \RuntimeException('Guild profile not found');
            }

            if ((int) $profile['gold'] < (int) $recruit['cost']) {
                throw new \RuntimeException('Not enough gold');
            }

            $adventurerCount = (int) $this->fetchScalar('SELECT COUNT(*) FROM ag_adventurers WHERE user_id = :user_id AND is_retired = 0', ['user_id' => $userId]);
            if ($adventurerCount >= $maxAdventurers) {
                throw new \RuntimeException('Maximum adventurers reached');
            }

            $stats = $this->buildRecruitStats((int) $recruit['level']);
            $this->db->prepare('INSERT INTO ag_adventurers (user_id, external_id, name, class, rank_name, level, experience, status, strength, intelligence, dexterity, vitality, personality_json, skills_json, relationships_json, quests_completed, years_in_guild, retirement_eligible, descendant_of_external_id, raw_payload_json) VALUES (:user_id, :external_id, :name, :class, :rank_name, :level, 0, :status, :strength, :intelligence, :dexterity, :vitality, :personality_json, :skills_json, :relationships_json, 0, 0, 0, :descendant_of_external_id, NULL)')->execute([
                'user_id' => $userId,
                'external_id' => (string) $recruit['external_id'],
                'name' => (string) $recruit['name'],
                'class' => (string) $recruit['class'],
                'rank_name' => 'Novice',
                'level' => (int) $recruit['level'],
                'status' => 'available',
                'strength' => $stats['strength'],
                'intelligence' => $stats['intelligence'],
                'dexterity' => $stats['dexterity'],
                'vitality' => $stats['vitality'],
                'personality_json' => $recruit['personality_json'],
                'skills_json' => json_encode($this->buildRecruitSkills($this->decodeJson($recruit['potential_skills_json'], [])), JSON_UNESCAPED_SLASHES),
                'relationships_json' => json_encode([], JSON_UNESCAPED_SLASHES),
                'descendant_of_external_id' => $recruit['descendant_of_external_id'] ?: null,
            ]);

            $this->db->prepare('DELETE FROM ag_recruits WHERE id = :id')->execute(['id' => (int) $recruit['id']]);
            $this->db->prepare('UPDATE ag_guild_profiles SET gold = gold - :gold, last_save_at = NOW() WHERE user_id = :user_id')->execute([
                'gold' => (int) $recruit['cost'],
                'user_id' => $userId,
            ]);
            $this->appendActivity($userId, 'recruit_hired', 'Recruit hired', sprintf('%s joined the guild as a level %d %s.', (string) $recruit['name'], (int) $recruit['level'], (string) $recruit['class']), [
                'recruitId' => (string) $recruit['external_id'],
                'cost' => (int) $recruit['cost'],
            ]);

            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return [
            'summary' => $this->getSummary($userId),
            'roster' => $this->getRoster($userId),
        ];
    }
    public function getQuestBoard(int $userId): array
    {
        $summary = $this->getSummary($userId);
        $completedQuestIds = array_map(fn(array $row): string => (string) $row['quest_id'], $this->fetchAll('SELECT quest_id FROM ag_completed_quests WHERE user_id = :user_id', ['user_id' => $userId]));
        $activeQuestRows = $this->fetchAll('SELECT * FROM ag_active_quests WHERE user_id = :user_id ORDER BY started_at ASC', ['user_id' => $userId]);
        $activeQuestIds = array_map(fn(array $row): string => (string) $row['quest_id'], $activeQuestRows);

        $availableRows = $this->fetchAll("SELECT * FROM ag_quest_definitions WHERE source_type = 'standard' ORDER BY sort_order ASC");
        $campaigns = $this->fetchAll('SELECT cp.campaign_id, cp.current_quest_index, cp.completed, cd.name, cd.description, cd.quest_ids_json, cd.rewards_json FROM ag_campaign_progress cp INNER JOIN ag_campaign_definitions cd ON cd.id = cp.campaign_id WHERE cp.user_id = :user_id ORDER BY cd.sort_order ASC', ['user_id' => $userId]);
        foreach ($campaigns as $campaign) {
            if ((int) $campaign['completed'] === 1) {
                continue;
            }
            $questIds = $this->decodeJson($campaign['quest_ids_json'], []);
            $currentIndex = (int) $campaign['current_quest_index'];
            if (isset($questIds[$currentIndex]) && is_string($questIds[$currentIndex])) {
                $quest = $this->findQuestDefinition($questIds[$currentIndex]);
                if ($quest) {
                    $availableRows[] = $quest;
                }
            }
        }

        $seasonalRows = $this->fetchAll('SELECT * FROM ag_seasonal_event_definitions ORDER BY sort_order ASC');
        foreach ($seasonalRows as $seasonalRow) {
            if (!$this->isSeasonalEventAvailable($seasonalRow, $summary['currentSeason'], (int) $summary['level'], (int) $summary['reputation'], $completedQuestIds)) {
                continue;
            }
            $availableRows = array_merge($availableRows, $this->fetchAll("SELECT * FROM ag_quest_definitions WHERE source_type = 'seasonal' AND seasonal_event_id = :seasonal_event_id ORDER BY sort_order ASC", ['seasonal_event_id' => $seasonalRow['id']]));
        }

        $availableRows = array_values(array_filter($availableRows, fn(array $row): bool => !in_array((string) $row['id'], $completedQuestIds, true) && !in_array((string) $row['id'], $activeQuestIds, true)));

        return [
            'availableQuests' => array_map(fn(array $row): array => $this->mapQuestDefinition($row), $availableRows),
            'activeQuests' => array_map(fn(array $row): array => $this->mapActiveQuest($row), $activeQuestRows),
            'completedQuests' => $completedQuestIds,
            'campaignProgress' => array_map(function (array $row): array {
                $questIds = $this->decodeJson($row['quest_ids_json'], []);
                $currentQuestIndex = (int) $row['current_quest_index'];
                $currentQuestId = isset($questIds[$currentQuestIndex]) && is_string($questIds[$currentQuestIndex]) ? $questIds[$currentQuestIndex] : null;
                $currentQuest = $currentQuestId ? $this->findQuestDefinition($currentQuestId) : null;

                return [
                    'campaignId' => $row['campaign_id'],
                    'name' => (string) $row['name'],
                    'description' => (string) $row['description'],
                    'questIds' => is_array($questIds) ? $questIds : [],
                    'currentQuestIndex' => $currentQuestIndex,
                    'completed' => (bool) $row['completed'],
                    'rewards' => $this->decodeJson($row['rewards_json'], []),
                    'currentQuestId' => $currentQuestId,
                    'currentQuestName' => $currentQuest['name'] ?? null,
                ];
            }, $campaigns),
        ];
    }

    public function assignQuest(int $userId, string $questId, array $adventurerIds): array
    {
        if ($questId === '' || $adventurerIds === []) {
            throw new \InvalidArgumentException('Quest id and adventurer ids are required');
        }
        $quest = $this->findQuestDefinition($questId);
        if (!$quest) {
            throw new \RuntimeException('Quest not found');
        }
        if ((int) $this->fetchScalar('SELECT COUNT(*) FROM ag_active_quests WHERE user_id = :user_id AND quest_id = :quest_id', ['user_id' => $userId, 'quest_id' => $questId]) > 0) {
            throw new \RuntimeException('Quest is already active');
        }

        $this->db->beginTransaction();
        try {
            $adventurers = $this->fetchRowsForIds($userId, 'ag_adventurers', $adventurerIds, true);
            if (count($adventurers) !== count($adventurerIds)) {
                throw new \RuntimeException('One or more adventurers were not found');
            }
            foreach ($adventurers as $adventurer) {
                if ((string) $adventurer['status'] !== 'available') {
                    throw new \RuntimeException('All selected adventurers must be available');
                }
            }

            $this->db->prepare('INSERT INTO ag_active_quests (user_id, quest_id, status, assigned_adventurers_json, started_at, expected_completion_at, raw_payload_json) VALUES (:user_id, :quest_id, :status, :assigned_adventurers_json, NOW(), :expected_completion_at, :raw_payload_json)')->execute([
                'user_id' => $userId,
                'quest_id' => $questId,
                'status' => 'active',
                'assigned_adventurers_json' => json_encode(array_values($adventurerIds), JSON_UNESCAPED_SLASHES),
                'expected_completion_at' => date('Y-m-d H:i:s', time() + max(1, (int) $quest['duration_value'])),
                'raw_payload_json' => json_encode($this->mapQuestDefinition($quest), JSON_UNESCAPED_SLASHES),
            ]);

            $update = $this->db->prepare("UPDATE ag_adventurers SET status = 'on quest' WHERE user_id = :user_id AND external_id = :external_id");
            foreach ($adventurerIds as $adventurerId) {
                $update->execute(['user_id' => $userId, 'external_id' => $adventurerId]);
            }
            $this->appendActivity($userId, 'quest_assigned', 'Quest assigned', sprintf('%s was assigned to %d adventurer(s).', (string) $quest['name'], count($adventurerIds)), [
                'questId' => $questId,
                'adventurerIds' => array_values($adventurerIds),
            ]);
            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return $this->getQuestBoard($userId);
    }

    public function resolveQuest(int $userId, string $questId): array
    {
        $this->db->beginTransaction();
        try {
            $activeQuest = $this->fetchOne('SELECT * FROM ag_active_quests WHERE user_id = :user_id AND quest_id = :quest_id LIMIT 1 FOR UPDATE', ['user_id' => $userId, 'quest_id' => $questId]);
            if (!$activeQuest) {
                throw new \RuntimeException('Active quest not found');
            }
            $expectedCompletionAt = isset($activeQuest['expected_completion_at']) && $activeQuest['expected_completion_at']
                ? strtotime((string) $activeQuest['expected_completion_at'])
                : null;
            if ($expectedCompletionAt !== null && $expectedCompletionAt > time()) {
                throw new \RuntimeException('Quest is still in progress');
            }
            $quest = $this->findQuestDefinition($questId);
            if (!$quest) {
                throw new \RuntimeException('Quest definition not found');
            }

            $assignedAdventurers = $this->decodeJson($activeQuest['assigned_adventurers_json'], []);
            $xpReward = (int) ($quest['experience_reward'] ?? 0);
            $reward = (int) ($quest['reward'] ?? 0);
            $adventurers = $this->fetchRowsForIds($userId, 'ag_adventurers', $assignedAdventurers, true);
            $updateAdventurer = $this->db->prepare('UPDATE ag_adventurers SET status = :status, experience = :experience, level = :level, quests_completed = :quests_completed WHERE id = :id');
            foreach ($adventurers as $adventurer) {
                $currentExperience = (int) $adventurer['experience'];
                $currentLevel = (int) $adventurer['level'];
                $newExperience = $currentExperience + $xpReward;
                $newLevel = $newExperience >= ($currentLevel * 100) ? $currentLevel + 1 : $currentLevel;
                $updateAdventurer->execute(['status' => 'available', 'experience' => $newExperience, 'level' => $newLevel, 'quests_completed' => (int) $adventurer['quests_completed'] + 1, 'id' => (int) $adventurer['id']]);
            }
            $this->db->prepare('DELETE FROM ag_active_quests WHERE id = :id')->execute(['id' => (int) $activeQuest['id']]);
            $this->db->prepare('INSERT IGNORE INTO ag_completed_quests (user_id, quest_id, completed_at) VALUES (:user_id, :quest_id, NOW())')->execute(['user_id' => $userId, 'quest_id' => $questId]);
            $this->db->prepare('UPDATE ag_guild_profiles SET gold = gold + :gold, reputation = reputation + :reputation_delta, last_save_at = NOW() WHERE user_id = :user_id')->execute(['gold' => $reward, 'reputation_delta' => (int) floor($reward / 10), 'user_id' => $userId]);
            foreach ($this->fetchQuestLootItems($questId) as $lootItem) {
                for ($index = 0; $index < (int) ($lootItem['quantity'] ?? 1); $index++) {
                    $this->createInventoryItemFromDefinition($userId, $lootItem, 'quest_loot', $questId);
                }
            }
            $this->appendActivity($userId, 'quest_resolved', 'Quest completed', sprintf('%s returned %d gold and %d reputation.', (string) $quest['name'], $reward, (int) floor($reward / 10)), [
                'questId' => $questId,
                'gold' => $reward,
                'reputationDelta' => (int) floor($reward / 10),
            ]);
            $this->db->commit();
        } catch (\Throwable $exception) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $exception;
        }

        return ['summary' => $this->getSummary($userId), 'roster' => $this->getRoster($userId), 'quests' => $this->getQuestBoard($userId)];
    }

    public function saveSlot(int $userId, int $slotNumber, ?string $slotName = null): array
    {
        if ($slotNumber < 1 || $slotNumber > 9) {
            throw new \InvalidArgumentException('Slot number must be between 1 and 9');
        }

        $snapshot = ['summary' => $this->getSummary($userId), 'roster' => $this->getRoster($userId), 'quests' => $this->getQuestBoard($userId)];
        $profile = $this->fetchOne('SELECT id FROM ag_guild_profiles WHERE user_id = :user_id LIMIT 1', ['user_id' => $userId]);
        $this->db->prepare('INSERT INTO ag_save_slots (user_id, slot_number, slot_name, guild_profile_id, snapshot_json, metadata_json, version) VALUES (:user_id, :slot_number, :slot_name, :guild_profile_id, :snapshot_json, :metadata_json, :version) ON DUPLICATE KEY UPDATE slot_name = VALUES(slot_name), guild_profile_id = VALUES(guild_profile_id), snapshot_json = VALUES(snapshot_json), metadata_json = VALUES(metadata_json), version = VALUES(version), updated_at = CURRENT_TIMESTAMP')->execute([
            'user_id' => $userId,
            'slot_number' => $slotNumber,
            'slot_name' => $slotName ?: ('Save Slot ' . $slotNumber),
            'guild_profile_id' => $profile['id'] ?? null,
            'snapshot_json' => json_encode($snapshot, JSON_UNESCAPED_SLASHES),
            'metadata_json' => json_encode(['adventurerCount' => count($snapshot['roster']['adventurers']), 'activeQuestCount' => count($snapshot['quests']['activeQuests']), 'completedQuestCount' => count($snapshot['quests']['completedQuests'])], JSON_UNESCAPED_SLASHES),
            'version' => '1.0.0',
        ]);
        $this->appendActivity($userId, 'save_slot_written', 'Save slot updated', sprintf('Slot %d was saved as "%s".', $slotNumber, $slotName ?: ('Save Slot ' . $slotNumber)), [
            'slotNumber' => $slotNumber,
            'slotName' => $slotName ?: ('Save Slot ' . $slotNumber),
        ]);
        return ['slotNumber' => $slotNumber, 'slotName' => $slotName ?: ('Save Slot ' . $slotNumber), 'snapshot' => $snapshot];
    }

    public function loadSlot(int $userId, int $slotNumber): array
    {
        $slot = $this->fetchOne('SELECT * FROM ag_save_slots WHERE user_id = :user_id AND slot_number = :slot_number LIMIT 1', ['user_id' => $userId, 'slot_number' => $slotNumber]);
        if (!$slot) {
            throw new \RuntimeException('Save slot not found');
        }
        $this->appendActivity($userId, 'save_slot_loaded', 'Save slot loaded', sprintf('Slot %d ("%s") was loaded.', $slotNumber, (string) $slot['slot_name']), [
            'slotNumber' => $slotNumber,
            'slotName' => (string) $slot['slot_name'],
        ]);
        return ['slotNumber' => $slotNumber, 'slotName' => $slot['slot_name'], 'snapshot' => $this->decodeJson($slot['snapshot_json'], [])];
    }

    public function listSaveSlots(int $userId): array
    {
        return array_map(
            fn(array $row): array => [
                'slotNumber' => (int) $row['slot_number'],
                'slotName' => (string) $row['slot_name'],
                'version' => (string) $row['version'],
                'updatedAt' => $row['updated_at'] ? strtotime((string) $row['updated_at']) * 1000 : null,
                'createdAt' => $row['created_at'] ? strtotime((string) $row['created_at']) * 1000 : null,
                'metadata' => $this->decodeJson($row['metadata_json'], []),
            ],
            $this->fetchAll('SELECT slot_number, slot_name, version, created_at, updated_at, metadata_json FROM ag_save_slots WHERE user_id = :user_id ORDER BY slot_number ASC', ['user_id' => $userId])
        );
    }

    private function fetchRowsForIds(int $userId, string $table, array $externalIds, bool $forUpdate = false): array
    {
        if ($externalIds === []) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($externalIds), '?'));
        $sql = "SELECT * FROM {$table} WHERE user_id = ? AND external_id IN ({$placeholders})";
        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_merge([$userId], $externalIds));
        return $stmt->fetchAll() ?: [];
    }

    private function findQuestDefinition(string $questId): ?array
    {
        return $this->fetchOne('SELECT * FROM ag_quest_definitions WHERE id = :id LIMIT 1', ['id' => $questId]);
    }

    private function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    private function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll() ?: [];
    }

    private function fetchScalar(string $sql, array $params = []): mixed
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    private function appendActivity(int $userId, string $eventType, string $title, string $description, array $metadata = []): void
    {
        $this->db->prepare('INSERT INTO ag_activity_log (user_id, event_type, title, description, metadata_json) VALUES (:user_id, :event_type, :title, :description, :metadata_json)')->execute([
            'user_id' => $userId,
            'event_type' => $eventType,
            'title' => $title,
            'description' => $description,
            'metadata_json' => json_encode($metadata, JSON_UNESCAPED_SLASHES),
        ]);
    }

    private function getNumericConstant(string $constantKey, int|float $default): int
    {
        $value = $this->fetchScalar('SELECT value_json FROM ag_constants WHERE constant_group = :constant_group AND constant_key = :constant_key LIMIT 1', [
            'constant_group' => 'guild_constants',
            'constant_key' => $constantKey,
        ]);

        if ($value === false || $value === null) {
            return (int) $default;
        }

        return (int) json_decode((string) $value, true);
    }

    private function generateRecruit(): array
    {
        $level = random_int(1, 5);
        $class = $this->randomFrom(['Warrior', 'Mage', 'Rogue', 'Archer']);
        $title = $this->randomFrom(['Adept', 'Scout', 'Vanguard', 'Warden', 'Seeker', 'Mercenary']);
        $name = $title . ' ' . $this->randomFrom(['Ash', 'Briar', 'Corvin', 'Dawn', 'Ember', 'Flint', 'Gale', 'Hale', 'Iris', 'Jett']);

        return [
            'id' => 'recruit_' . time() . '_' . bin2hex(random_bytes(4)),
            'name' => $name,
            'class' => $class,
            'level' => $level,
            'cost' => $this->calculateRecruitCost($level),
            'personality' => $this->generatePersonality(),
            'potentialSkills' => $this->generatePotentialSkills(),
        ];
    }

    private function calculateRecruitCost(int $level): int
    {
        $base = (float) $this->getNumericConstant('RECRUIT_BASE_COST', 100);
        $multiplierValue = $this->fetchScalar('SELECT value_json FROM ag_constants WHERE constant_group = :constant_group AND constant_key = :constant_key LIMIT 1', [
            'constant_group' => 'guild_constants',
            'constant_key' => 'RECRUIT_COST_MULTIPLIER',
        ]);
        $multiplier = $multiplierValue === false || $multiplierValue === null ? 1.2 : (float) json_decode((string) $multiplierValue, true);

        return (int) floor($base * ($multiplier ** max(0, $level - 1)));
    }

    private function generatePersonality(): array
    {
        return [
            'courage' => random_int(35, 80),
            'loyalty' => random_int(35, 80),
            'ambition' => random_int(35, 80),
            'teamwork' => random_int(35, 80),
            'greed' => random_int(20, 70),
        ];
    }

    private function generatePotentialSkills(): array
    {
        $keys = [
            'combat.weaponMastery',
            'combat.tacticalKnowledge',
            'magic.spellPower',
            'magic.elementalMastery',
            'stealth.sneaking',
            'stealth.lockpicking',
            'survival.tracking',
            'survival.herbalism',
        ];

        shuffle($keys);
        $skills = [];
        foreach (array_slice($keys, 0, 3) as $key) {
            $skills[$key] = random_int(1, 10);
        }

        return $skills;
    }

    private function buildRecruitStats(int $level): array
    {
        return [
            'strength' => $level * 10,
            'intelligence' => $level * 10,
            'dexterity' => $level * 10,
            'vitality' => $level * 10,
        ];
    }

    private function buildRecruitSkills(array $potentialSkills): array
    {
        $skills = [
            'combat' => ['weaponMastery' => 0, 'tacticalKnowledge' => 0, 'battleRage' => 0],
            'magic' => ['spellPower' => 0, 'manaEfficiency' => 0, 'elementalMastery' => 0],
            'stealth' => ['lockpicking' => 0, 'sneaking' => 0, 'assassination' => 0],
            'survival' => ['tracking' => 0, 'herbalism' => 0, 'animalHandling' => 0],
        ];

        foreach ($potentialSkills as $key => $value) {
            if (!is_string($key) || !is_int($value)) {
                continue;
            }

            $parts = explode('.', $key, 2);
            if (count($parts) !== 2) {
                continue;
            }

            [$category, $skill] = $parts;
            if (!isset($skills[$category]) || !array_key_exists($skill, $skills[$category])) {
                continue;
            }

            $skills[$category][$skill] = $value;
        }

        return $skills;
    }

    private function randomFrom(array $values): string
    {
        return $values[array_rand($values)];
    }
    private function mapAdventurer(array $row, array $equipment = []): array
    {
        return ['id' => $row['external_id'], 'name' => $row['name'], 'class' => $row['class'], 'rank' => $row['rank_name'], 'level' => (int) $row['level'], 'experience' => (int) $row['experience'], 'status' => $row['status'], 'stats' => ['strength' => (int) $row['strength'], 'intelligence' => (int) $row['intelligence'], 'dexterity' => (int) $row['dexterity'], 'vitality' => (int) $row['vitality']], 'personality' => $this->decodeJson($row['personality_json'], []), 'skills' => $this->decodeJson($row['skills_json'], []), 'equipment' => $equipment, 'relationships' => $this->decodeJson($row['relationships_json'], []), 'questsCompleted' => (int) $row['quests_completed'], 'yearsInGuild' => (int) $row['years_in_guild'], 'retirementEligible' => $this->isRetirementEligibleRow($row), 'descendantOf' => $row['descendant_of_external_id'] ?: null];
    }

    private function mapRecruit(array $row): array
    {
        return ['id' => $row['external_id'], 'name' => $row['name'], 'level' => (int) $row['level'], 'class' => $row['class'], 'cost' => (int) $row['cost'], 'personality' => $this->decodeJson($row['personality_json'], []), 'potentialSkills' => $this->decodeJson($row['potential_skills_json'], []), 'descendantOf' => $row['descendant_of_external_id'] ?: null];
    }

    private function mapQuestDefinition(array $row): array
    {
        return ['id' => $row['id'], 'name' => $row['name'], 'description' => $row['description'], 'reward' => (int) $row['reward'], 'duration' => (int) $row['duration_value'], 'requirements' => ['minLevel' => (int) $row['min_level'], 'preferredClasses' => $this->decodeJson($row['preferred_classes_json'], []), 'skillRequirements' => $this->decodeJson($row['skill_requirements_json'] ?? '', null), 'personalityRequirements' => $this->decodeJson($row['personality_requirements_json'] ?? '', null)], 'difficulty' => $row['difficulty'], 'status' => $row['status'], 'questType' => $row['quest_type'], 'campaignId' => $row['campaign_id'] ?: null, 'worldEvent' => $row['world_event_id'] ?: null, 'seasonalEvent' => $row['seasonal_event_id'] ?: null, 'experienceReward' => (int) $row['experience_reward'], 'skillRewards' => $this->decodeJson($row['skill_rewards_json'] ?? '', null), 'lootTable' => $this->fetchQuestLootItems((string) $row['id']), 'procedural' => (bool) $row['procedural'], 'durationMs' => (int) $row['duration_value'] * 1000];
    }

    private function mapActiveQuest(array $row): array
    {
        $quest = $this->findQuestDefinition((string) $row['quest_id']);
        $mapped = $quest ? $this->mapQuestDefinition($quest) : ['id' => $row['quest_id']];
        $mapped['status'] = $row['status'];
        $mapped['assignedAdventurers'] = $this->decodeJson($row['assigned_adventurers_json'], []);
        $mapped['startedAt'] = isset($row['started_at']) && $row['started_at'] ? strtotime((string) $row['started_at']) * 1000 : null;
        $mapped['expectedCompletionAt'] = isset($row['expected_completion_at']) && $row['expected_completion_at'] ? strtotime((string) $row['expected_completion_at']) * 1000 : null;
        $mapped['remainingMs'] = isset($mapped['expectedCompletionAt']) && $mapped['expectedCompletionAt'] !== null ? max(0, (int) $mapped['expectedCompletionAt'] - (time() * 1000)) : null;
        $mapped['canResolve'] = (($mapped['remainingMs'] ?? 0) <= 0);
        return $mapped;
    }

    private function decodeJson(?string $value, mixed $fallback): mixed
    {
        if ($value === null || $value === '') {
            return $fallback;
        }
        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $fallback;
    }

    private function isSeasonalEventAvailable(array $seasonalRow, string $currentSeason, int $guildLevel, int $reputation, array $completedQuestIds): bool
    {
        $season = (string) ($seasonalRow['season'] ?? '');
        if ($season !== $currentSeason && $season !== 'festival') {
            return false;
        }
        $unlockConditions = $this->decodeJson($seasonalRow['unlock_conditions_json'] ?? '', []);
        if (isset($unlockConditions['guildLevel']) && $guildLevel < (int) $unlockConditions['guildLevel']) {
            return false;
        }
        if (isset($unlockConditions['reputation']) && $reputation < (int) $unlockConditions['reputation']) {
            return false;
        }
        if (!empty($unlockConditions['completedQuests']) && is_array($unlockConditions['completedQuests'])) {
            foreach ($unlockConditions['completedQuests'] as $questId) {
                if (!in_array((string) $questId, $completedQuestIds, true)) {
                    return false;
                }
            }
        }
        return true;
    }

    private function getCurrentSeason(): string
    {
        $month = (int) date('n');
        if ($month >= 3 && $month <= 5) {
            return 'spring';
        }
        if ($month >= 6 && $month <= 8) {
            return 'summer';
        }
        if ($month >= 9 && $month <= 11) {
            return 'autumn';
        }
        return 'winter';
    }

    private function getFactionStanding(int $reputation): string
    {
        if ($reputation >= 1000) {
            return 'Exalted';
        }
        if ($reputation >= 600) {
            return 'Revered';
        }
        if ($reputation >= 300) {
            return 'Honored';
        }
        if ($reputation >= 100) {
            return 'Friendly';
        }
        if ($reputation >= 0) {
            return 'Neutral';
        }
        return 'Hostile';
    }

    private function calculateFacilityUpgradeCost(string $facilityId, int $currentLevel): int
    {
        $facility = $this->fetchOne(
            'SELECT base_cost, upgrade_cost_multiplier FROM ag_facility_definitions WHERE id = :id LIMIT 1',
            ['id' => $facilityId]
        );
        if (!$facility) {
            return 500;
        }

        $baseCost = (int) $facility['base_cost'];
        $multiplier = (float) $facility['upgrade_cost_multiplier'];

        return (int) floor($baseCost * (1 + max(0, $currentLevel - 1) * $multiplier));
    }

    private function calculateFacilityBenefits(string $facilityId, int $level): array
    {
        $rows = $this->fetchAll(
            'SELECT benefit_key, base_value, per_level_value FROM ag_facility_definition_benefits WHERE facility_id = :facility_id ORDER BY id ASC',
            ['facility_id' => $facilityId]
        );
        if ($rows === []) {
            return ['level' => $level];
        }

        $benefits = [];
        foreach ($rows as $row) {
            $benefits[(string) $row['benefit_key']] = (int) $row['base_value'] + (max(0, $level - 1) * (int) $row['per_level_value']);
        }

        return $benefits;
    }

    private function isRetirementEligibleRow(array $row): bool
    {
        if (!empty($row['retirement_eligible'])) {
            return true;
        }

        $yearsInGuild = (int) ($row['years_in_guild'] ?? 0);
        $level = (int) ($row['level'] ?? 0);
        $questsCompleted = (int) ($row['quests_completed'] ?? 0);
        $status = (string) ($row['status'] ?? '');

        return $yearsInGuild >= 8
            || ($level >= 10 && $questsCompleted >= 50)
            || ($level >= 6 && $questsCompleted >= 25)
            || $status === 'injured';
    }

    private function resolveRetirementRoleDefinition(array $adventurer, ?string $requestedRole): array
    {
        $roleDefinitions = $this->getRetirementRoleDefinitions();
        $eligible = array_values(array_filter(
            $roleDefinitions,
            fn(array $definition): bool => $this->meetsRetirementRequirements($adventurer, $definition['requirements'])
        ));

        if ($requestedRole !== null && $requestedRole !== '') {
            foreach ($eligible as $definition) {
                if ($definition['role'] === $requestedRole) {
                    return $definition;
                }
            }
            throw new \RuntimeException('Requested retirement role is not available');
        }

        if ($eligible === []) {
            return $roleDefinitions['advisor'];
        }

        usort($eligible, fn(array $left, array $right): int => $this->calculateRetirementRoleFitness($adventurer, $right) <=> $this->calculateRetirementRoleFitness($adventurer, $left));
        return $eligible[0];
    }

    private function getRetirementRoleDefinitions(): array
    {
        return [
            'trainer' => [
                'role' => 'trainer',
                'label' => 'Guild Trainer',
                'requirements' => [
                    'minLevel' => 5,
                    'minQuestsCompleted' => 20,
                    'specificSkills' => [
                        ['skill' => 'combat.weaponMastery', 'minValue' => 20],
                        ['skill' => 'magic.spellPower', 'minValue' => 15],
                    ],
                ],
                'benefits' => ['trainingBonus' => 25],
            ],
            'advisor' => [
                'role' => 'advisor',
                'label' => 'Strategic Advisor',
                'requirements' => [
                    'minLevel' => 6,
                    'minQuestsCompleted' => 30,
                    'specificSkills' => [
                        ['skill' => 'combat.tacticalKnowledge', 'minValue' => 20],
                    ],
                    'personality' => [
                        ['trait' => 'loyalty', 'minValue' => 70],
                        ['trait' => 'ambition', 'minValue' => 60],
                    ],
                ],
                'benefits' => ['questAdvice' => true],
            ],
            'recruiter' => [
                'role' => 'recruiter',
                'label' => 'Talent Scout',
                'requirements' => [
                    'minLevel' => 4,
                    'minQuestsCompleted' => 25,
                    'personality' => [
                        ['trait' => 'teamwork', 'minValue' => 60],
                    ],
                ],
                'benefits' => ['recruitCostReduction' => 30],
            ],
            'quartermaster' => [
                'role' => 'quartermaster',
                'label' => 'Guild Quartermaster',
                'requirements' => [
                    'minLevel' => 5,
                    'minQuestsCompleted' => 15,
                    'personality' => [
                        ['trait' => 'loyalty', 'minValue' => 80],
                        ['trait' => 'greed', 'minValue' => 30],
                    ],
                ],
                'benefits' => ['questAdvice' => true],
            ],
        ];
    }

    private function meetsRetirementRequirements(array $adventurer, array $requirements): bool
    {
        if (isset($requirements['minLevel']) && (int) $adventurer['level'] < (int) $requirements['minLevel']) {
            return false;
        }
        if (isset($requirements['minQuestsCompleted']) && (int) $adventurer['questsCompleted'] < (int) $requirements['minQuestsCompleted']) {
            return false;
        }

        foreach ($requirements['specificSkills'] ?? [] as $skillRequirement) {
            if ($this->getNestedSkillValue($adventurer['skills'] ?? [], (string) $skillRequirement['skill']) < (int) $skillRequirement['minValue']) {
                return false;
            }
        }

        foreach ($requirements['personality'] ?? [] as $personalityRequirement) {
            $traitKey = (string) $personalityRequirement['trait'];
            if ((int) (($adventurer['personality'][$traitKey] ?? 0)) < (int) $personalityRequirement['minValue']) {
                return false;
            }
        }

        return true;
    }

    private function calculateRetirementRoleFitness(array $adventurer, array $roleDefinition): int
    {
        $score = ((int) $adventurer['level'] * 2) + (int) $adventurer['questsCompleted'];

        foreach ($roleDefinition['requirements']['specificSkills'] ?? [] as $skillRequirement) {
            $score += max(0, $this->getNestedSkillValue($adventurer['skills'] ?? [], (string) $skillRequirement['skill']) - (int) $skillRequirement['minValue']);
        }
        foreach ($roleDefinition['requirements']['personality'] ?? [] as $personalityRequirement) {
            $traitKey = (string) $personalityRequirement['trait'];
            $score += max(0, (int) (($adventurer['personality'][$traitKey] ?? 0)) - (int) $personalityRequirement['minValue']);
        }

        return $score;
    }

    private function getNestedSkillValue(array $skills, string $skillPath): int
    {
        $parts = explode('.', $skillPath, 2);
        if (count($parts) !== 2) {
            return 0;
        }

        [$category, $skill] = $parts;
        $categoryValues = $skills[$category] ?? null;
        if (!is_array($categoryValues)) {
            return 0;
        }

        return (int) ($categoryValues[$skill] ?? 0);
    }

    private function persistRetiredAdventurerSnapshot(int $retiredAdventurerId, array $adventurerPayload, array $benefits): void
    {
        $insertTrait = $this->db->prepare('INSERT INTO ag_retired_adventurer_personality_traits (retired_adventurer_id, trait_key, trait_value) VALUES (:retired_adventurer_id, :trait_key, :trait_value)');
        foreach (($adventurerPayload['personality'] ?? []) as $traitKey => $traitValue) {
            $insertTrait->execute([
                'retired_adventurer_id' => $retiredAdventurerId,
                'trait_key' => (string) $traitKey,
                'trait_value' => (int) $traitValue,
            ]);
        }

        $insertSkill = $this->db->prepare('INSERT INTO ag_retired_adventurer_skills (retired_adventurer_id, skill_category, skill_key, skill_value) VALUES (:retired_adventurer_id, :skill_category, :skill_key, :skill_value)');
        foreach (($adventurerPayload['skills'] ?? []) as $category => $skillValues) {
            if (!is_array($skillValues)) {
                continue;
            }
            foreach ($skillValues as $skillKey => $skillValue) {
                $insertSkill->execute([
                    'retired_adventurer_id' => $retiredAdventurerId,
                    'skill_category' => (string) $category,
                    'skill_key' => (string) $skillKey,
                    'skill_value' => (int) $skillValue,
                ]);
            }
        }

        $insertRelationship = $this->db->prepare('INSERT INTO ag_retired_adventurer_relationships (retired_adventurer_id, target_external_id, relationship_type, strength) VALUES (:retired_adventurer_id, :target_external_id, :relationship_type, :strength)');
        $insertRelationshipHistory = $this->db->prepare('INSERT INTO ag_retired_adventurer_relationship_history (relationship_id, history_entry, sort_order) VALUES (:relationship_id, :history_entry, :sort_order)');
        foreach (($adventurerPayload['relationships'] ?? []) as $relationship) {
            $insertRelationship->execute([
                'retired_adventurer_id' => $retiredAdventurerId,
                'target_external_id' => (string) ($relationship['targetId'] ?? ''),
                'relationship_type' => (string) ($relationship['type'] ?? 'friendship'),
                'strength' => (int) ($relationship['strength'] ?? 0),
            ]);
            $relationshipId = (int) $this->db->lastInsertId();
            foreach (($relationship['history'] ?? []) as $index => $historyEntry) {
                $insertRelationshipHistory->execute([
                    'relationship_id' => $relationshipId,
                    'history_entry' => (string) $historyEntry,
                    'sort_order' => $index + 1,
                ]);
            }
        }

        $insertEquipment = $this->db->prepare('INSERT INTO ag_retired_adventurer_equipment (retired_adventurer_id, slot_type, equipment_definition_id, name, type, rarity, crafted, source_type, source_ref) VALUES (:retired_adventurer_id, :slot_type, :equipment_definition_id, :name, :type, :rarity, :crafted, :source_type, :source_ref)');
        $insertEquipmentStat = $this->db->prepare('INSERT INTO ag_retired_adventurer_equipment_stats (retired_equipment_id, stat_key, stat_value) VALUES (:retired_equipment_id, :stat_key, :stat_value)');
        $insertEquipmentMaterial = $this->db->prepare('INSERT INTO ag_retired_adventurer_equipment_materials (retired_equipment_id, material_id) VALUES (:retired_equipment_id, :material_id)');
        foreach (($adventurerPayload['equipment'] ?? []) as $slotType => $equipmentItem) {
            $insertEquipment->execute([
                'retired_adventurer_id' => $retiredAdventurerId,
                'slot_type' => (string) $slotType,
                'equipment_definition_id' => $equipmentItem['id'] ?? null,
                'name' => (string) ($equipmentItem['name'] ?? 'Unknown Equipment'),
                'type' => (string) ($equipmentItem['type'] ?? $slotType),
                'rarity' => (string) ($equipmentItem['rarity'] ?? 'common'),
                'crafted' => !empty($equipmentItem['crafted']) ? 1 : 0,
                'source_type' => isset($equipmentItem['sourceType']) ? (string) $equipmentItem['sourceType'] : null,
                'source_ref' => isset($equipmentItem['sourceRef']) ? (string) $equipmentItem['sourceRef'] : null,
            ]);
            $retiredEquipmentId = (int) $this->db->lastInsertId();
            foreach (($equipmentItem['stats'] ?? []) as $statKey => $statValue) {
                $insertEquipmentStat->execute([
                    'retired_equipment_id' => $retiredEquipmentId,
                    'stat_key' => (string) $statKey,
                    'stat_value' => (int) $statValue,
                ]);
            }
            foreach (($equipmentItem['materials'] ?? []) as $materialId) {
                $insertEquipmentMaterial->execute([
                    'retired_equipment_id' => $retiredEquipmentId,
                    'material_id' => (string) $materialId,
                ]);
            }
        }

        $insertBenefit = $this->db->prepare('INSERT INTO ag_retired_adventurer_benefits (retired_adventurer_id, benefit_key, benefit_value_decimal, benefit_value_bool) VALUES (:retired_adventurer_id, :benefit_key, :benefit_value_decimal, :benefit_value_bool)');
        foreach ($benefits as $benefitKey => $benefitValue) {
            $insertBenefit->execute([
                'retired_adventurer_id' => $retiredAdventurerId,
                'benefit_key' => (string) $benefitKey,
                'benefit_value_decimal' => is_bool($benefitValue) ? null : (float) $benefitValue,
                'benefit_value_bool' => is_bool($benefitValue) ? ($benefitValue ? 1 : 0) : null,
            ]);
        }
    }

    private function unlockRecipesForFacilityLevel(int $userId, int $facilityLevel): void
    {
        $recipes = $this->fetchAll(
            'SELECT id FROM ag_crafting_recipe_definitions WHERE required_facility_level <= :facility_level',
            ['facility_level' => $facilityLevel]
        );

        $insert = $this->db->prepare('INSERT IGNORE INTO ag_recipe_unlocks (user_id, recipe_id) VALUES (:user_id, :recipe_id)');
        foreach ($recipes as $recipe) {
            $insert->execute([
                'user_id' => $userId,
                'recipe_id' => $recipe['id'],
            ]);
        }
    }

    private function replaceFacilityBenefits(int $facilityRowId, array $benefits): void
    {
        $this->db->prepare('DELETE FROM ag_facility_benefits WHERE facility_row_id = :facility_row_id')->execute([
            'facility_row_id' => $facilityRowId,
        ]);

        $insert = $this->db->prepare('INSERT INTO ag_facility_benefits (facility_row_id, benefit_key, benefit_value) VALUES (:facility_row_id, :benefit_key, :benefit_value)');
        foreach ($benefits as $benefitKey => $benefitValue) {
            $insert->execute([
                'facility_row_id' => $facilityRowId,
                'benefit_key' => (string) $benefitKey,
                'benefit_value' => (int) $benefitValue,
            ]);
        }
    }

    private function fetchFacilityBenefitsByRowIds(array $facilityRowIds): array
    {
        if ($facilityRowIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($facilityRowIds), '?'));
        $rows = $this->fetchAll("SELECT facility_row_id, benefit_key, benefit_value FROM ag_facility_benefits WHERE facility_row_id IN ({$placeholders})", $facilityRowIds);
        $map = [];
        foreach ($rows as $row) {
            $rowId = (int) $row['facility_row_id'];
            $map[$rowId] ??= [];
            $map[$rowId][(string) $row['benefit_key']] = (int) $row['benefit_value'];
        }
        return $map;
    }

    private function fetchTerritoryBenefitsByRowIds(array $territoryRowIds): array
    {
        if ($territoryRowIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($territoryRowIds), '?'));
        $rows = $this->fetchAll(
            "SELECT t.id AS territory_row_id, b.benefit_key, b.benefit_value_decimal, b.benefit_value_bool, b.benefit_value_text
             FROM ag_territories t
             INNER JOIN ag_territory_definition_benefits b ON b.territory_id = t.territory_id
             WHERE t.id IN ({$placeholders})
             ORDER BY t.id ASC, b.sort_order ASC, b.id ASC",
            $territoryRowIds
        );

        $map = [];
        foreach ($rows as $row) {
            $rowId = (int) $row['territory_row_id'];
            $benefitKey = (string) $row['benefit_key'];
            $map[$rowId] ??= [];

            if ($benefitKey === 'questAccess') {
                $map[$rowId]['questAccess'] ??= [];
                if ($row['benefit_value_text'] !== null && $row['benefit_value_text'] !== '') {
                    $map[$rowId]['questAccess'][] = (string) $row['benefit_value_text'];
                }
                continue;
            }

            if ($row['benefit_value_bool'] !== null) {
                $map[$rowId][$benefitKey] = (bool) $row['benefit_value_bool'];
                continue;
            }

            if ($row['benefit_value_decimal'] !== null) {
                $value = (float) $row['benefit_value_decimal'];
                $map[$rowId][$benefitKey] = floor($value) === $value ? (int) $value : $value;
                continue;
            }

            if ($row['benefit_value_text'] !== null) {
                $map[$rowId][$benefitKey] = (string) $row['benefit_value_text'];
            }
        }

        return $map;
    }

    private function fetchFactionQuestTypesByFactionIds(array $factionIds): array
    {
        if ($factionIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($factionIds), '?'));
        $rows = $this->fetchAll("SELECT faction_id, quest_type FROM ag_faction_definition_quest_types WHERE faction_id IN ({$placeholders}) ORDER BY id ASC", $factionIds);
        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row['faction_id']][] = (string) $row['quest_type'];
        }
        return $map;
    }

    private function fetchWorldEventSpecialQuestsByEventIds(array $eventIds): array
    {
        if ($eventIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($eventIds), '?'));
        $rows = $this->fetchAll("SELECT event_id, quest_id FROM ag_world_event_special_quests WHERE event_id IN ({$placeholders}) ORDER BY id ASC", $eventIds);
        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row['event_id']][] = (string) $row['quest_id'];
        }
        return $map;
    }

    private function fetchQuestLootItems(string $questId): array
    {
        $rows = $this->fetchAll(
            'SELECT equipment_definition_id, quantity FROM ag_quest_definition_loot WHERE quest_id = :quest_id ORDER BY sort_order ASC, id ASC',
            ['quest_id' => $questId]
        );
        if ($rows === []) {
            return [];
        }

        $definitionMap = $this->fetchEquipmentDefinitionsByIds(array_map(fn(array $row): string => (string) $row['equipment_definition_id'], $rows));
        $items = [];
        foreach ($rows as $row) {
            $definitionId = (string) $row['equipment_definition_id'];
            if (!isset($definitionMap[$definitionId])) {
                continue;
            }
            $item = $definitionMap[$definitionId];
            $item['quantity'] = (int) $row['quantity'];
            $items[] = $item;
        }
        return $items;
    }

    private function createInventoryItemFromDefinition(int $userId, array $definition, string $sourceType, string $sourceRef): void
    {
        $itemExternalId = 'item_' . time() . '_' . bin2hex(random_bytes(4));
        $this->db->prepare(
            'INSERT INTO ag_equipment_inventory (user_id, item_external_id, equipment_definition_id, name, type, rarity, crafted, source_type, source_ref, equipped_by_external_id)
             VALUES (:user_id, :item_external_id, :equipment_definition_id, :name, :type, :rarity, :crafted, :source_type, :source_ref, NULL)'
        )->execute([
            'user_id' => $userId,
            'item_external_id' => $itemExternalId,
            'equipment_definition_id' => $definition['id'] ?? null,
            'name' => (string) ($definition['name'] ?? 'Unknown Item'),
            'type' => (string) ($definition['type'] ?? 'weapon'),
            'rarity' => (string) ($definition['rarity'] ?? 'common'),
            'crafted' => !empty($definition['crafted']) ? 1 : 0,
            'source_type' => $sourceType,
            'source_ref' => $sourceRef,
        ]);
        $inventoryId = (int) $this->db->lastInsertId();

        $insertInventoryStat = $this->db->prepare('INSERT INTO ag_equipment_inventory_stats (inventory_item_id, stat_key, stat_value) VALUES (:inventory_item_id, :stat_key, :stat_value)');
        foreach (($definition['stats'] ?? []) as $statKey => $statValue) {
            $insertInventoryStat->execute([
                'inventory_item_id' => $inventoryId,
                'stat_key' => (string) $statKey,
                'stat_value' => (int) $statValue,
            ]);
        }

        $insertInventoryMaterial = $this->db->prepare('INSERT INTO ag_equipment_inventory_materials (inventory_item_id, material_id) VALUES (:inventory_item_id, :material_id)');
        foreach (($definition['materials'] ?? []) as $materialId) {
            $insertInventoryMaterial->execute([
                'inventory_item_id' => $inventoryId,
                'material_id' => (string) $materialId,
            ]);
        }
    }

    private function fetchEquippedItemsByAdventurerIds(int $userId, array $adventurerIds): array
    {
        if ($adventurerIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($adventurerIds), '?'));
        $params = array_merge([$userId], $adventurerIds);
        $rows = $this->fetchAll(
            "SELECT aes.adventurer_external_id, aes.slot_type, inv.id AS inventory_id, inv.item_external_id, inv.name, inv.type, inv.rarity, inv.crafted, inv.source_type, inv.source_ref
             FROM ag_adventurer_equipment_slots aes
             INNER JOIN ag_equipment_inventory inv ON inv.id = aes.inventory_item_id
             WHERE aes.user_id = ? AND aes.adventurer_external_id IN ({$placeholders})",
            $params
        );
        $inventoryIds = array_map(fn(array $row): int => (int) $row['inventory_id'], $rows);
        $statsMap = $this->fetchInventoryStatsByInventoryIds($inventoryIds);
        $materialsMap = $this->fetchInventoryMaterialsByInventoryIds($inventoryIds);

        $map = [];
        foreach ($rows as $row) {
            $adventurerId = (string) $row['adventurer_external_id'];
            $slotType = (string) $row['slot_type'];
            $map[$adventurerId][$slotType] = [
                'id' => (string) $row['item_external_id'],
                'name' => (string) $row['name'],
                'type' => (string) $row['type'],
                'rarity' => (string) $row['rarity'],
                'stats' => $statsMap[(int) $row['inventory_id']] ?? [],
                'crafted' => (bool) $row['crafted'],
                'materials' => $materialsMap[(int) $row['inventory_id']] ?? [],
                'sourceType' => (string) $row['source_type'],
                'sourceRef' => $row['source_ref'] ?: null,
                'equippedBy' => $adventurerId,
            ];
        }

        return $map;
    }

    private function fetchRetiredAdventurerPayloadsByRowIds(array $retiredAdventurerRowIds): array
    {
        if ($retiredAdventurerRowIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($retiredAdventurerRowIds), '?'));

        $traitRows = $this->fetchAll(
            "SELECT retired_adventurer_id, trait_key, trait_value
             FROM ag_retired_adventurer_personality_traits
             WHERE retired_adventurer_id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );
        $skillRows = $this->fetchAll(
            "SELECT retired_adventurer_id, skill_category, skill_key, skill_value
             FROM ag_retired_adventurer_skills
             WHERE retired_adventurer_id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );
        $relationshipRows = $this->fetchAll(
            "SELECT id, retired_adventurer_id, target_external_id, relationship_type, strength
             FROM ag_retired_adventurer_relationships
             WHERE retired_adventurer_id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );
        $equipmentRows = $this->fetchAll(
            "SELECT id, retired_adventurer_id, slot_type, equipment_definition_id, name, type, rarity, crafted, source_type, source_ref
             FROM ag_retired_adventurer_equipment
             WHERE retired_adventurer_id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );
        $benefitRows = $this->fetchAll(
            "SELECT retired_adventurer_id, benefit_key, benefit_value_decimal, benefit_value_bool
             FROM ag_retired_adventurer_benefits
             WHERE retired_adventurer_id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );

        $relationshipIds = array_map(fn(array $row): int => (int) $row['id'], $relationshipRows);
        $relationshipHistoryById = $this->fetchRetiredRelationshipHistoryByIds($relationshipIds);

        $retiredEquipmentIds = array_map(fn(array $row): int => (int) $row['id'], $equipmentRows);
        $equipmentStatsById = $this->fetchRetiredEquipmentStatsByIds($retiredEquipmentIds);
        $equipmentMaterialsById = $this->fetchRetiredEquipmentMaterialsByIds($retiredEquipmentIds);

        $traitsByRetiredId = [];
        foreach ($traitRows as $row) {
            $traitsByRetiredId[(int) $row['retired_adventurer_id']][(string) $row['trait_key']] = (int) $row['trait_value'];
        }

        $skillsByRetiredId = [];
        foreach ($skillRows as $row) {
            $retiredId = (int) $row['retired_adventurer_id'];
            $skillsByRetiredId[$retiredId] ??= [
                'combat' => ['weaponMastery' => 0, 'tacticalKnowledge' => 0, 'battleRage' => 0],
                'magic' => ['spellPower' => 0, 'manaEfficiency' => 0, 'elementalMastery' => 0],
                'stealth' => ['lockpicking' => 0, 'sneaking' => 0, 'assassination' => 0],
                'survival' => ['tracking' => 0, 'herbalism' => 0, 'animalHandling' => 0],
            ];
            $skillsByRetiredId[$retiredId][(string) $row['skill_category']][(string) $row['skill_key']] = (int) $row['skill_value'];
        }

        $relationshipsByRetiredId = [];
        foreach ($relationshipRows as $row) {
            $relationshipId = (int) $row['id'];
            $relationshipsByRetiredId[(int) $row['retired_adventurer_id']][] = [
                'targetId' => (string) $row['target_external_id'],
                'type' => (string) $row['relationship_type'],
                'strength' => (int) $row['strength'],
                'history' => $relationshipHistoryById[$relationshipId] ?? [],
            ];
        }

        $equipmentByRetiredId = [];
        foreach ($equipmentRows as $row) {
            $equipmentByRetiredId[(int) $row['retired_adventurer_id']][(string) $row['slot_type']] = [
                'id' => (string) ($row['equipment_definition_id'] ?: $row['name']),
                'name' => (string) $row['name'],
                'type' => (string) $row['type'],
                'rarity' => (string) $row['rarity'],
                'stats' => $equipmentStatsById[(int) $row['id']] ?? [],
                'crafted' => (bool) $row['crafted'],
                'materials' => $equipmentMaterialsById[(int) $row['id']] ?? [],
                'sourceType' => $row['source_type'] ?: null,
                'sourceRef' => $row['source_ref'] ?: null,
                'equippedBy' => null,
            ];
        }

        $benefitsByRetiredId = [];
        foreach ($benefitRows as $row) {
            $retiredId = (int) $row['retired_adventurer_id'];
            if ($row['benefit_value_bool'] !== null) {
                $benefitsByRetiredId[$retiredId][(string) $row['benefit_key']] = (bool) $row['benefit_value_bool'];
                continue;
            }
            if ($row['benefit_value_decimal'] !== null) {
                $value = (float) $row['benefit_value_decimal'];
                $benefitsByRetiredId[$retiredId][(string) $row['benefit_key']] = floor($value) === $value ? (int) $value : $value;
            }
        }

        $retiredRows = $this->fetchAll(
            "SELECT id, external_id, name, class, rank_name, level, experience, status, strength, intelligence, dexterity, vitality, quests_completed, years_in_guild, retirement_eligible, descendant_of_external_id
             FROM ag_retired_adventurers
             WHERE id IN ({$placeholders})",
            $retiredAdventurerRowIds
        );

        $payloads = [];
        foreach ($retiredRows as $row) {
            $retiredId = (int) $row['id'];
            $payloads[$retiredId] = [
                'originalAdventurer' => [
                    'id' => (string) $row['external_id'],
                    'name' => (string) $row['name'],
                    'class' => (string) $row['class'],
                    'rank' => (string) $row['rank_name'],
                    'level' => (int) $row['level'],
                    'experience' => (int) $row['experience'],
                    'status' => (string) $row['status'],
                    'stats' => [
                        'strength' => (int) $row['strength'],
                        'intelligence' => (int) $row['intelligence'],
                        'dexterity' => (int) $row['dexterity'],
                        'vitality' => (int) $row['vitality'],
                    ],
                    'personality' => $traitsByRetiredId[$retiredId] ?? [],
                    'skills' => $skillsByRetiredId[$retiredId] ?? [
                        'combat' => ['weaponMastery' => 0, 'tacticalKnowledge' => 0, 'battleRage' => 0],
                        'magic' => ['spellPower' => 0, 'manaEfficiency' => 0, 'elementalMastery' => 0],
                        'stealth' => ['lockpicking' => 0, 'sneaking' => 0, 'assassination' => 0],
                        'survival' => ['tracking' => 0, 'herbalism' => 0, 'animalHandling' => 0],
                    ],
                    'equipment' => $equipmentByRetiredId[$retiredId] ?? [],
                    'relationships' => $relationshipsByRetiredId[$retiredId] ?? [],
                    'questsCompleted' => (int) $row['quests_completed'],
                    'yearsInGuild' => (int) $row['years_in_guild'],
                    'retirementEligible' => (bool) $row['retirement_eligible'],
                    'descendantOf' => $row['descendant_of_external_id'] ?: null,
                ],
                'benefits' => $benefitsByRetiredId[$retiredId] ?? [],
            ];
        }

        return $payloads;
    }

    private function fetchRetiredRelationshipHistoryByIds(array $relationshipIds): array
    {
        if ($relationshipIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($relationshipIds), '?'));
        $rows = $this->fetchAll(
            "SELECT relationship_id, history_entry
             FROM ag_retired_adventurer_relationship_history
             WHERE relationship_id IN ({$placeholders})
             ORDER BY sort_order ASC, id ASC",
            $relationshipIds
        );

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['relationship_id']][] = (string) $row['history_entry'];
        }

        return $map;
    }

    private function fetchRetiredEquipmentStatsByIds(array $retiredEquipmentIds): array
    {
        if ($retiredEquipmentIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($retiredEquipmentIds), '?'));
        $rows = $this->fetchAll(
            "SELECT retired_equipment_id, stat_key, stat_value
             FROM ag_retired_adventurer_equipment_stats
             WHERE retired_equipment_id IN ({$placeholders})",
            $retiredEquipmentIds
        );

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['retired_equipment_id']][(string) $row['stat_key']] = (int) $row['stat_value'];
        }

        return $map;
    }

    private function fetchRetiredEquipmentMaterialsByIds(array $retiredEquipmentIds): array
    {
        if ($retiredEquipmentIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($retiredEquipmentIds), '?'));
        $rows = $this->fetchAll(
            "SELECT retired_equipment_id, material_id
             FROM ag_retired_adventurer_equipment_materials
             WHERE retired_equipment_id IN ({$placeholders})",
            $retiredEquipmentIds
        );

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['retired_equipment_id']][] = (string) $row['material_id'];
        }

        return $map;
    }

    private function fetchRecipeMaterialsByRecipeIds(array $recipeIds): array
    {
        if ($recipeIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($recipeIds), '?'));
        $rows = $this->fetchAll(
            "SELECT recipe_id, material_id, quantity FROM ag_crafting_recipe_materials WHERE recipe_id IN ({$placeholders}) ORDER BY id ASC",
            $recipeIds
        );

        $map = [];
        foreach ($rows as $row) {
            $recipeId = (string) $row['recipe_id'];
            $map[$recipeId] ??= [];
            $map[$recipeId][(string) $row['material_id']] = (int) $row['quantity'];
        }

        return $map;
    }

    private function fetchEquipmentDefinitionsByIds(array $definitionIds): array
    {
        if ($definitionIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($definitionIds), '?'));
        $definitions = $this->fetchAll(
            "SELECT id, name, type, rarity, crafted_default FROM ag_equipment_definitions WHERE id IN ({$placeholders})",
            $definitionIds
        );
        $statsRows = $this->fetchAll(
            "SELECT equipment_definition_id, stat_key, stat_value FROM ag_equipment_definition_stats WHERE equipment_definition_id IN ({$placeholders}) ORDER BY id ASC",
            $definitionIds
        );
        $materialRows = $this->fetchAll(
            "SELECT equipment_definition_id, material_id FROM ag_equipment_definition_materials WHERE equipment_definition_id IN ({$placeholders}) ORDER BY id ASC",
            $definitionIds
        );

        $statsMap = [];
        foreach ($statsRows as $row) {
            $definitionId = (string) $row['equipment_definition_id'];
            $statsMap[$definitionId] ??= [];
            $statsMap[$definitionId][(string) $row['stat_key']] = (int) $row['stat_value'];
        }

        $materialsMap = [];
        foreach ($materialRows as $row) {
            $definitionId = (string) $row['equipment_definition_id'];
            $materialsMap[$definitionId] ??= [];
            $materialsMap[$definitionId][] = (string) $row['material_id'];
        }

        $definitionMap = [];
        foreach ($definitions as $definition) {
            $definitionId = (string) $definition['id'];
            $definitionMap[$definitionId] = [
                'id' => $definitionId,
                'name' => (string) $definition['name'],
                'type' => (string) $definition['type'],
                'rarity' => (string) $definition['rarity'],
                'stats' => $statsMap[$definitionId] ?? [],
                'crafted' => (bool) $definition['crafted_default'],
                'materials' => $materialsMap[$definitionId] ?? [],
            ];
        }

        return $definitionMap;
    }

    private function fetchInventoryStatsByInventoryIds(array $inventoryIds): array
    {
        if ($inventoryIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($inventoryIds), '?'));
        $rows = $this->fetchAll(
            "SELECT inventory_item_id, stat_key, stat_value FROM ag_equipment_inventory_stats WHERE inventory_item_id IN ({$placeholders}) ORDER BY id ASC",
            $inventoryIds
        );

        $map = [];
        foreach ($rows as $row) {
            $inventoryId = (int) $row['inventory_item_id'];
            $map[$inventoryId] ??= [];
            $map[$inventoryId][(string) $row['stat_key']] = (int) $row['stat_value'];
        }

        return $map;
    }

    private function fetchInventoryMaterialsByInventoryIds(array $inventoryIds): array
    {
        if ($inventoryIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($inventoryIds), '?'));
        $rows = $this->fetchAll(
            "SELECT inventory_item_id, material_id FROM ag_equipment_inventory_materials WHERE inventory_item_id IN ({$placeholders}) ORDER BY id ASC",
            $inventoryIds
        );

        $map = [];
        foreach ($rows as $row) {
            $inventoryId = (int) $row['inventory_item_id'];
            $map[$inventoryId] ??= [];
            $map[$inventoryId][] = (string) $row['material_id'];
        }

        return $map;
    }
}

