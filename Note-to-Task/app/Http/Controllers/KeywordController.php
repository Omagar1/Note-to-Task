<?php

namespace App\Http\Controllers;

use App\Models\Keyword;
use App\Models\Action;
use Illuminate\Http\Request;
use Throwable;

class KeywordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $keywords = Keyword::where('user_id', auth()->id())->with('action_data')->get();
        $actions = Action::all();

        return view('keyword.show', ["keywords"=> $keywords, "actions" => $actions]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        request()->validate([
            'trigger_word' => 'required|unique|string|max:255',
            'action_id' => 'required|integer|exists:actions,id'
        ]);

        $task = Keyword::create([
            'trigger_word' => $request->input('trigger_word'),
            'action_id' => $request->input('action_id'),
        ]);

        if ($task) {
            return response()->json(['message' => 'Task created successfully']);
        } else {
            return response()->json(['message' => 'Failed to create task']);
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Keyword $keyword)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Keyword $keyword)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {

        try{

            request()->validate([
                'id' => 'required|integer|exists:keywords,id',
                'trigger_word' => 'sometimes|unique:keywords,trigger_word|string|max:255',
                'action_id' => 'sometimes|integer|exists:actions,id'
                
            ]);

            $id = $request->input('id');
            $keyword = Keyword::findOrFail($id);
        
            $updateArr = [];
            if($request->exists('trigger_word')){
                $updateArr["trigger_word"] = $request->input('trigger_word');
            }

            if($request->exists('action_id')){
                $updateArr["action_id"] = $request->input('action_id');
            }

            $keyword->update($updateArr);

            return response()->json(['message' => 'keyword updated successfully', 'id' => $id ]);
        }catch (Throwable $e){
            return response()->json(['message' => "keyword update failed ", "error" => $e->getMessage(), 'id' => $id, 'dd'=> dd($request->all())], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:keywords,id',
        ]);    

        $id = $request->input('id');
        $task = Keyword::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Keyword deleted successfully']);
    }
}
