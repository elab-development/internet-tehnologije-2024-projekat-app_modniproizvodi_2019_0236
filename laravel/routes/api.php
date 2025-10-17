<?php

use App\Http\Controllers\Api\AdminMetricsController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\OrderController;

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



// Javno (guest checkout): kreiranje narudžbine iz korpe
Route::post('/orders', [OrderController::class, 'store']);

// Za administraciju / ulogovane (prilagodi middlewares po potrebi)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/orders',              [OrderController::class, 'index']);
    Route::get('/orders/{order}',      [OrderController::class, 'show']);
    Route::patch('/orders/{order}',    [OrderController::class, 'update']);
    Route::delete('/orders/{order}',   [OrderController::class, 'destroy']);

    // Stavke narudžbine (u istom kontroleru)
    Route::post('/orders/{order}/items',                                 [OrderController::class, 'addItem']);
    Route::patch('/orders/{order}/items/{item}',                         [OrderController::class, 'updateItem']);
    Route::delete('/orders/{order}/items/{item}',                        [OrderController::class, 'removeItem']);

    // Promena statusa (kratka ruta)
    Route::patch('/orders/{order}/status',                               [OrderController::class, 'updateStatus']);
});


// Javno: slanje poruke sa sajta
Route::post('/contact-messages', [ContactMessageController::class, 'store']);

// Admin za pregled / obradu (primer middleware-a; prilagodi po tvom projektu)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/{message}', [ContactMessageController::class, 'show']);
    Route::patch('/contact-messages/{message}/process', [ContactMessageController::class, 'process']);
    Route::delete('/contact-messages/{message}', [ContactMessageController::class, 'destroy']);

    Route::get('/admin/overview', [AdminMetricsController::class, 'overview']);
});