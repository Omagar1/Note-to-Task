<?php

namespace App\Models;

use GuzzleHttp\Promise\TaskQueue;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\User;

class Note extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'content',
    ];

    public function user_data(){
        return $this->belongsTo(User::class, "made_from_note_id");
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'made_from_note_id');
    }

}
