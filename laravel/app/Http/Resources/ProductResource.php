<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray( $request): array
    {
        return [
            'id'          => $this->id,
            'category_id' => $this->category_id,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'image'       => $this->image,
            'image_url'   => $this->image_url ?? null, // accessor iz modela
            'is_active'   => (bool) $this->is_active,
            'sku'         => $this->sku,
            'stock'       => $this->stock,
            // Ugnježdeno: minimalni prikaz kategorije (ako je učitana)
            'category'    => $this->whenLoaded('category', fn () => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
