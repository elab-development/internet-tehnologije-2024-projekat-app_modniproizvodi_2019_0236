<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // GET /api/products?q=&category_id=&price_min=&price_max=&sort=price_asc|price_desc&only_active=1
    public function index(Request $request)
    {
        $q = Product::query()
            ->with('category:id,name') // minimalno za badge na frontu
            ->when($request->boolean('only_active'), fn($qr) => $qr->where('is_active', true))
            ->when($request->filled('category_id'), fn($qr) => $qr->where('category_id', $request->integer('category_id')))
            ->when($request->filled('price_min'), fn($qr) => $qr->where('price', '>=', (float)$request->input('price_min')))
            ->when($request->filled('price_max'), fn($qr) => $qr->where('price', '<=', (float)$request->input('price_max')))
            ->search($request->string('q'))              // scopeSearch iz modela
            ->sortPrice($this->mapSort($request->string('sort'))); // scopeSortPrice

        // frontu tipično treba: id, name, description, price, image_url (ili image)
        $q->select(['id','category_id','name','description','price','image','is_active','sku','stock']);

        return $q->paginate($request->integer('per_page', 12))->withQueryString();
    }

    // GET /api/products/{product}
    public function show(Product $product)
    {
        $product->load('category:id,name');
        return $product;
    }

    // POST /api/products
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required','integer','exists:categories,id'],
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'price'       => ['required','numeric','min:0'],
            'image'       => ['nullable','string','max:2048'],
            'is_active'   => ['boolean'],
            'sku'         => ['nullable','string','max:100', Rule::unique('products','sku')],
            'stock'       => ['nullable','integer','min:0'],
        ]);

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    // PUT/PATCH /api/products/{product}
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => ['sometimes','integer','exists:categories,id'],
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'price'       => ['sometimes','numeric','min:0'],
            'image'       => ['sometimes','nullable','string','max:2048'],
            'is_active'   => ['sometimes','boolean'],
            'sku'         => ['sometimes','nullable','string','max:100', Rule::unique('products','sku')->ignore($product->id)],
            'stock'       => ['sometimes','nullable','integer','min:0'],
        ]);

        $product->update($data);
        return $product;
    }

    // DELETE /api/products/{product}
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->noContent();
    }

    private function mapSort(?string $sort): ?string
    {
        return match($sort) {
            'price_asc'  => 'asc',
            'price_desc' => 'desc',
            default      => null,
        };
    }
}
