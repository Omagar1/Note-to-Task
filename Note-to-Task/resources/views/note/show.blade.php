@extends('layouts.default')

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <div class="grid grid-cols-2 gap-4">
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
            <div class = "sticky top-0">
                <div x-data = 'noteComponents( @json($note) )' class="flex items-center mb-4">
                    <button x-show ="!editingTitle" @click="editingTitle = true, justSaved = false "><h1 x-text="title" class="text-4xl font-bold mb-4"></h1></button>
                    <input x-show="editingTitle" @keydown.enter="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')" id="title" type="text" x-model="title" class="text-4xl font-bold border-2 border-gray-300 rounded-lg p-2 w-full" @blur="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')">
                </div>
                
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
                
            </div>
            <div x-data ='noteEditor({
                initialContent: @json($note->content),
                noteId: {{ $note->id }},
                route: @json(route("note.update_content")),
                csrfToken: @json(csrf_token())
            })' 
            x-init="init()" >
                <div x-ref="editor"></div>
            </div>
            

            

            
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
    
