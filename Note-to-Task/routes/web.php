<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\TaskController;
use Symfony\Component\Routing\Loader\Configurator\Routes;


Route::get('/', function () {
    return view('login');
});

// post login stuff (it's secure) 
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    Route::resource('notes', NotesController::class);
    Route::post('/notes/update_content', [NotesController::class, 'update_content'])->name('notes.update_content');
    Route::post('/notes/update_title', [NotesController::class, 'update_title'])->name('notes.update_title');

    Route::resource('tasks', TaskController::class);

    Route::get('settings', function () {
        return view('settings');
    })->name('settings');
});

Route::get('about', function () {
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