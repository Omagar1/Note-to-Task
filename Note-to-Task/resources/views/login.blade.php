@extends('layouts.default')

@section('header')
    @include('partials.navbar')
    
@endsection


@section('mainContent')
    <legend class="text-2xl font-bold mb-4">Login</legend>
    <form action="{{ route('loginProcess') }}" method="POST" class="space-y-4">
        @csrf
        <div>
            <label for="email" class="block text-base font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base p-2">
        </div>
        <div>
            <label for="password" class="block text-base font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base p-2">
        </div>
        <button type="submit" class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Login</button>
    
    @if ($errors->any())
        <div>
            @foreach ($errors->all() as $error)
                <p class="text-red-500">{{ $error }}</p>
            @endforeach
        </div>
    @endif

    <p class="text-sm text-gray-600">
        Don't have an account? <a href="{{ route('signup') }}" class="text-blue-500 hover:text-blue-700"> Sign up here</a>
    </p>

    
    
@endsection


@section('footer')

@endsection