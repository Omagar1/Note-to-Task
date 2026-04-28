<?php

namespace App\Http\Controllers;

use App\Models\Event; 
use Illuminate\Http\Request;
use Throwable;

class EventController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        request()->validate([
            'title' => 'required|string|max:255',
            'task_id' => 'required|integer|exists:tasks,id',
            'event_date_time' => 'required|date_format:Y-m-d H:i:s'
        ]);

        $event = Event::create([
            'title' => $request->input('title'),
            'task_id' => $request->input('task_id'),
            'event_date_time' => $request->input('event_date_time')

        ]);

        if ($event) {
            return response()->json(['message' => 'Event created successfully', 'id' => $event->id]);
        } else {
            return response()->json(['message' => 'Failed to create Event']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:events,id',
            'event_date_time' => 'required|date_format:Y-m-d H:i:s'
        ]);

        try{
            $id = $request->input('id');
            $event = Event::findOrFail($id);
        
            
            $event->update([
                'event_date_time' => $request->input('event_date_time')
            ]);

            return response()->json(['message' => 'Event updated successfully']);
        }catch (Throwable $e){
            return response()->json(['message' => "Event update failed ", "error" => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        request()->validate([
            'id' => 'required|integer|exists:events,id',
        ]);    

        $id = $request->input('id');
        $task = Event::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
