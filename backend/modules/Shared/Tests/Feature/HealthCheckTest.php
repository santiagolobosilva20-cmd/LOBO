<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

it('returns 200 ok when database probe succeeds', function (): void {
    DB::shouldReceive('select')
        ->once()
        ->with('SELECT 1')
        ->andReturn([['?column?' => 1]]);

    $response = $this->getJson('/api/v1/healthz');

    $response->assertOk()
        ->assertJsonPath('data.status', 'ok')
        ->assertJsonPath('data.database', 'connected');
});

it('returns 503 degraded without exposing credentials when database probe fails', function (): void {
    DB::shouldReceive('select')
        ->once()
        ->with('SELECT 1')
        ->andThrow(new RuntimeException('Connection refused'));

    $response = $this->getJson('/api/v1/healthz');

    $response->assertStatus(503)
        ->assertJsonPath('data.status', 'degraded')
        ->assertJsonPath('data.database', 'disconnected');
});
