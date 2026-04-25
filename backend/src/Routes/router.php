<?php

declare(strict_types=1);

use AdventurerGuild\Controllers\AuthController;
use AdventurerGuild\Controllers\GuildController;
use AdventurerGuild\Controllers\HealthController;
use AdventurerGuild\Core\Router;
use AdventurerGuild\Middleware\WebHatcheryJwtMiddleware;

return static function (Router $router): void {
    $api = '/api';

    $router->get($api . '/health', [HealthController::class, 'health']);
    $router->get($api . '/auth/session', [AuthController::class, 'session'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/auth/guest-session', [AuthController::class, 'guestSession']);
    $router->post($api . '/auth/link-guest', [AuthController::class, 'linkGuest'], [WebHatcheryJwtMiddleware::class]);

    $router->get($api . '/guild/summary', [GuildController::class, 'summary'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/roster', [GuildController::class, 'roster'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/activity', [GuildController::class, 'activity'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/world-state', [GuildController::class, 'worldState'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/facilities/upgrade', [GuildController::class, 'upgradeFacility'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/crafting/craft', [GuildController::class, 'craftRecipe'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/equipment/equip', [GuildController::class, 'equipInventoryItem'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/equipment/unequip', [GuildController::class, 'unequipInventoryItem'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/adventurers/retire', [GuildController::class, 'retireAdventurer'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/recruits/refresh', [GuildController::class, 'refreshRecruits'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/recruits/hire', [GuildController::class, 'hireRecruit'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/quests', [GuildController::class, 'questBoard'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/quests/assign', [GuildController::class, 'assignQuest'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/quests/resolve', [GuildController::class, 'resolveQuest'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/save-slots', [GuildController::class, 'listSaveSlots'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/guild/save-slots/{slotNumber}', [GuildController::class, 'saveSlot'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/guild/save-slots/{slotNumber}', [GuildController::class, 'loadSlot'], [WebHatcheryJwtMiddleware::class]);
};
