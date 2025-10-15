<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'order_id'   => $this->order_id,
            'product_id' => $this->product_id,
            'name'       => $this->name,
            'price'      => (float) $this->price,
            'quantity'   => (int) $this->quantity,
            'line_total' => (float) $this->line_total,
            // ugnježdeno: proizvod (ako je učitan)
            'product'    => $this->whenLoaded('product', function () {
                return [
                    'id'    => $this->product->id,
                    'name'  => $this->product->name,
                    'price' => (float) $this->product->price,
                    'image' => $this->product->image_url ?? $this->product->image,
                ];
            }),
        ];
    }
}
