<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    public function __construct(protected Student $model) {}

    public function paginate(Request $request)
    {
        $filters = $request->validate([
            'type' => 'nullable|string',
            'course' => 'nullable|string',
            'campus' => 'nullable|string',
            'section' => 'nullable|string',
            'year_level' => 'nullable|string',
            'gender' => 'nullable|string',
            'status' => 'nullable|string',
            'search' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'sort' => 'nullable|string',
            'order' => 'nullable|in:asc,desc',
            'show' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $this->model->query()->with(['guardians', 'siblings', 'educations', 'psychTests', 'equityGroups', 'concerns', 'counselor']);

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', $search)
                    ->orWhere('id', 'like', $search)
                    ->orWhere('fname', 'like', $search)
                    ->orWhere('mname', 'like', $search)
                    ->orWhere('lname', 'like', $search)
                    ->orWhere('suffix', 'like', $search)
                    ->orWhereRaw("CONCAT_WS(' ', fname, mname, lname, suffix) LIKE ?", [$search]);
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['campus'])) {
            $query->where('campus', $filters['campus']);
        }

        if (! empty($filters['course'])) {
            $query->where('course', $filters['course']);
        }

        if (! empty($filters['year_level'])) {
            $query->where('year_level', $filters['year_level']);
        }

        if (! empty($filters['section'])) {
            $query->where('section', $filters['section']);
        }

        if (! empty($filters['date_from']) && ! empty($filters['date_to'])) {
            if ($filters['date_from'] === $filters['date_to']) {
                $query->whereDate('created_at', '=', $filters['date_from']);
            } else {
                $query->whereDate('created_at', '>=', $filters['date_from'])
                    ->whereDate('created_at', '<=', $filters['date_to']);
            }
        }

        $sortable = ['id', 'fname', 'lname', 'email', 'gender', 'campus', 'course', 'created_at', 'updated_at'];
        $sort = in_array($filters['sort'] ?? null, $sortable, true) ? $filters['sort'] : 'id';
        $order = in_array(strtolower($filters['order'] ?? ''), ['asc', 'desc'], true) ? $filters['order'] : 'desc';

        $query->orderBy($sort, $order);

        $show = $filters['show'] ?? 10;

        return $query->paginate($show);
    }
}
