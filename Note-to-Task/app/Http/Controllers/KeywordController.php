<?php

namespace App\Http\Controllers;

use App\Models\Keyword;
use App\Models\Action;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
            'trigger_word' => ['required', 'string', 'max:255', Rule::unique('keywords', 'trigger_word')->where('user_id', auth()->id()) ],
            'action_id' => 'required|integer|exists:actions,id'
        ]);

        $keyword = Keyword::create([
            'trigger_word' => $request->input('trigger_word'),
            'action_id' => $request->input('action_id'),
            'user_id' => auth()->id()
        ]);

        if ($keyword) {
            return response()->json(['message' => 'keyword created successfully', 'id'=>$keyword->id  ]);
        } else {
            return response()->json(['message' => 'Failed to create keyword']);
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

            request()->validate([
                'id' => 'required|integer|exists:keywords,id',
                'trigger_word' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('keywords', 'trigger_word')->where('user_id', auth()->id()) ],
                'action_id' => 'sometimes|required|integer|exists:actions,id'
                
            ]);

            $id = $request->input('id');
            $keyword = Keyword::findOrFail($id);
        
            $updateArr = [];
            if($request->filled('trigger_word')){
                $updateArr["trigger_word"] = $request->input('trigger_word');
            }

            if($request->filled('action_id')){
                $updateArr["action_id"] = $request->input('action_id');
            }

            $keyword->update($updateArr);

            return response()->json(['message' => 'keyword updated successfully', 'id' => $id, 'updateArr' => $updateArr]);
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
