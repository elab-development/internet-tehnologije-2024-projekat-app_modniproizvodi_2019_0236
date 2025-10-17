<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
      use HasFactory;
    // Front koristi: id, name, description, price, image
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',        // čuvamo u EUR, decimal(10,2)
        'image',        // URL ili putanja
        'is_active',
        'sku',
        'stock',        // opciono, ako poželiš kontrolu zaliha
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
        'stock'     => 'integer',
    ];
    protected $appends = ['image_url'];
    /** Kategorija */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }


    /* ---------- Scopes za pretragu/sort kao na frontu ---------- */

    /** scopeSearch('haljina') -> where name/description like ... */
    public function scopeSearch($q, ?string $term)
    {
        if (!filled($term)) return $q;
        $t = mb_strtolower($term);
        return $q->where(fn($qr) =>
            $qr->whereRaw('LOWER(name) LIKE ?', ["%{$t}%"])
               ->orWhereRaw('LOWER(description) LIKE ?', ["%{$t}%"])
        );
    }

    /** scopeSortPrice('asc'|'desc') */
    public function scopeSortPrice($q, ?string $dir)
    {
        $dir = strtolower($dir ?? '');
        if (!in_array($dir, ['asc','desc'])) return $q;
        return $q->orderBy('price', $dir);
    }

    /* ---------- Helperi ---------- */

    /** Ako je u bazi relativna putanja, vrati pun URL */
    public function getImageUrlAttribute(): string
    {
        $img = $this->image ?? '';
        if (!$img) return '';
        if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) {
            return $img;
        }
        // čuvamo relativnu putanju (npr. "products/abc.jpg") na public disku
        return Storage::disk('public')->url($img);
    }
}
