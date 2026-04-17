<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

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
        ]);

        $task = Task::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'made_from_note_id' => $request->input('made_from_note_id'),
        ]);

        if ($task) {
            return response()->json(['message' => 'Task created successfully', 'id' => $task->id]);
        } else {
            return response()->json(['message' => 'Failed to create task']);
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:tasks,id',
            'title' => 'required|string|max:255',
        ]);

        $id = $request->input('id');
        $task = Task::findOrFail($id);
        $task->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
        ]);

        return response()->json(['message' => 'Task updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        //
    }
}
