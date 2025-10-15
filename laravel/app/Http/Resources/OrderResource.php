<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'customer_name'  => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'status'         => $this->status,
            'notes'          => $this->notes,
            'total_price'    => (float) $this->total_price,
            'created_at'     => $this->created_at?->toISOString(),
            // ugnježdeno: korisnik (ako je učitan)
            'user'  => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            // ugnježdeno: stavke (ako su učitane)
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
