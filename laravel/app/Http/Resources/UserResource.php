<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'username' => $this->username,
            'email'    => $this->email,
            'role'     => $this->role,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            // agregati ako su pre-loaderovani
            'orders_count' => $this->when(isset($this->orders_count), $this->orders_count),
        ];
    }
}
