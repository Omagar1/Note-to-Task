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
                <div  id="taskContainer" x-data="taskActions()" x-init=' init({{ $note->id }}, {create: "{{ route("task.create") }}" , update: "{{ route("task.update") }}" , delete: "{{ route("task.delete") }}", toggleComplete: "{{ route("task.toggleComplete") }}" }, @json($tasks)) ' @task-detected.window ="detectTask($event.detail)" @deadline-detected.window="detectDeadline($event.detail)" class="grid grid-cols-1 gap-4"  >

                    <template x-for="task in tasks" :key="task.id">
                        <div @mouseenter="highlightTask(task.id)" @mouseleave="unhighlightTask(task.id)"  class="flex flex-col gap-4 p-6 bg-blue-500 rounded shadow-md text-white hover:bg-orange-500 transition-colors transform  ease-in-out duration-300">
                            <div class ="w-full flex items-start justify-start gap-4">
                            <h3 x-text="task.title" class = "text-balance text-xl lg:text-2xl font-bold text-on-surface-strong dark:text-on-surface-dark-strong bg-on-surface-strong dark:bg-on-surface-dark-strong "></h3>
                                <div x-show="(task.deadline != null)" class="bg-white rounded-full text-black p-1" >
                                    <label :for="'deadline'+task.id">Deadline: </label>
                                    <input @input="updateDeadlineFromTaskCard(task.id)" x-model="task.deadline" :id="'deadline'+task.id" :name = "'deadline'+task.id" type="datetime-local" >
                                </div>
                            </div>
                            <ul>
                                <template x-for="subTask in task.sub_tasks" :key="subTask.id">
                                    <li>
                                        <label x-text="subTask.title" :for="'check-box-for-subtask-'+ subTask.id" class="text-balance place-self-center" ></label>
                                        <input @change="toggleTaskComplete(subTask.id, task.id)" type="checkbox" :id="'check-box-for-subtask-'+ subTask.id " :name="'check-box-for-subtask-'+ subTask.id"  :value="subTask.id" :checked ="(subTask.completed_at != null)" class = "w-4 h-4 place-self-center border rounded-lg bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft" >
                                        <span x-show="(subTask.completed_at != null)"  x-text= "`completed: ${helperScripts.diffForHumans(subTask.completed_at)}`" class = "bg-green-500 p-1 rounded-full"></span>
                                        
                                    </li>
                                    
                                </template>

                            </ul>
                            <div x-show="(!(task.sub_tasks) || task.sub_tasks.length <=0)" class ="w-full flex items-start justify-start gap-4" >
                                <label :for="'check-box-for-task-'+ task.id" class=" text-balance place-self-center" >Complete:</label>
                                <input @change="toggleTaskComplete(task.id)" type="checkbox" :id="'check-box-for-task-'+ task.id" :name="'check-box-for-task-'+ task.id"  :value="task.id" :checked ="(task.completed_at != null)" class = "w-4 h-4 place-self-center border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft">
                                <span  x-show="(task.completed_at != null)" x-text="'completed: '+ helperScripts.diffForHumans(task.completed_at)" class = " place-self-center bg-green-500 p-1 rounded-full transition-opacity "> test</span> 
                            </div>           

                            
                        </div>
                    </template>


                    <p x-show="(tasks.length <= 0)" x-ref = "noTaskMsg">no tasks generated yet, to generate a task use the keyword task e.g.: "task: do stuff" creates task a task with title do stuff </p>
                    
                </div>
                
            
        </div>
    </div>
@endsection

@section('footer')

@endsection

