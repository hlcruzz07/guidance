<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class PsychTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'date_taken',
        'test_name',
        'test_result',
        'interpretation',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
