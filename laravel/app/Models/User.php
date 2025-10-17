<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable /* implements MustVerifyEmail */
{
    use HasApiTokens, HasFactory, Notifiable;

    // Role konstante
    public const ROLE_USER  = 'user';
    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'name',
        'username',  
        'email',
        'password',
        'role',       
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime', 
        'role' => 'string',
    ];

    /* -------- Helpers -------- */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /* -------- Relacije (opciono) -------- */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /* -------- Scopes (opciono) -------- */
    public function scopeRole($q, string $role)
    {
        return $q->where('role', $role);
    }
}
