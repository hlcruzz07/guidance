<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogApiController extends Controller
{
    public function __construct(protected ActivityLog $model) {}

    public function paginate(Request $request)
    {
        $query = ActivityLog::query()->with('user');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($action = $request->string('action')->value()) {
            $query->where('action', $action);
        }

        if ($dateFrom = $request->string('date_from')->value()) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->string('date_to')->value()) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();
    }
}
