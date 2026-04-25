<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Keyword;
class Action extends Model
{
    public function keywords()
    {
        return $this->hasMany(Keyword::class, 'action_id');
    }
}
