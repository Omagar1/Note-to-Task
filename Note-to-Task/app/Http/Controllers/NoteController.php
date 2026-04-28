<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Exception;
use Illuminate\Http\Request;
use Route;
use Throwable;
use App\Models\Task;
use App\Models\Keyword;



class NoteController extends Controller
{
    
    public function index()
    {
        // will also have tasks once made
        $notes = Note::where('user_id', auth()->id())->get();
        $tasks = Task::with('events')->whereHas('note_data', function ($qry){
            $qry->where('user_id', auth()->id());
        })->get();
        return view('dashboard', ['notes' => $notes, 'tasks' => $tasks]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //echo "create test";

        $newNotePage = Note::create([
            'title' => 'Notes on ' . now()->format('Y-m-d H:i:s'),
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('note.show', $newNotePage);

    }

    public function show(Note $note)
    {
        $tasks = Task::with(['events', 'sub_tasks'])->where('made_from_note_id', $note->id)->where('sub_task_of_task_id', null)->get();
        $keywords = Keyword::with('action_data')->where('user_id', auth()->id())->get();

        return view('note.show', ['note' => $note, 'tasks' => $tasks, 'keywords' => $keywords]);
    }




    /**
     * Update the specified resource in storage.
     */
    public function update_content(Request $request)
    {   
        try{
            //return response()->json(['message' => $request->input('content')]); //test
            request()->validate([
                'id' => 'required|integer|exists:notes,id',
            ]);

            $id = $request->input('id');
            $new_content = $request->input('content');

            $note = Note::findOrFail($id);
            $note->update(['content' => $new_content]);
            return response()->json(['message' => 'Content updated successfully']);
        } catch (Throwable $e){
            return response()->json(['message' => "error: ", $e]);
        }
    }

    public function update_title(Request $request)
    {
        //return response()->json(['message' => $request->input('title')]); //test
        request()->validate([
            'id' => 'required|integer|exists:notes,id',
            'title' => 'required|string|max:255',
        ]);

        $id = $request->input('id');
        $new_title = $request->input('title');

        $note = Note::findOrFail($id);
        $note->update(['title' => $new_title]);

        return response()->json(['message' => 'Title updated successfully']);
        // add error handling 
    }


    
    public function destroy(Request $request)
    {
        $id = $request->input('id');
        $note = Note::findOrFail($id);
        $note->delete();
        return response()->json(['message' => 'Note deleted successfully']);
    }
}
