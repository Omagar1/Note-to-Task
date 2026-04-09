<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TaskController;
use Symfony\Component\Routing\Loader\Configurator\Routes;


Route::get('/', function () {
    return view('login');
});

// post login stuff (it's secure) 
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [NoteController::class, 'index'])->name('dashboard');

    Route::resource('note', NoteController::class);
    Route::post('/note/update_content', [NoteController::class, 'update_content'])->name('note.update_content');
    Route::post('/note/update_title', [NoteController::class, 'update_title'])->name('note.update_title');
    Route::post('/note/delete', [NoteController::class, 'destroy'])->name('note.delete');

    Route::resource('task', TaskController::class);

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