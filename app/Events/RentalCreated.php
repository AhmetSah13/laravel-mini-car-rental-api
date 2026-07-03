<?php

namespace App\Events;

use App\Features\Rentals\Resources\RentalResource;
use App\Models\Rental;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RentalCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Rental $rental)
    {
        $this->rental->loadMissing(['car', 'customer']);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('admin.notifications');
    }

    public function broadcastAs(): string
    {
        return 'rental.created';
    }

    /**
     * @return array{rental: array<string, mixed>}
     */
    public function broadcastWith(): array
    {
        return [
            'rental' => (new RentalResource($this->rental))->resolve(),
        ];
    }
}
