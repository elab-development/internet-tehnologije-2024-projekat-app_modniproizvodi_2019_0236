<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/*
|--------------------------------------------------------------------------
| Public (no auth)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',          [AuthController::class, 'me']);
    Route::post('/logout',     [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
});



 

// Javni endpointi za front (listanje + detalj)
Route::apiResource('products', ProductController::class)->only(['index','show']);
Route::apiResource('categories', CategoryController::class)->only(['index','show']);

// Ako imaš admin panel / autentikaciju – onda omogući CRUD:
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class)->only(['store','update','destroy']);
    Route::apiResource('categories', CategoryController::class)->only(['store','update','destroy']);
});