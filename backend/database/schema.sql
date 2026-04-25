-- Adventurer Guild Database Schema
-- Run against MySQL 8.0+ or MariaDB 10.6+
-- This schema focuses on SQL-first persistence for both live player state and seeded game content.

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `auth_user_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `username` VARCHAR(120) NOT NULL DEFAULT '',
    `display_name` VARCHAR(191) NOT NULL DEFAULT '',
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `auth_type` VARCHAR(20) NOT NULL DEFAULT 'frontpage',
    `is_guest` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_seen_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_auth_user_id` (`auth_user_id`),
    KEY `idx_users_role` (`role`),
    KEY `idx_users_guest` (`is_guest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_guild_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `guild_name` VARCHAR(191) NOT NULL DEFAULT 'Adventurer Guild',
    `gold` INT UNSIGNED NOT NULL DEFAULT 1000,
    `reputation` INT NOT NULL DEFAULT 0,
    `guild_level` INT UNSIGNED NOT NULL DEFAULT 1,
    `current_season` VARCHAR(20) NOT NULL DEFAULT 'spring',
    `generation` INT UNSIGNED NOT NULL DEFAULT 1,
    `legacy_bonuses_json` JSON NOT NULL,
    `last_save_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_guild_profiles_user_id` (`user_id`),
    CONSTRAINT `fk_ag_guild_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_save_slots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `slot_number` TINYINT UNSIGNED NOT NULL,
    `slot_name` VARCHAR(191) NOT NULL DEFAULT 'Primary Save',
    `guild_profile_id` BIGINT UNSIGNED DEFAULT NULL,
    `snapshot_json` JSON NOT NULL,
    `metadata_json` JSON DEFAULT NULL,
    `version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_save_slots_user_slot` (`user_id`, `slot_number`),
    KEY `idx_ag_save_slots_profile` (`guild_profile_id`),
    CONSTRAINT `fk_ag_save_slots_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ag_save_slots_profile` FOREIGN KEY (`guild_profile_id`) REFERENCES `ag_guild_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_activity_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `event_type` VARCHAR(60) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `metadata_json` JSON DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_activity_log_user_created` (`user_id`, `created_at`),
    CONSTRAINT `fk_ag_activity_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_runs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `run_type` VARCHAR(50) NOT NULL DEFAULT 'guild_cycle',
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` DATETIME DEFAULT NULL,
    `summary_json` JSON DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ag_runs_user_status` (`user_id`, `status`),
    CONSTRAINT `fk_ag_runs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_adventurers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `external_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(50) NOT NULL,
    `rank_name` VARCHAR(50) NOT NULL,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `experience` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'available',
    `strength` INT NOT NULL DEFAULT 0,
    `intelligence` INT NOT NULL DEFAULT 0,
    `dexterity` INT NOT NULL DEFAULT 0,
    `vitality` INT NOT NULL DEFAULT 0,
    `personality_json` JSON NOT NULL,
    `skills_json` JSON NOT NULL,
    `relationships_json` JSON NOT NULL,
    `quests_completed` INT UNSIGNED NOT NULL DEFAULT 0,
    `years_in_guild` INT UNSIGNED NOT NULL DEFAULT 0,
    `retirement_eligible` TINYINT(1) NOT NULL DEFAULT 0,
    `descendant_of_external_id` VARCHAR(191) DEFAULT NULL,
    `is_retired` TINYINT(1) NOT NULL DEFAULT 0,
    `retired_role` VARCHAR(50) DEFAULT NULL,
    `retired_at` DATETIME DEFAULT NULL,
    `raw_payload_json` JSON DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_adventurers_user_external` (`user_id`, `external_id`),
    KEY `idx_ag_adventurers_status` (`user_id`, `status`),
    CONSTRAINT `fk_ag_adventurers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_recruits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `external_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(50) NOT NULL,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `personality_json` JSON NOT NULL,
    `potential_skills_json` JSON NOT NULL,
    `descendant_of_external_id` VARCHAR(191) DEFAULT NULL,
    `raw_payload_json` JSON DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_recruits_user_external` (`user_id`, `external_id`),
    CONSTRAINT `fk_ag_recruits_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_active_quests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quest_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `assigned_adventurers_json` JSON NOT NULL,
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expected_completion_at` DATETIME DEFAULT NULL,
    `raw_payload_json` JSON DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_active_quests_user_quest` (`user_id`, `quest_id`),
    KEY `idx_ag_active_quests_status` (`user_id`, `status`),
    CONSTRAINT `fk_ag_active_quests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_completed_quests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quest_id` VARCHAR(191) NOT NULL,
    `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_completed_quests_user_quest` (`user_id`, `quest_id`),
    CONSTRAINT `fk_ag_completed_quests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_campaign_progress` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `campaign_id` VARCHAR(191) NOT NULL,
    `current_quest_index` INT UNSIGNED NOT NULL DEFAULT 0,
    `completed` TINYINT(1) NOT NULL DEFAULT 0,
    `raw_payload_json` JSON DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_campaign_progress_user_campaign` (`user_id`, `campaign_id`),
    CONSTRAINT `fk_ag_campaign_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_world_event_progress` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 0,
    `started_at` DATETIME DEFAULT NULL,
    `ends_at` DATETIME DEFAULT NULL,
    `raw_payload_json` JSON DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_world_event_progress_user_event` (`user_id`, `event_id`),
    CONSTRAINT `fk_ag_world_event_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_faction_reputations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `faction_id` VARCHAR(191) NOT NULL,
    `reputation` INT NOT NULL DEFAULT 0,
    `standing_label` VARCHAR(50) NOT NULL DEFAULT 'Neutral',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_faction_reputations_user_faction` (`user_id`, `faction_id`),
    CONSTRAINT `fk_ag_faction_reputations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_facilities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `facility_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `max_level` INT UNSIGNED NOT NULL DEFAULT 1,
    `cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `description` TEXT DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_facilities_user_facility` (`user_id`, `facility_id`),
    CONSTRAINT `fk_ag_facilities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_facility_benefits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `facility_row_id` BIGINT UNSIGNED NOT NULL,
    `benefit_key` VARCHAR(100) NOT NULL,
    `benefit_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_facility_benefits_row_key` (`facility_row_id`, `benefit_key`),
    CONSTRAINT `fk_ag_facility_benefits_row` FOREIGN KEY (`facility_row_id`) REFERENCES `ag_facilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_facility_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `base_cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `max_level` INT UNSIGNED NOT NULL DEFAULT 1,
    `upgrade_cost_multiplier` DECIMAL(6,2) NOT NULL DEFAULT 0.75,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_facility_definition_benefits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `facility_id` VARCHAR(191) NOT NULL,
    `benefit_key` VARCHAR(100) NOT NULL,
    `base_value` INT NOT NULL,
    `per_level_value` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_facility_definition_benefit` (`facility_id`, `benefit_key`),
    CONSTRAINT `fk_ag_facility_definition_benefits_facility` FOREIGN KEY (`facility_id`) REFERENCES `ag_facility_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_territories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `territory_id` VARCHAR(191) NOT NULL,
    `controlled` TINYINT(1) NOT NULL DEFAULT 0,
    `influence_level` INT UNSIGNED NOT NULL DEFAULT 0,
    `cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_territories_user_territory` (`user_id`, `territory_id`),
    CONSTRAINT `fk_ag_territories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_territory_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `base_cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_territory_definition_benefits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `territory_id` VARCHAR(191) NOT NULL,
    `benefit_key` VARCHAR(100) NOT NULL,
    `benefit_value_decimal` DECIMAL(10,2) DEFAULT NULL,
    `benefit_value_bool` TINYINT(1) DEFAULT NULL,
    `benefit_value_text` VARCHAR(191) DEFAULT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_ag_territory_definition_benefits_territory` (`territory_id`, `sort_order`),
    CONSTRAINT `fk_ag_territory_definition_benefits_territory` FOREIGN KEY (`territory_id`) REFERENCES `ag_territory_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_votes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `external_id` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `options_json` JSON NOT NULL,
    `votes_json` JSON NOT NULL,
    `deadline_at` DATETIME NOT NULL,
    `passed` TINYINT(1) DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_votes_user_external` (`user_id`, `external_id`),
    CONSTRAINT `fk_ag_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `external_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(50) NOT NULL,
    `rank_name` VARCHAR(50) NOT NULL,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `experience` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'retired',
    `strength` INT NOT NULL DEFAULT 0,
    `intelligence` INT NOT NULL DEFAULT 0,
    `dexterity` INT NOT NULL DEFAULT 0,
    `vitality` INT NOT NULL DEFAULT 0,
    `quests_completed` INT UNSIGNED NOT NULL DEFAULT 0,
    `years_in_guild` INT UNSIGNED NOT NULL DEFAULT 0,
    `retirement_eligible` TINYINT(1) NOT NULL DEFAULT 1,
    `descendant_of_external_id` VARCHAR(191) DEFAULT NULL,
    `retirement_date` DATETIME NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_adventurers_user_external` (`user_id`, `external_id`),
    CONSTRAINT `fk_ag_retired_adventurers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_personality_traits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_adventurer_id` BIGINT UNSIGNED NOT NULL,
    `trait_key` VARCHAR(50) NOT NULL,
    `trait_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_adventurer_trait` (`retired_adventurer_id`, `trait_key`),
    CONSTRAINT `fk_ag_retired_adventurer_trait_retired` FOREIGN KEY (`retired_adventurer_id`) REFERENCES `ag_retired_adventurers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_skills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_adventurer_id` BIGINT UNSIGNED NOT NULL,
    `skill_category` VARCHAR(50) NOT NULL,
    `skill_key` VARCHAR(50) NOT NULL,
    `skill_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_adventurer_skill` (`retired_adventurer_id`, `skill_category`, `skill_key`),
    CONSTRAINT `fk_ag_retired_adventurer_skill_retired` FOREIGN KEY (`retired_adventurer_id`) REFERENCES `ag_retired_adventurers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_relationships` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_adventurer_id` BIGINT UNSIGNED NOT NULL,
    `target_external_id` VARCHAR(191) NOT NULL,
    `relationship_type` VARCHAR(50) NOT NULL,
    `strength` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ag_retired_adventurer_relationship_retired` FOREIGN KEY (`retired_adventurer_id`) REFERENCES `ag_retired_adventurers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_relationship_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `relationship_id` BIGINT UNSIGNED NOT NULL,
    `history_entry` TEXT NOT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_ag_retired_relationship_history_relationship` (`relationship_id`, `sort_order`),
    CONSTRAINT `fk_ag_retired_relationship_history_relationship` FOREIGN KEY (`relationship_id`) REFERENCES `ag_retired_adventurer_relationships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_equipment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_adventurer_id` BIGINT UNSIGNED NOT NULL,
    `slot_type` VARCHAR(50) NOT NULL,
    `equipment_definition_id` VARCHAR(191) DEFAULT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `rarity` VARCHAR(50) NOT NULL,
    `crafted` TINYINT(1) NOT NULL DEFAULT 0,
    `source_type` VARCHAR(50) DEFAULT NULL,
    `source_ref` VARCHAR(191) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_adventurer_equipment_slot` (`retired_adventurer_id`, `slot_type`),
    CONSTRAINT `fk_ag_retired_adventurer_equipment_retired` FOREIGN KEY (`retired_adventurer_id`) REFERENCES `ag_retired_adventurers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_equipment_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_equipment_id` BIGINT UNSIGNED NOT NULL,
    `stat_key` VARCHAR(50) NOT NULL,
    `stat_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_equipment_stat` (`retired_equipment_id`, `stat_key`),
    CONSTRAINT `fk_ag_retired_equipment_stat_equipment` FOREIGN KEY (`retired_equipment_id`) REFERENCES `ag_retired_adventurer_equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_equipment_materials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_equipment_id` BIGINT UNSIGNED NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_equipment_material` (`retired_equipment_id`, `material_id`),
    CONSTRAINT `fk_ag_retired_equipment_material_equipment` FOREIGN KEY (`retired_equipment_id`) REFERENCES `ag_retired_adventurer_equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_retired_adventurer_benefits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `retired_adventurer_id` BIGINT UNSIGNED NOT NULL,
    `benefit_key` VARCHAR(100) NOT NULL,
    `benefit_value_decimal` DECIMAL(10,2) DEFAULT NULL,
    `benefit_value_bool` TINYINT(1) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_retired_adventurer_benefit` (`retired_adventurer_id`, `benefit_key`),
    CONSTRAINT `fk_ag_retired_adventurer_benefit_retired` FOREIGN KEY (`retired_adventurer_id`) REFERENCES `ag_retired_adventurers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_material_inventory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_material_inventory_user_material` (`user_id`, `material_id`),
    CONSTRAINT `fk_ag_material_inventory_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_inventory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `item_external_id` VARCHAR(191) NOT NULL,
    `equipment_definition_id` VARCHAR(191) DEFAULT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `rarity` VARCHAR(50) NOT NULL,
    `crafted` TINYINT(1) NOT NULL DEFAULT 0,
    `source_type` VARCHAR(50) NOT NULL DEFAULT 'crafting',
    `source_ref` VARCHAR(191) DEFAULT NULL,
    `equipped_by_external_id` VARCHAR(191) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_inventory_user_item` (`user_id`, `item_external_id`),
    KEY `idx_ag_equipment_inventory_user_equipped` (`user_id`, `equipped_by_external_id`),
    KEY `idx_ag_equipment_inventory_definition` (`equipment_definition_id`),
    CONSTRAINT `fk_ag_equipment_inventory_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_adventurer_equipment_slots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `adventurer_external_id` VARCHAR(191) NOT NULL,
    `slot_type` VARCHAR(50) NOT NULL,
    `inventory_item_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_adventurer_equipment_slot` (`user_id`, `adventurer_external_id`, `slot_type`),
    UNIQUE KEY `uk_ag_adventurer_equipment_item` (`inventory_item_id`),
    CONSTRAINT `fk_ag_adventurer_equipment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ag_adventurer_equipment_item` FOREIGN KEY (`inventory_item_id`) REFERENCES `ag_equipment_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_inventory_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `inventory_item_id` BIGINT UNSIGNED NOT NULL,
    `stat_key` VARCHAR(50) NOT NULL,
    `stat_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_inventory_stats_item_stat` (`inventory_item_id`, `stat_key`),
    CONSTRAINT `fk_ag_equipment_inventory_stats_item` FOREIGN KEY (`inventory_item_id`) REFERENCES `ag_equipment_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_inventory_materials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `inventory_item_id` BIGINT UNSIGNED NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_inventory_materials_item_material` (`inventory_item_id`, `material_id`),
    CONSTRAINT `fk_ag_equipment_inventory_materials_item` FOREIGN KEY (`inventory_item_id`) REFERENCES `ag_equipment_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_recipe_unlocks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `recipe_id` VARCHAR(191) NOT NULL,
    `unlocked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_recipe_unlocks_user_recipe` (`user_id`, `recipe_id`),
    CONSTRAINT `fk_ag_recipe_unlocks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_constants` (
    `constant_group` VARCHAR(100) NOT NULL,
    `constant_key` VARCHAR(100) NOT NULL,
    `value_json` JSON NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`constant_group`, `constant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `rarity` VARCHAR(50) NOT NULL,
    `crafted_default` TINYINT(1) NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_equipment_type_rarity` (`type`, `rarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_definition_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipment_definition_id` VARCHAR(191) NOT NULL,
    `stat_key` VARCHAR(50) NOT NULL,
    `stat_value` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_definition_stats_def_stat` (`equipment_definition_id`, `stat_key`),
    CONSTRAINT `fk_ag_equipment_definition_stats_definition` FOREIGN KEY (`equipment_definition_id`) REFERENCES `ag_equipment_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_definition_materials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipment_definition_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_definition_materials_def_material` (`equipment_definition_id`, `material_id`),
    CONSTRAINT `fk_ag_equipment_definition_materials_definition` FOREIGN KEY (`equipment_definition_id`) REFERENCES `ag_equipment_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_equipment_definition_source_tags` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipment_definition_id` VARCHAR(191) NOT NULL,
    `source_tag` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_equipment_definition_source_tags_def_tag` (`equipment_definition_id`, `source_tag`),
    CONSTRAINT `fk_ag_equipment_definition_source_tags_definition` FOREIGN KEY (`equipment_definition_id`) REFERENCES `ag_equipment_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_quest_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `source_type` VARCHAR(30) NOT NULL,
    `source_ref` VARCHAR(191) DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `reward` INT UNSIGNED NOT NULL DEFAULT 0,
    `duration_value` BIGINT NOT NULL DEFAULT 0,
    `duration_unit` VARCHAR(30) NOT NULL DEFAULT 'frontend_raw',
    `min_level` INT UNSIGNED NOT NULL DEFAULT 1,
    `preferred_classes_json` JSON NOT NULL,
    `skill_requirements_json` JSON DEFAULT NULL,
    `personality_requirements_json` JSON DEFAULT NULL,
    `difficulty` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'available',
    `quest_type` VARCHAR(30) NOT NULL,
    `campaign_id` VARCHAR(191) DEFAULT NULL,
    `world_event_id` VARCHAR(191) DEFAULT NULL,
    `seasonal_event_id` VARCHAR(191) DEFAULT NULL,
    `experience_reward` INT UNSIGNED NOT NULL DEFAULT 0,
    `skill_rewards_json` JSON DEFAULT NULL,
    `loot_table_json` JSON DEFAULT NULL,
    `procedural` TINYINT(1) NOT NULL DEFAULT 0,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_quest_definitions_source` (`source_type`, `source_ref`),
    KEY `idx_ag_quest_definitions_type` (`quest_type`, `difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_quest_definition_loot` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `quest_id` VARCHAR(191) NOT NULL,
    `equipment_definition_id` VARCHAR(191) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_ag_quest_definition_loot_quest` (`quest_id`, `sort_order`),
    CONSTRAINT `fk_ag_quest_definition_loot_quest` FOREIGN KEY (`quest_id`) REFERENCES `ag_quest_definitions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ag_quest_definition_loot_equipment` FOREIGN KEY (`equipment_definition_id`) REFERENCES `ag_equipment_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_campaign_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `quest_ids_json` JSON NOT NULL,
    `rewards_json` JSON NOT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_world_event_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `active_default` TINYINT(1) NOT NULL DEFAULT 0,
    `duration_days` INT UNSIGNED NOT NULL DEFAULT 0,
    `quest_reward_multiplier` DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    `adventurer_morale_bonus` INT DEFAULT NULL,
    `effects_json` JSON NOT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_world_event_special_quests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` VARCHAR(191) NOT NULL,
    `quest_id` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_world_event_special_quest` (`event_id`, `quest_id`),
    CONSTRAINT `fk_ag_world_event_special_quests_event` FOREIGN KEY (`event_id`) REFERENCES `ag_world_event_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_faction_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `base_reputation` INT NOT NULL DEFAULT 0,
    `description` TEXT NOT NULL,
    `reward_multiplier` DECIMAL(6,2) NOT NULL DEFAULT 1.00,
    `quest_modifiers_json` JSON NOT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_faction_definition_quest_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `faction_id` VARCHAR(191) NOT NULL,
    `quest_type` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_faction_definition_quest_type` (`faction_id`, `quest_type`),
    CONSTRAINT `fk_ag_faction_definition_quest_types_faction` FOREIGN KEY (`faction_id`) REFERENCES `ag_faction_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_crafting_material_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rarity` VARCHAR(50) NOT NULL,
    `sources_json` JSON NOT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_crafting_material_definitions_rarity` (`rarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_crafting_recipe_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `result_item_id` VARCHAR(191) DEFAULT NULL,
    `gold_cost` INT UNSIGNED NOT NULL DEFAULT 0,
    `required_facility_level` INT UNSIGNED NOT NULL DEFAULT 1,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_crafting_recipe_definitions_result_item` (`result_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_crafting_recipe_materials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `recipe_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ag_crafting_recipe_materials_recipe_material` (`recipe_id`, `material_id`),
    CONSTRAINT `fk_ag_crafting_recipe_materials_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `ag_crafting_recipe_definitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_seasonal_event_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `season` VARCHAR(30) NOT NULL,
    `duration_days` INT UNSIGNED NOT NULL DEFAULT 0,
    `rewards_json` JSON NOT NULL,
    `special_recruits_json` JSON DEFAULT NULL,
    `unlock_conditions_json` JSON DEFAULT NULL,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ag_seasonal_event_definitions_season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ag_starter_adventurer_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `class` VARCHAR(50) NOT NULL,
    `rank_name` VARCHAR(50) NOT NULL,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `experience` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'available',
    `strength` INT NOT NULL DEFAULT 0,
    `intelligence` INT NOT NULL DEFAULT 0,
    `dexterity` INT NOT NULL DEFAULT 0,
    `vitality` INT NOT NULL DEFAULT 0,
    `personality_json` JSON NOT NULL,
    `skills_json` JSON NOT NULL,
    `relationships_json` JSON NOT NULL,
    `quests_completed` INT UNSIGNED NOT NULL DEFAULT 0,
    `years_in_guild` INT UNSIGNED NOT NULL DEFAULT 0,
    `retirement_eligible` TINYINT(1) NOT NULL DEFAULT 0,
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
