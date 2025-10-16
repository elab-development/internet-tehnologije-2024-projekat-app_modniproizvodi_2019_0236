<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories?only_active=1&search=
    public function index(Request $request)
    {
        $q = Category::query()
            ->when($request->boolean('only_active'), fn($qr) => $qr->where('is_active', true))
            ->when($request->filled('search'), fn($qr) =>
                $qr->where(fn($w) =>
                    $w->where('name','like','%'.$request->string('search').'%')
                      ->orWhere('description','like','%'.$request->string('search').'%')
                )
            )
            ->orderBy('name');

        return $q->get(['id','name','description','slug','is_active']);
    }

    // GET /api/categories/{category}
    public function show(Category $category)
    {
        return $category->only(['id','name','description','slug','is_active']);
    }

 

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'slug'        => ['required','string','max:255','unique:categories,slug'],
            'is_active'   => ['boolean'],
        ]);
        $c = Category::create($data);
        return response()->json($c, 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => ['sometimes','string','max:255'],
            'description' => ['sometimes','nullable','string'],
            'slug'        => ['sometimes','string','max:255','unique:categories,slug,'.$category->id],
            'is_active'   => ['sometimes','boolean'],
        ]);
        $category->update($data);
        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->noContent();
    }
}
