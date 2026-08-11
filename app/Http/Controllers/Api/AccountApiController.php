<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AccountApiController extends Controller
{
    public function __construct(protected User $model) {}

    public function paginate(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string',
            'sort' => 'nullable|string',
            'order' => 'nullable|in:asc,desc',
            'show' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $this->model->query()->with(['roles', 'permissions']);

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', $search)
                    ->orWhere('name', 'like', $search);
            });
        }
        $sortable = ['id', 'fname', 'lname', 'email', 'gender', 'campus', 'course', 'created_at', 'updated_at'];
        $sort = in_array($filters['sort'] ?? null, $sortable, true) ? $filters['sort'] : 'id';
        $order = in_array(strtolower($filters['order'] ?? ''), ['asc', 'desc'], true) ? $filters['order'] : 'desc';

        $query->orderBy($sort, $order);

        $show = $filters['show'] ?? 10;

        return $query->paginate($show);
    }
}
