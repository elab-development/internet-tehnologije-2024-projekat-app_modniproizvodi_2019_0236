<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'contact_messages';  

    protected $fillable = [
        'name',
        'email',
        'body',   
        'message',  
        'processed',
    ];

    protected $casts = [
        'processed' => 'boolean',
    ];
}
