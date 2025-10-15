<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'slug'        => $this->slug,
            'is_active'   => (bool) $this->is_active,
            // broj proizvoda samo ako je pre-loaderovan (npr. ->withCount('products'))
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
        ];
    }
}
