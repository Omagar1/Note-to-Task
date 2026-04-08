@extends('layouts.default')

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <div class="grid grid-cols-2 gap-4">
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
            <div class = "sticky top-0">
                <div x-data = 'noteComponents( @json($note) )' class="flex items-center mb-4">
                    <button x-show ="!editing" @click="editing = true, justSaved = false "><h1 x-text="title" class="text-4xl font-bold mb-4"></h1></button>
                    <input x-show="editing" @keydown.enter="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')" id="title" type="text" x-model="title" class="text-4xl font-bold border-2 border-gray-300 rounded-lg p-2 w-full" @blur="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')">
                </div>
                
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
                <button @click="rawText += '**bold**'">Bold</button>
                <button @click="rawText += '*italic*'">Italic</button>
                <button @click="rawText += '# Heading'">H1</button>
            </div>
            
            
            <textarea id="note" class="w-full h-full border-2 border-gray-300 rounded-lg p-4" placeholder="Write your note here...">
                {{ $note->content }}
            </textarea>
            

            
        </div>

        

        <div class="w-1/2 h-full flex flex-col items-center justify-center">
                <div class = "sticky top-0">
                    <h1 class="text-4xl font-bold mb-4">Tasks</h1> 
                    <!-- insert search bar code here once made   -->
                    <!-- insert filter code here once made   -->
                
                </div>
                
                
            
        </div>
    </div>
@endsection

@section('footer')

@endsection
    
