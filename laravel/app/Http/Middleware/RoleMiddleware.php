<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
 
        if (!empty($roles)) {
            $allowed = collect($roles)
                ->flatMap(fn($r) => explode(',', $r)) // dozvoli CSV u ruti
                ->map(fn($r) => trim($r))
                ->filter()
                ->values();

            if ($allowed->isNotEmpty() && !$allowed->contains($user->role)) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        return $next($request);
    }
}
