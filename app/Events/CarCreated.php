<?php

namespace App\Events;

use App\Features\Cars\Resources\CarResource;
use App\Models\Car;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CarCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Car $car)
    {
        $this->car->loadMissing('brand');
    }

    public function broadcastOn(): Channel
    {
        return new Channel('cars');
    }

    public function broadcastAs(): string
    {
        return 'car.created';
    }

    /**
     * @return array{car: array<string, mixed>}
     */
    public function broadcastWith(): array
    {
        return [
            'car' => (new CarResource($this->car))->resolve(),
        ];
    }
}
