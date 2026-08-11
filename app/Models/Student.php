<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_number',
        'campus',
        'fname',
        'mname',
        'lname',
        'suffix',
        'email',
        'phone',
        'type',
        'course',
        'year_level',
        'section',
        'gender',
        'civil_status',
        'sexual_orientation',
        'height',
        'weight',
        'religion',
        'date_of_birth',
        'place_of_birth',
        'nationality',
        'last_school_attended',
        'general_average',
        'strand_course',
        'scholarship',
        'parent_marital_relationship',
        'birth_order',
        'financer',
        'weekly_allowance',
        'household_income',
        'nature_of_residence',
        'home_address',
        'current_address',
        'contact_person',
        'contact_person_address',
        'contact_person_mobile_um',
        'contact_person_relationship',
        'remarked_at',
        'remarks',
        'e_signature',
        'remark_by',
    ];

    protected $appends = ['full_name', 'course_year_section'];

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(' ', array_filter([
                $this->fname,
                $this->mname ? mb_strtoupper(mb_substr($this->mname, 0, 1)).'.' : null,
                $this->lname,
                $this->suffix ?: null,
            ])))
        );
    }

    public function courseYearSection(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(' ', array_filter([
                $this->course,
                $this->year_level.'-'.$this->section,
            ])))
        );
    }

    public function guardians()
    {
        return $this->hasMany(Guardian::class, 'student_id');
    }

    public function educations()
    {
        return $this->hasMany(Education::class, 'student_id');
    }

    public function siblings()
    {
        return $this->hasMany(Sibling::class, 'student_id');
    }

    public function psychTests()
    {
        return $this->hasMany(PsychTest::class, 'student_id');
    }

    public function equityGroups()
    {
        return $this->hasMany(EquityGroup::class, 'student_id');
    }

    public function concerns()
    {
        return $this->hasMany(Concern::class, 'student_id');
    }

    public function counselor()
    {
        return $this->belongsTo(User::class, 'remark_by');
    }
}
