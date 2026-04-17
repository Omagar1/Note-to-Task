<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
