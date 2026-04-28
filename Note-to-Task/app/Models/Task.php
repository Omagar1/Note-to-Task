<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Note;
use App\Models\Event;

class Task extends Model
{
    protected $fillable = [
        'title',
        'made_from_note_id',
        'sub_task_of_task_id',
        'completed_at',
    ];

    public function note_data(){
        return $this->belongsTo(Note::class, "made_from_note_id");
    }

    public function sub_tasks()
    {
        return $this->hasMany(Task::class, 'sub_task_of_task_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'task_id');
    }
}
