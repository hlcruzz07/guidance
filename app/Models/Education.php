<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    use HasFactory;

    protected $fillable = [

        'student_id',
        'education_level',
        'school_name',
        'school_type',
        'year_covered',
        'honor_receieved',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
