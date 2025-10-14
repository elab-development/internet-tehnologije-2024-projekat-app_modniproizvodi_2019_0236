<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    // Front koristi: name, email, message
    protected $fillable = [
        'name',
        'email',
        'message',   // sadržaj poruke
        'processed', // bool: da li je odgovoreno/obrađeno
    ];

    protected $casts = [
        'processed' => 'boolean',
    ];
}
