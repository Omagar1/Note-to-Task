<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Throwable;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    protected function get()
    {
        
    }

    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
        request()->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'made_from_note_id' => 'integer|exists:notes,id',
            'sub_task_of_task_id' => 'nullable|integer|exists:tasks,id'
        ]);

        $task = Task::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'made_from_note_id' => $request->input('made_from_note_id'),
            'sub_task_of_task_id' => $request->input('sub_task_of_task_id')
        ]);

        if ($task) {
            return response()->json(['message' => 'Task created successfully', 'id' => $task->id, 'sub_task_of_task_id'=> $request["sub_task_of_task_id"]]);
        } else {
            return response()->json(['message' => 'Failed to create task']);
        }
        
    }

    public function set_complete(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:tasks,id'
        ]); 

        $id = $request->input('id');
        $task = Task::findOrFail($id);

        if( $task->completed_at == null ){
            $task->update(['completed_at' => date('Y-m-d H:i:s') ]);
            // see if sub task to set the main task as complete too
            if($task->sub_task_of_task_id != null){
                $sub_tasks = $task->get_sub_tasks()->get();
                //$allSame = array_all($objects, fn($obj) => $obj->status === 'active');   
                $allComplete = array_all($sub_tasks, fn($sub_task) => $sub_task->completed_at != null);

                if($allComplete){
                    $main_task = Task::findOrFail($task->sub_task_of_task_id);
                    $main_task->update(['completed_at' => date('Y-m-d H:i:s') ]);
                }
            }

        }else{
            $task->update(['completed_at' => null ]);
            // see if sub task to set the main task as incomplete too
            if($task->sub_task_of_task_id != null){
                $main_task = Task::findOrFail($task->sub_task_of_task_id);
                $main_task->update(['completed_at' => null ]);
            }
        }
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {

        request()->validate([
            'id' => 'required|integer|exists:tasks,id',
            'title' => 'nullable|string|max:255',
            'deadline' => 'nullable|date'
        ]);

        try{
            $id = $request->input('id');
            $task = Task::findOrFail($id);
        
            $updateArr = [];
            if($request->exists('title')){
                $updateArr["title"] = $request->input('title');
            }

            if($request->exists('deadline')){
                $updateArr["deadline"] = $request->input('deadline');
            }

            $task->update($updateArr);

            return response()->json(['message' => 'Task updated successfully', "deadline" => $request->input('deadline')]);
        }catch (Throwable $e){
            return response()->json(['message' => "Task update failed ", "error" => $e->getMessage()], 500);
        }
        
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:tasks,id',
        ]);    

        $id = $request->input('id');
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}
