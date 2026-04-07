<?php

namespace App\Http\Controllers;

use App\Models\Notes;
use Illuminate\Http\Request;
use Route;

class NotesController extends Controller
{
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //echo "create test";

        $newNotePage = Notes::create([
            'title' => 'Notes on ' . now()->format('Y-m-d H:i:s'),
            'user_id' => auth()->id(),
            'content' => ''
        ]);

        return redirect()->route('notes.show', $newNotePage);

    }

    public function show(Notes $notes) {
        return view('notes.show', ['notes' => $notes]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update_content(Request $request)
    {
        $id = $request->input('id');
        $new_content = $request->input('content');

        $note = Notes::findOrFail($id);
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

        $note = Notes::findOrFail($id);
        $note->update(['title' => $new_title]);

        return response()->json(['message' => 'Title updated successfully']);
        // add error handling 
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notes $notes)
    {
        //
    }
}
