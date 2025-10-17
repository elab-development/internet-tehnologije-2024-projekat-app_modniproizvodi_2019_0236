<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminMetricsController extends Controller
{
   
    public function overview(Request $request)
    {
        
        $totals = [
            'users'      => (int) User::count(),
            'products'   => (int) Product::count(),
            'categories' => (int) Category::count(),
            'orders'     => (int) Order::count(),
            'revenue'    => (float) Order::sum('total_price'),
        ];

 
        $start = now()->copy()->startOfMonth()->subMonths(11);
        $months = collect(range(0, 11))->map(function ($i) use ($start) {
            $d = $start->copy()->addMonths($i);
            return [
                'ym'    => $d->format('Y-m'),
                'label' => $d->translatedFormat('M Y'),  
            ];
        });

        $raw = Order::select([
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as ym"),
                DB::raw('COUNT(*) as cnt'),
                DB::raw('SUM(total_price) as revenue'),
            ])
            ->where('created_at', '>=', $start)
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');

        $ordersByMonth = $months->map(function ($m) use ($raw) {
            $row = $raw->get($m['ym']);
            return [
                'ym'      => $m['ym'],
                'label'   => $m['label'],
                'count'   => (int) ($row->cnt ?? 0),
                'revenue' => (float) ($row->revenue ?? 0),
            ];
        })->values();

 
        $productsByCategory = Category::query()
            ->leftJoin('products', 'products.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->orderByRaw('COUNT(products.id) DESC')
            ->limit(10)
            ->get([
                'categories.id',
                'categories.name',
                DB::raw('COUNT(products.id) as cnt'),
            ])->map(fn ($r) => [
                'id'   => (int) $r->id,
                'name' => (string) $r->name,
                'count'=> (int) $r->cnt,
            ])->values();

        return response()->json([
            'totals' => $totals,
            'charts' => [
                'orders_by_month'      => $ordersByMonth,
                'products_by_category' => $productsByCategory,
            ],
        ]);
    }
}
