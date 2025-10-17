<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactMessageController extends Controller
{
    // POST /api/contact-messages  (javno)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => ['required','string','max:255'],
            'email'   => ['required','email','max:255'],
            'message' => ['required','string','max:5000'],
        ]);

        $msg = Message::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'message'     => $data['message'],
            'processed'   => false,
            'processed_at'=> null,
        ]);

        return response()->json($msg, 201);
    }

    // GET /api/contact-messages?processed=0|1&q=  (admin)
    public function index(Request $request)
    {
        $q = Message::query()
            ->when($request->filled('processed'), fn($qr) =>
                $qr->where('processed', (bool)$request->integer('processed')))
            ->when($request->filled('q'), fn($qr) =>
                $qr->where(function($w) use ($request) {
                    $term = '%'.$request->string('q').'%';
                    $w->where('name','like',$term)
                      ->orWhere('email','like',$term)
                      ->orWhere('message','like',$term);
                }))
            ->orderByDesc('id');

        return $q->paginate($request->integer('per_page', 15))->withQueryString();
    }

    // GET /api/contact-messages/{message} (admin)
    public function show(Message $message)
    {
        return $message;
    }

    // PATCH /api/contact-messages/{message}/process  (admin) – označi kao (ne)obrađeno
    public function process(Request $request, Message $message)
    {
        $data = $request->validate([
            'processed' => ['required', Rule::in([0,1,true,false,'0','1'])],
        ]);
        $processed = filter_var($data['processed'], FILTER_VALIDATE_BOOLEAN);

        $message->processed    = $processed;
        $message->processed_at = $processed ? now() : null;
        $message->save();

        return $message;
    }

    // DELETE /api/contact-messages/{message} (admin)
    public function destroy(Message $message)
    {
        $message->delete();
        return response()->noContent();
    }
}
