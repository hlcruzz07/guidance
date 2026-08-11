<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sibling extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'fname',
        'mname',
        'lname',
        'gender',
        'birthdate',
        'is_employed',
    ];

    protected $casts = [
        'is_employed' => 'boolean',
    ];

    protected $appends = ['full_name'];

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(' ', array_filter([
                $this->fname,
                $this->mname ? mb_strtoupper(mb_substr($this->mname, 0, 1)).'.' : null,
                $this->lname,
            ])))
        );
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
