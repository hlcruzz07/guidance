<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class CampusApiController extends Controller
{
    public function __construct(protected Student $model)
    {
    }

    public function fetchCourses(string $campus)
    {
        $response = $this->model::query()
            ->where('campus', $campus)
            ->distinct()
            ->orderBy('course', 'asc')
            ->pluck('course');

        return response()->json($response);
    }

    public function fetchYearLevels(string $campus, string $course)
    {
        $response = $this->model::query()
            ->where('campus', $campus)
            ->where('course', $course)
            ->distinct()
            ->orderBy('year_level', 'asc')
            ->pluck('year_level');

        return response()->json($response);
    }

    public function fetchSections(string $campus, string $course, string $year_level)
    {
        $response = $this->model::query()
            ->where('campus', $campus)
            ->where('course', $course)
            ->where('year_level', $year_level)
            ->distinct()
            ->orderBy('section', 'asc')
            ->pluck('section');

        return response()->json($response);
    }
}
