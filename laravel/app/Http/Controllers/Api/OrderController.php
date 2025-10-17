<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderCreatedMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    // GET /api/orders?status=&q=&per_page=
    public function index(Request $request)
    {
        $q = Order::query()
            ->with(['items' => function($qr) {
                $qr->select('id','order_id','product_id','name','price','quantity','line_total');
            }])
            ->when($request->filled('status'), fn($qr) =>
                $qr->where('status', $request->string('status')))
            ->when($request->filled('q'), fn($qr) =>
                $qr->where(function ($w) use ($request) {
                    $term = '%'.$request->string('q').'%';
                    $w->where('customer_name','like',$term)
                      ->orWhere('customer_email','like',$term)
                      ->orWhere('customer_phone','like',$term)
                      ->orWhere('id', $request->string('q')); // brza pretraga po ID-u
                }))
            ->orderByDesc('id');

        return $q->paginate($request->integer('per_page', 15))->withQueryString();
    }

    // GET /api/orders/{order}
    public function show(Order $order)
    {
        $order->load('items');
        return $order;
    }
 
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'  => ['required','string','max:255'],
            'customer_email' => ['required','email','max:255'],
            'customer_phone' => ['nullable','string','max:50'],
             
            'items'          => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer','exists:products,id'],
            'items.*.quantity'   => ['required','integer','min:1'],
        ]);

        $order = DB::transaction(function () use ($data, $request) {
            $order = new Order();
            // ako želiš da vežeš za user-a kad je ulogovan:
            if ($request->user()) {
                $order->user_id = $request->user()->id;
            }
            $order->customer_name  = $data['customer_name'];
            $order->customer_email = $data['customer_email'];
            $order->customer_phone = $data['customer_phone'] ?? null;
        
            $order->status         = Order::STATUS_PENDING;
            $order->total_price    = 0;
            $order->save();

            foreach ($data['items'] as $row) {
                $product = Product::findOrFail($row['product_id']);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'name'       => $product->name,           // snapshot naziva
                    'price'      => $product->price,          // snapshot cene
                    'quantity'   => (int)$row['quantity'],
                    // line_total se računa u booted() OrderItem-a
                ]);
            }

            // izračunaj total i snimi
            $order->load('items')->recalcTotal();
             if (filled($order->customer_email)) {
                   
                    Mail::to($order->customer_email)->queue(new OrderCreatedMail($order));
                   
                }
            return $order->fresh('items');
        });

        return response()->json($order, 201);
    }

    // PATCH /api/orders/{order}
    // update osnovnih polja; po potrebi može i zamena stavki "u komadu" (vidi ispod)
    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'customer_name'  => ['sometimes','string','max:255'],
            'customer_email' => ['sometimes','email','max:255'],
            'customer_phone' => ['sometimes','nullable','string','max:50'],
       
            // opciono: kompletna zamena stavki
            'items'          => ['sometimes','array','min:1'],
            'items.*.product_id' => ['required_with:items','integer','exists:products,id'],
            'items.*.quantity'   => ['required_with:items','integer','min:1'],
        ]);

        DB::transaction(function () use ($order, $data) {
            $order->update([
                'customer_name'  => $data['customer_name']  ?? $order->customer_name,
                'customer_email' => $data['customer_email'] ?? $order->customer_email,
                'customer_phone' => array_key_exists('customer_phone',$data) ? $data['customer_phone'] : $order->customer_phone,
               
            ]);

            if (array_key_exists('items', $data)) {
                // zamena svih stavki
                foreach ($order->items as $it) { $it->delete(); }

                foreach ($data['items'] as $row) {
                    $product = Product::findOrFail($row['product_id']);
                    OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => $product->id,
                        'name'       => $product->name,
                        'price'      => $product->price,
                        'quantity'   => (int)$row['quantity'],
                    ]);
                }
            }

            $order->load('items')->recalcTotal();
        });

        return $order->fresh('items');
    }

    // DELETE /api/orders/{order}
    public function destroy(Order $order)
    {
        DB::transaction(function () use ($order) {
            // kaskadno brisanje stavki
            foreach ($order->items as $it) { $it->delete(); }
            $order->delete();
        });
        return response()->noContent();
    }

    // POST /api/orders/{order}/items  (dodaj jednu stavku)
    public function addItem(Request $request, Order $order)
    {
        $data = $request->validate([
            'product_id' => ['required','integer','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
        ]);

        DB::transaction(function () use ($order, $data) {
            $product = Product::findOrFail($data['product_id']);
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'name'       => $product->name,
                'price'      => $product->price,
                'quantity'   => (int)$data['quantity'],
            ]);
            $order->load('items')->recalcTotal();
        });

        return $order->fresh('items');
    }

    // PATCH /api/orders/{order}/items/{item}  (izmeni količinu ili snapshot cenu/ime)
    public function updateItem(Request $request, Order $order, OrderItem $item)
    {
        abort_unless($item->order_id === $order->id, 404);

        $data = $request->validate([
            'name'     => ['sometimes','string','max:255'], // retko, ali dozvoljeno
            'price'    => ['sometimes','numeric','min:0'],
            'quantity' => ['sometimes','integer','min:1'],
        ]);

        DB::transaction(function () use ($order, $item, $data) {
            $item->update($data);
            $order->load('items')->recalcTotal();
        });

        return $order->fresh('items');
    }

    // DELETE /api/orders/{order}/items/{item}
    public function removeItem(Order $order, OrderItem $item)
    {
        abort_unless($item->order_id === $order->id, 404);

        DB::transaction(function () use ($order, $item) {
            $item->delete();
            $order->load('items')->recalcTotal();
        });

        return $order->fresh('items');
    }

    // PATCH /api/orders/{order}/status  (brz status update)
    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([
                Order::STATUS_PENDING,
                Order::STATUS_PAID,
                Order::STATUS_CANCELLED
            ])],
        ]);

        $order->update(['status' => $data['status']]);
        return $order;
    }
}
