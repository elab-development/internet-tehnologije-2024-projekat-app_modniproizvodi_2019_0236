<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray( $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'body'      => $this->body ?? $this->message, // podrži oba polja
            'processed' => (bool) $this->processed,
            'created_at'=> $this->created_at?->toISOString(),
        ];
    }
}
