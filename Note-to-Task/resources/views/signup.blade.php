@extends('layouts.default')

@section('header')
    <nav class="bg-gray-800 p-4">
        <div class="container mx-auto flex items-center justify-between">
            <p class="text-white text-lg font-semibold">Note to Task</p>
            <div>
                <a href="{{ route('login') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
                <a href="{{ route('signup') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign up</a>
            </div>
        </div>
    
@endsection


@section('mainContent')
    <legend class="text-2xl font-bold mb-4">Sign Up</legend>
    <form action="{{ route('signupProcess') }}" method="POST" class="space-y-4">
        @csrf
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" id="username" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="password_confirmation" id="password_confirmation" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <button type="submit" class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Sign Up</button>

    @if ($errors->any())
        <div>
            @foreach ($errors->all() as $error)
                <p class="text-red-500">{{ $error }}</p>
            @endforeach
        </div>
    @endif
        
    
    <p class="text-sm text-gray-600">
        Already have an account? <a href="{{ route('login') }}" class="text-blue-500 hover:text-blue-700"> Log in here</a>
    </p>
    
@endsection


@section('footer')

@endsection