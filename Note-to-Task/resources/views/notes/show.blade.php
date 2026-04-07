@extends('layouts.default')

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <script>
        function noteData(note){
            return {
                editing: false,
                    title: '{{ $notes->title }}',
                    justSaved: false,
                    async updateTitle() {
                        // start saving notification here once made
                        if (this.justSaved) {
                            return; // prevent multiple saves if already just saved
                        }
                        else if (this.title === '@json($notes->title)') {
                            this.editing = false; // no change so no need to save
                            return;
                        } 
                        else {
                            this.editing = false;
                            this.justSaved = true; // set flag to prevent immediate subsequent saves

                            try {
                                const response = await fetch('{{ route("notes.update_title") }}'), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-TOKEN': '@json(csrf_token())'
                                    },
                                    body: JSON.stringify({ title: this.title,
                                        id: @json($notes->id)
                                });

                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }

                                const data = await response.json();
                                console.log(data.message);
                                // show success notification here once made
                            } catch (error) {
                                console.error('Error updating title:', error);
                                // show error notification here once made
                            }

                        }
                    }
                }
            }
        }
    </script>
    <div class="grid grid-cols-2 gap-4">
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
            <div class = "sticky top-0">
                <div x-data = "noteData(@json($notes))" class="flex items-center mb-4">
                    <button x-show ="!editing" @click="editing = true, justSaved = false "><h1 x-text="title" class="text-4xl font-bold mb-4"></h1></button>
                    <input x-show="editing" @keydown.enter="updateTitle()" id="title" type="text" x-model="title" class="text-4xl font-bold border-2 border-gray-300 rounded-lg p-2 w-full" @blur="updateTitle">
                </div>
                
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
                <button @click="rawText += '**bold**'">Bold</button>
                <button @click="rawText += '*italic*'">Italic</button>
                <button @click="rawText += '# Heading'">H1</button>
            </div>
            
            
            <textarea id="notes" class="w-full h-full border-2 border-gray-300 rounded-lg p-4" placeholder="Write your notes here...">
                {{ $notes->content }}
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
    
