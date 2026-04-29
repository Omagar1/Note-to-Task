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
                <div x-show="!deleted" x-data='keywordComponents({{$keyword_data}}, { update: "{{ route("keyword.update") }}", delete: "{{ route("keyword.delete") }}"})'  class="w-full grid grid-cols-1 gap-4 p-4  rounded shadow transition-all transition-discrete duration-300 ease-in-out" >
                    
                    <h2> keyword: {{ $keyword_data->id }}</h2>
                    <div class ="grid, grid-cols-2">
                        <div class ="w-full flex items-center justify-start gap-2 py-2 content-center">
                            <label for="triggerWordInput{{ $keyword_data->id }}">Trigger word: </label>
                            <button x-show ="!editingTriggerWord" @click="editingTriggerWord = true, justSaved = false" class = "hover:bg-gray-100 rounded"><h3 x-text="triggerWord" class="font-bold border-gray-300 rounded-lg p-2 w-full"></h3></button>
                            <input x-show="editingTriggerWord" @keydown.enter="updateTriggerWord({{ $keyword_data->id }})" @blur="updateTriggerWord({{ $keyword_data->id }})"  id="triggerWordInput{{ $keyword_data->id }}" name="triggerWordInput{{ $keyword_data->id }}" type="text" x-model="triggerWord" class=" font-bold border-2 border-gray-300 rounded-lg p-2 w-full">
                        </div>
                        
                        <div class ="w-full flex items-center justify-start gap-2 py-2 content-center">
                            <label for="action{{ $keyword_data->id }}" > Creates a: </label>  
                            <select @keydown.enter="updateAction({{ $keyword_data->id }})" @blur="updateAction({{ $keyword_data->id }})" x-model="actionId" name="action{{ $keyword_data->id }}" id="action{{ $keyword_data->id }}">
                                @foreach ($actions as  $action_data)
                                    <option value="{{$action_data->id}}" {{ ($action_data->id == $keyword_data->action_data->id)? "selected" : ""}}>{{$action_data->name}}</option>
                                @endforeach
                            </select>

                            <!-- <select @keydown.enter="updateAction({{ $keyword_data->id }})" @blur="updateAction({{ $keyword_data->id }})" x-model="actionId" name="action{{ $keyword_data->id }}" id="action{{ $keyword_data->id }}">
                                @foreach ($actions as  $action_data)
                                    <option value="{{$action_data->id}}" {{ ($action_data->id == $keyword_data->action_data->id)? "selected" : ""}}>{{$action_data->description}}</option>
                                @endforeach
                            </select> -->
                        </div>

                        <div x-show="errors!=null">
                            <template x-for="error in errors">
                                <p x-text="error[0]" class = "text-red-500"></p>
                            </template>
                        </div>

                        <button @click="deleteKeyword()" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">
                            Delete
                        </button>
                    </div>
    
                </div>

            @endforeach

                @if (count($keywords) < 1)
                    <p>no Keywords at current</p>
                @endif
                <div id ="newKeywords" x-data = "keywordCreation('{{ route("keyword.create") }}', {{ $actions}})">
                    <template x-for="newKeywordData in newlyCreatedKeywords" :key="newKeywordData.id"> <!-- for when they have been made but the user haven't reloaded the page yet -->
                        <div x-show="!deleted" x-init="console.log('newKeywordData:', newKeywordData)" x-data='keywordComponents(newKeywordData , { update: "{{ route("keyword.update") }}", delete: "{{ route("keyword.delete") }}"})'   class="w-full grid grid-cols-1 gap-4 p-4  rounded shadow transition-all transition-discrete duration-300 ease-in-out" >
                            
                            <h2 x-text="'keyword:' + id"> keyword: </h2>
                            <div class ="grid, grid-cols-2">
                                <div class ="w-full flex items-center justify-start gap-2 content-center">
                                    <label :for="'triggerWordInput'+id">Trigger word: </label>
                                    <button x-show ="!editingTriggerWord" @click="editingTriggerWord = true, justSaved = false"><h3 x-text="triggerWord" class="font-bold border-gray-300 rounded-lg p-2 w-full"></h3></button>
                                    <input x-show="editingTriggerWord" @keydown.enter="updateTriggerWord(id)" @blur="updateTriggerWord(id)"  :id="'triggerWordInput'+id" name="'triggerWordInput'+id" type="text" x-model="triggerWord" class=" font-bold border-2 border-gray-300 rounded-lg p-2 w-full">
                                </div>
                                
                                <div>
                                    <label :for="'action'+id"> Creates a: </label>  
                                    <select @keydown.enter="updateAction(id)" @blur="updateAction(id)" x-model="actionId" :name="'action'+id" :id="'action'+id">
                                        @foreach ($actions as  $action_data)
                                            <option value="{{$action_data->id}}" >{{$action_data->name}}</option>
                                        @endforeach
                                    </select>
                                </div>

                                <div x-show="errors!=null">
                                    <template x-for="error in errors">
                                        <p x-text="error[0]" class = "text-red-500"></p>
                                    </template>
                                </div>

                                <button @click="deleteKeyword()" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">
                                    Delete
                                </button>
                            </div>
            
                        </div>
                    </template>
                    <div x-show="isCreating"  class="w-full grid grid-cols-1 gap-1 p-4  rounded shadow transition-all transition-discrete duration-300 ease-in-out" >
                            
                            <h2> New Keyword:</h2>
                            <div class ="grid, grid-cols-2">
                                <div>
                                    <label for="newTriggerWordInput">Trigger word: </label>
                                    <input x-model="newTriggerWord" name="newTriggerWordInput" id="newTriggerWordInput" type="text" class="font-bold border-2 border-gray-300 rounded-lg p-2 w-full">
                                </div>
                                
                                <div>
                                    <label for="newAction" > Creates a: </label>  
                                    <select x-model="newActionId" name="newAction" id="newAction">
                                            <option value="null" selected>select an action</option>
                                        @foreach ($actions as  $action_data)
                                            <option value="{{$action_data->id}}" >{{$action_data->name}}</option>
                                        @endforeach
                                    </select>
                                </div>

                                <div x-show="errors!=null">
                                    <template x-for="error in errors">
                                        <p x-text="error[0]" class = "text-red-500"></p>
                                    </template>
                                </div>
                            </div>
                        <div x-show="isCreating" class = "grid grid-cols-2 gap-2 p-2" >
                            <button @click="submitNewKeyword()"  class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Finnish Making keyword
                            </button>
                            <button @click="stopMakingNewKeyword()"  class="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Cancel Making keyword
                            </button>
                        </div>
                    </div>

                    <button @click="isCreating = true" x-show="!isCreating" class="sticky bottom-15 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Create New keyword
                    </button>
                
                </div>
            </div>
        </div>
    </div>

@endsection

@section('footer')

@endsection

