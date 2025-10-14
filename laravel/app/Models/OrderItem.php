<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',    
        'name',         // snapshot naziva u trenutku kupovine
        'price',        // snapshot cene (EUR, decimal 10,2)
        'quantity',
        'line_total',   // price * quantity
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'line_total' => 'decimal:2',
        'quantity'   => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /* ---------- Mutatori/Hookovi ---------- */

    /** Automatski izračunaj line_total kada se setuju price/quantity */
    protected static function booted(): void
    {
        static::saving(function (OrderItem $item) {
            $qty = max(1, (int)($item->quantity ?? 1));
            $price = (float)($item->price ?? 0);
            $item->line_total = round($qty * $price, 2);
        });

        // nakon izmene stavke, keširaj total u parent narudžbini
        static::saved(function (OrderItem $item) {
            if ($item->relationLoaded('order') ? $item->order : $item->order()->exists()) {
                $item->order->loadMissing('items')->recalcTotal();
            }
        });

        static::deleted(function (OrderItem $item) {
            if ($item->relationLoaded('order') ? $item->order : $item->order()->exists()) {
                $item->order->loadMissing('items')->recalcTotal();
            }
        });
    }
}
