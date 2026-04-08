<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Route;

class NoteController extends Controller
{
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //echo "create test";

        $newNotePage = Note::create([
            'title' => 'Notes on ' . now()->format('Y-m-d H:i:s'),
            'user_id' => auth()->id(),
            'content' => ''
        ]);

        return redirect()->route('note.show', $newNotePage);

    }

    public function show(Note $note)
    {
        return view('note.show', ['note' => $note]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update_content(Request $request)
    {
        $id = $request->input('id');
        $new_content = $request->input('content');

        $note = Note::findOrFail($id);
        $note->update(['content' => $new_content]);
        return response()->json(['message' => 'Content updated successfully']);
        // add error handling 
    }

    public function update_title(Request $request)
    {
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


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        //
    }
}
