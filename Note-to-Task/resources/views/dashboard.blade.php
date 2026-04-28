@extends('layouts.default')

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <h1 class="text-5xl font-bold mb-4"> Welcome {{ auth()->user()->username }}</h1>
    <div class="grid grid-rows-2 lg:grid-cols-2 gap-4">
        
        <div class="w-full h-full flex flex-col items-start justify-start content-start ">
            <div class = "sticky top-0 w-full bg-white p-4 shadow-md" >
                <h2 class="text-4xl font-bold mb-4">Note Pages:</h2> 
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
            </div>
            @foreach( $notes as $note)
                <div x-data="noteComponents({{ $note }})"  x-ref ="note{{ $note->id }}" x-show="!deleted" class="w-full flex items-start justify-start gap-1 transition-all transition-discrete duration-300 ease-in-out" >
                    <a href="{{ route('note.show', ['note' => $note]) }}" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" >
                        <div class="flex gap-4 items-start justify-start content-center"> 
                            <p class= "text-base">{{ $note->title }}</p> 
                            <p class="text-sm text-gray-300">Last Edited: {{ $note->updated_at->diffForHumans() }}</p>
                        </div>
                    </a>
                    <button @click="deleteNote('{{ route('note.delete') }}', '{{ csrf_token() }}')" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">
                        Delete
                    </button>
                </div>

            @endforeach

            @if (count($notes) < 1)
                <p>no notes at current</p>
            @endif

            <a href="{{ route('note.create') }}" class=" w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Create New Notes
            </a>
        </div>

        

        <div class="w-full h-full flex flex-col items-start justify-start content-start p-4">
                <div class = "sticky top-0">
                    <h2 class="text-4xl font-bold mb-4">Active Tasks:</h2> 
                    <!-- insert search bar code here once made   -->
                    <!-- insert filter code here once made   -->
                
                </div>
                
                @foreach( $tasks as $task)
                    <div  id="task{{ $task->id }}"  class="w-full flex items-start justify-start gap-1 transition-all transition-discrete duration-300 ease-in-out" >
                        <div class="w-auto flex flex-grow bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2">
                            <div class="flex gap-4 items-start justify-start content-center"> 
                                <p class= "text-base">{{ $task->title }}</p> 
                                <p class="text-sm text-gray-300">Last Edited: {{ $task->updated_at->diffForHumans() }}</p>
                            </div>
                        </div>
                        <a href="{{ route('note.show', ['note' => $notes->firstWhere('id', $task->made_from_note_id) ]) }}" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-2" >
                            Go to In Notes
                        </a>

                    </div>

                @endforeach
                

                
            
        </div>
    </div>

@endsection

@section('footer')
    <p>&copy; {{ date('Y') }} Note to Task. All rights reserved jk not actually just need something to put here.</p>
@endsection
    
