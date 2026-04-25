<?php

declare(strict_types=1);

namespace AdventurerGuild\Controllers;

use AdventurerGuild\Http\Request;
use AdventurerGuild\Http\Response;

final class HealthController
{
    public function health(Request $request, Response $response): Response
    {
        $response->getBody()->write((string) json_encode([
            'success' => true,
            'data' => [
                'status' => 'ok',
                'service' => 'adventurer_guild_backend',
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
