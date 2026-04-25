@extends('layouts.default')

@section('headExtras')
    
@endsection

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')



    <div class="w-full h-full flex flex-col items-center justify-start content-center ">
            <div class = "sticky top-0 w-full bg-white p-4 " >
                <h1 class="text-4xl font-bold mb-4">Keywords:</h1> 
            </div>
            <div id="keywordContainer" class = " w-full grid grid-cols-1 gap-4">
            @foreach ($keywords as $keyword_data )
                <div x-show="!deleted" x-data='keywordComponents({{$keyword_data}}, { update: "{{ route("keyword.update") }}", delete: "{{ route("keyword.delete") }}"})' x-ref ="note{{ $keyword_data->id }}"  class="w-full grid grid-cols-1 gap-1 p-4  rounded shadow transition-all transition-discrete duration-300 ease-in-out" >
                    
                    <h2> keyword: {{ $keyword_data->id }}</h2>
                    <div class ="grid, grid-cols-2">
                        <div>
                            <label>Trigger word: </label>
                            <button x-show ="!editingTriggerWord" @click="editingTriggerWord = true, justSaved = false"><h3 x-text="triggerWord" class="font-bold border-gray-300 rounded-lg p-2 w-full"></h3></button>
                            <input x-show="editingTriggerWord" @keydown.enter="updateTriggerWord({{ $keyword_data->id }})" @blur="updateTriggerWord({{ $keyword_data->id }})"  id="triggerWordInput{{ $keyword_data->id }}" type="text" x-model="triggerWord" class=" font-bold border-2 border-gray-300 rounded-lg p-2 w-full">
                        </div>
                        
                        <div>
                            <label> Creates a: </label>  
                            <p class="text-base">{{ $keyword_data->actionData->name}}</p>
                        </div>
                        <button @click="deleteKeyword()" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">
                            Delete
                        </button>
                    </div>
    
                </div>

            @endforeach

            @if (count($keywords) < 1)
                <p>no notes at current</p>
            @endif

            <button click="showCreation()" class="sticky bottom-15 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Create New keyword
            </button>
            </div>
        </div>
    </div>

@endsection

@section('footer')

@endsection

