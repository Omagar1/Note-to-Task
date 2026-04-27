<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Note;

class Task extends Model
{
    protected $fillable = [
        'title',
        'extra_info',
        'made_from_note_id',
        'sub_task_of_task_id',
        'completed_at',
        'deadline'
    ];

    public function note_data(){
        return $this->belongsTo(Note::class, "made_from_note_id");
    }

    public function sub_tasks()
    {
        return $this->hasMany(Task::class, 'sub_task_of_task_id');
    }
}
