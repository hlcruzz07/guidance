<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/activity-logs/index', [
            'stats' => [
                'total' => ActivityLog::count(),
                'today' => ActivityLog::whereDate('created_at', Carbon::today())->count(),
                'creates' => ActivityLog::where('action', 'create')->count(),
                'updates' => ActivityLog::where('action', 'update')->count(),
                'deletes' => ActivityLog::where('action', 'delete')->count(),
                'logins' => ActivityLog::where('action', 'login')->count(),
            ],
        ]);
    }
}
