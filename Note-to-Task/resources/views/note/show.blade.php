@extends('layouts.default')

@section('headExtras')
    @include('components.head.tinymce-config')

@endsection

@section('header')
    @include('partials.navbar')
@endsection


@section('mainContent')
    <div class="grid grid-rows-2 lg:grid-cols-2 gap-4">
        <div class="grid grid-cols-1 gap-2 items-start justify-start content-start p-4">
            <div class = "top-0">
                <div x-data = 'noteComponents( @json($note) )' class="flex items-center mb-4 hover:bg-gray-100 rounded transition-colors duration-300" >
                    <button x-show ="!editingTitle" @click="editingTitle = true, justSaved = false"><h1 x-text="title" class="text-4xl font-bold border-gray-300 rounded-lg p-2 w-full"></h1></button>
                    <input x-show="editingTitle" @keydown.enter="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')" id="title" type="text" x-model="title" class="text-4xl font-bold border-2 border-gray-300 rounded-lg p-2 w-full" @blur="updateTitle('{{ route("note.update_title") }}', '{{ csrf_token() }}')">
                </div>
                
                <!-- insert search bar code here once made   -->
                <!-- insert filter code here once made   -->
                
            </div>

            <div  x-data='noteEditor({ initialContent: @json($note->content), noteId: {{ $note->id }}, route: @json(route("note.update_content")), csrfToken: @json(csrf_token()) })' x-init="init()" class="shadow-md " >
                <textarea id="note-content" ></textarea>
            </div>
        </div>


        <div class="grid grid-cols-1 gap-2 items-start justify-start content-start p-4">
                <div class = "top-0">
                    <h1 class="text-4xl font-bold mb-4">Tasks</h1> 
                    <!-- insert search bar code here once made   -->
                    <!-- insert filter code here once made   -->
                </div>
                <div  id="taskContainer" x-data="taskActions()" x-init=' init({{ $note->id }}, {create: "{{ route("task.create") }}" , update: "{{ route("task.update") }}" , delete: "{{ route("task.delete") }}", get_sub_tasks: "{{ route("task.get_sub_tasks") }}" }, @json($tasks)) ' @task-detected.window ="detectTask($event.detail)" class="grid grid-cols-1 gap-4"  >

                    <template x-for="task in tasks" :key="task.id">
                        <div @mouseenter="highlightTask(task.id)" @mouseleave="unhighlightTask(task.id)"  class="flex flex-col gap-4 p-6 bg-blue-500 rounded shadow-md text-white hover:bg-orange-500 transition-colors duration-300">
                            <h3 x-text="task.title" class = "text-balance text-xl lg:text-2xl font-bold text-on-surface-strong dark:text-on-surface-dark-strong bg-on-surface-strong dark:bg-on-surface-dark-strong "></h3>

                            <ul>
                                <template x-for="subTask in task.sub_tasks" :key="subTask.id">
                                    <li>
                                        <label x-text="subTask.title" class="text-balance" :for="'check-box-for-subtask-'+ subTask.id" ></label>
                                        <input type="checkbox" :id="'check-box-for-subtask-'+ subTask.id " :name="'check-box-for-subtask-'+ subTask.id"  :value="subTask.id" class = "after:content-[''] peer relative size-4 appearance-none overflow-hidden rounded-sm border border-outline bg-surface-alt before:absolute before:inset-0 checked:border-success checked:before:bg-success focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-success active:outline-offset-0 disabled:cursor-not-allowed dark:border-outline-dark dark:bg-surface-dark-alt dark:checked:border-success dark:checked:before:bg-success dark:focus:outline-outline-dark-strong dark:checked:focus:outline-success">
                                    </li>
                                    
                                </template>

                            </ul>


                            <!-- <label for="checkboxSuccess" class="flex items-center gap-2 text-sm font-medium text-on-surface dark:text-on-surface-dark has-checked:text-on-surface-strong dark:has-checked:text-on-surface-dark-strong has-disabled:opacity-75 has-disabled:cursor-not-allowed">
                                <span class="relative flex items-center">
                                    <input id="checkboxSuccess" type="checkbox" class="after:content-[''] peer relative size-4 appearance-none overflow-hidden rounded-sm border border-outline bg-surface-alt before:absolute before:inset-0 checked:border-success checked:before:bg-success focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-success active:outline-offset-0 disabled:cursor-not-allowed dark:border-outline-dark dark:bg-surface-dark-alt dark:checked:border-success dark:checked:before:bg-success dark:focus:outline-outline-dark-strong dark:checked:focus:outline-success" />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="4" class="pointer-events-none invisible absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-on-success peer-checked:visible dark:text-on-success-dark">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                                    </svg>
                                </span>
                            </label> -->
                        </div>
                    </template>

                    <p x-show="(tasks.length <= 0)" x-ref = "noTaskMsg">no tasks generated yet, to generate a task use the keyword task e.g.: "task: do stuff" creates task a task with title do stuff </p>
                    
                </div>
                
            
        </div>
    </div>
@endsection

@section('footer')

@endsection

