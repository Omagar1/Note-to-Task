<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Task;

class Event extends Model
{
    protected $fillable = [
        'task_id',
        'title',
        'event_date_time'
    ];

    public function task_data(){
        return $this->belongsTo(Task::class, "task_id");
    }
}
