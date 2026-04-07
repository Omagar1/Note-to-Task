@extends('layouts.default')

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <div class="grid grid-cols-2 gap-4">
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
            <div class = "sticky top-0">
                <h1 class="text-4xl font-bold mb-4">Note Pages:</h1> 
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
            </div>
            <!-- insert  code to get titles of all notes pages here -->

            <a href="{{ route('notes.create') }}" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Create New Notes
            </a>
        </div>

        

        <div class="w-1/2 h-full flex flex-col items-center justify-center">
                <div class = "sticky top-0">
                    <h1 class="text-4xl font-bold mb-4">Active Tasks</h1> 
                    <!-- insert search bar code here once made   -->
                    <!-- insert filter code here once made   -->
                
                </div>
                <!-- insert  code to get titles of all tasks here -->

                
            
        </div>
    </div>

@endsection

@section('footer')

@endsection
    
