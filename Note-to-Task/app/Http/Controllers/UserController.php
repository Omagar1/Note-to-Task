<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Keyword;
use App\models\Action;

class UserController extends Controller
{
    public function showLoginPage() // to show the login/signup page
    {
        
        return view('login');
    }
    public function showSignupPage() // to show the login/signup page
    {
        
        return view('signup');
    }

    public function login(Request $request) // to handle the login process
    {
        $request->validate([
            'email' => 'required|string|email|max:255|exists:users,email',
            'password' => 'required|string|min:8|',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'incorrect email or password.',
        ]);
    }

    public function signup(Request $request) // to handle the signup process
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // adding default keywords to user's profile based off actions table
        $actions = Action::all();
        $keywords = [];
        foreach($actions as $actionData){
            array_push($keywords, ["trigger_word" => $actionData->default_trigger_word, "action_id" =>  $actionData->id, "user_id" => $user->id]);
        }

        Keyword::insert($keywords);



        Auth::login($user);

        return redirect()->intended('dashboard');
    }

    public function logout(Request $request) // to handle the logout process
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
