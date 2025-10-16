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
    public function index(Request $request)
    {
        $q = Product::query()
            ->with('category:id,name')
            ->when($request->boolean('only_active'), fn($qr) => $qr->where('is_active', true))
            ->when($request->filled('category_id'), fn($qr) => $qr->where('category_id', $request->integer('category_id')))
            ->when($request->filled('price_min'), fn($qr) => $qr->where('price', '>=', (float)$request->input('price_min')))
            ->when($request->filled('price_max'), fn($qr) => $qr->where('price', '<=', (float)$request->input('price_max')))
            ->search($request->string('q'))
            ->sortPrice($this->mapSort($request->string('sort')));

        $q->select(['id','category_id','name','description','price','image','is_active','sku','stock']);

        return $q->paginate($request->integer('per_page', 12))->withQueryString();
    }

    public function show(Product $product)
    {
        $product->load('category:id,name');
        return $product;
    }

    // multipart/form-data (image kao fajl) ili čisti JSON (image kao URL)
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required','integer','exists:categories,id'],
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'price'       => ['required','numeric','min:0'],
            // ako šalješ fajl: <input type="file" name="image">
            // ako šalješ URL, proći će kao 'string' (ali tada nemoj slati file)
            'image'       => [$request->hasFile('image') ? 'nullable|image|max:4096' : 'nullable|string|max:2048'],
            'is_active'   => ['boolean'],
            'sku'         => ['nullable','string','max:100', Rule::unique('products','sku')],
            'stock'       => ['nullable','integer','min:0'],
        ]);

        // Ako je upload fajla:
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public'); // npr. "products/xyz.jpg"
        }

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => ['sometimes','integer','exists:categories,id'],
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'price'       => ['sometimes','numeric','min:0'],
            'image'       => [$request->hasFile('image') ? 'sometimes|image|max:4096' : 'sometimes|nullable|string|max:2048'],
            'is_active'   => ['sometimes','boolean'],
            'sku'         => ['sometimes','nullable','string','max:100', Rule::unique('products','sku')->ignore($product->id)],
            'stock'       => ['sometimes','nullable','integer','min:0'],
            // opciono: eksplicitno brisanje postojeće slike bez dodavanja nove
            'remove_image'=> ['sometimes','boolean'],
        ]);

        $oldPath = $product->image;

        // eksplicitno brisanje slike:
        if ($request->boolean('remove_image')) {
            $this->deleteImageIfLocal($oldPath);
            $data['image'] = null;
        }

        // nova uploadovana slika:
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        // ako smo uploadovali novu, obriši staru
        if (isset($data['image']) && $oldPath && $oldPath !== $data['image']) {
            $this->deleteImageIfLocal($oldPath);
        }

        return $product;
    }

    public function destroy(Product $product)
    {
        $this->deleteImageIfLocal($product->image);
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

    private function deleteImageIfLocal(?string $path): void
    {
        if (!$path) return;
        // Ako je URL, ne diramo; ako je relativna putanja na public disku, brišemo
        if (!str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
            Storage::disk('public')->delete($path);
        }
    }
}
