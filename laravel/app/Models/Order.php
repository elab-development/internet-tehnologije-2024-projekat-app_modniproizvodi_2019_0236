<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
      use HasFactory;
    protected $fillable = [
        'user_id',          
        'customer_name',
        'customer_email',
        'customer_phone',
        'status',           // 'pending','paid','cancelled'
        'notes',
        'total_price',      // keširano za pregled; izračunava se iz stavki
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
    ];

    /** Stavke narudžbine */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
 
    /** (Opcionalno) vlasnik narudžbine */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* ---------- Helperi ---------- */

    /** Preračunaj i upiši total iz stavki */
    public function recalcTotal(): static
    {
        $sum = $this->items->sum(fn ($it) => (float)$it->line_total);
        $this->total_price = round($sum, 2);
        return tap($this)->save();
    }

    /** Statusi kao konstante */
    public const STATUS_PENDING  = 'pending';
    public const STATUS_PAID     = 'paid';
    public const STATUS_CANCELLED= 'cancelled';
}
