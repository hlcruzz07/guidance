<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquityGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'equity_group',
        'proof',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
