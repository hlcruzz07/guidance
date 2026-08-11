<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntityDropdown extends Model
{
    protected $fillable = [
        'name',
        'dropdowns',
    ];

    protected $casts = [
        'dropdowns' => 'array',
    ];
}
