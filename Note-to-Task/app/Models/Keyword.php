<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Action;

class Keyword extends Model
{
    protected $fillable = [
        'trigger_word',
        'action_id',
        'user_id'
    ];

    public function action_data(){
        return $this->belongsTo(Action::class, "action_id");
    }

}
