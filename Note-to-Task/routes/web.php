<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;


Route::get('/', function () {
    return view('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    route::get('notes', function () {
        return view('notes');
    })->name('notes');

    route::get('settings', function () {
        return view('settings');
    })->name('settings');
});

route::get('about', function () {
    return view('about');
})->name('about');


// login stuff
Route::post('/login', [UserController::class, 'login'])->name('loginProcess');
Route::get('/login', [UserController::class, 'showLoginPage'])->name('login');

// signup stuff
Route::post('/signup', [UserController::class, 'signup'])->name('signupProcess');
Route::get('/signup', [UserController::class, 'showSignupPage'])->name('signup');

// logout stuff
Route::post('/logout', [UserController::class, 'logout'])->name('logout');