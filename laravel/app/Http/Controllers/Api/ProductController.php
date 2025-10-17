<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Filteri: q, only_active, category_id, price_min, price_max, sort (price_asc|price_desc), per_page
     */
    public function index(Request $request)
    {
        $q = Product::query()
            ->with('category:id,name')
            ->when($request->boolean('only_active'), fn($qr) => $qr->where('is_active', true))
            ->when($request->filled('category_id'), fn($qr) => $qr->where('category_id', (int) $request->input('category_id')))
            ->when($request->filled('price_min'), fn($qr) => $qr->where('price', '>=', (float) $request->input('price_min')))
            ->when($request->filled('price_max'), fn($qr) => $qr->where('price', '<=', (float) $request->input('price_max')))
            // pretpostavka: postoje lokalni scope-ovi ->search($q) i ->sortPrice('asc'|'desc'|null)
            ->search($request->input('q'))
            ->sortPrice($this->mapSort($request->input('sort')));

        $q->select(['id','category_id','name','description','price','image','is_active','sku','stock']);

        return $q->paginate($request->integer('per_page', 12))->withQueryString();
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product)
    {
        $product->load('category:id,name');
        return $product;
    }

    /**
     * POST /api/products
     * Prihvata multipart/form-data (image kao fajl) ili JSON (image kao URL/string).
     */
    public function store(Request $request)
    {
        // Bazna pravila
        $rules = [
            'category_id' => ['required','integer','exists:categories,id'],
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'price'       => ['required','numeric','min:0'],
            'is_active'   => ['boolean'],
            'sku'         => ['nullable','string','max:100', Rule::unique('products','sku')],
            'stock'       => ['nullable','integer','min:0'],
        ];

        // Polje image dinamički – fajl ili URL/string
        if ($request->hasFile('image')) {
            $rules['image'] = ['nullable','image','max:4096'];     // 4MB (max je u KB)
        } elseif ($request->filled('image')) {
            // ako šalješ URL (strože) ili samo string (blaže)
            $rules['image'] = ['nullable','url','max:2048'];       // ili ['nullable','string','max:2048']
        } else {
            $rules['image'] = ['nullable'];
        }

        $data = $request->validate($rules);

        // Snimi fajl ako je uploadovan
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public'); // npr. products/abc.jpg
        }

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    /**
     * PATCH/PUT /api/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        // Bazna pravila
        $rules = [
            'category_id' => ['sometimes','integer','exists:categories,id'],
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'price'       => ['sometimes','numeric','min:0'],
            'is_active'   => ['sometimes','boolean'],
            'sku'         => ['sometimes','nullable','string','max:100', Rule::unique('products','sku')->ignore($product->id)],
            'stock'       => ['sometimes','nullable','integer','min:0'],
            'remove_image'=> ['sometimes','boolean'],
        ];

        // Dinamička validacija image polja
        if ($request->hasFile('image')) {
            $rules['image'] = ['sometimes','image','max:4096'];
        } elseif ($request->filled('image')) {
            $rules['image'] = ['sometimes','nullable','url','max:2048']; // ili 'string'
        } else {
            $rules['image'] = ['sometimes','nullable'];
        }

        $data = $request->validate($rules);

        $oldPath = $product->image;

        // Eksplicitno brisanje postojeće slike
        if ($request->boolean('remove_image')) {
            $this->deleteImageIfLocal($oldPath);
            $data['image'] = null;
        }

        // Nova uploadovana slika
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        // Ako je uploadovana nova slika, obriši staru (ako je lokalna)
        if (array_key_exists('image', $data) && $oldPath && $oldPath !== $data['image']) {
            $this->deleteImageIfLocal($oldPath);
        }

        return $product->fresh('category:id,name');
    }

    /**
     * DELETE /api/products/{product}
     */
    public function destroy(Product $product)
    {
        $this->deleteImageIfLocal($product->image);
        $product->delete();

        return response()->noContent();
    }

    /**
     * Mapiranje sort parametra sa fronta.
     */
    private function mapSort(?string $sort): ?string
    {
        return match ($sort) {
            'price_asc'  => 'asc',
            'price_desc' => 'desc',
            default      => null,
        };
    }

    /**
     * Briše fajl sa public diska ako je relativna putanja (a ne spoljašnji URL).
     */
    private function deleteImageIfLocal(?string $path): void
    {
        if (!$path) return;

        // ne diramo eksterne URL-ove
        if (!Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }
}
