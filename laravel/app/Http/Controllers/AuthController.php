<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:120'],
            'username' => ['required','string','max:60','alpha_dash', Rule::unique('users','username')],
            'email'    => ['required','string','email','max:120', Rule::unique('users','email')],
            'password' => ['required','confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'username' => $data['username'],
            'email'    => $data['email'],
            // cast 'hashed' u modelu će hešovati plain text
            'password' => $data['password'],
            'role'     => User::ROLE_USER,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'identifier' => ['required','string'], // email ili username
            'password'   => ['required','string'],
        ]);

        $id = $data['identifier'];

        $user = filter_var($id, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $id)->first()
            : User::where('username', $id)->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out.']);
    }
 
}
