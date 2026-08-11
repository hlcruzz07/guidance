<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/index');
    }

    /**
     * Show the admin dashboard with cached summary stats and recent activity.
     */
    public function dashboard()
    {
        $stats = [
            'total_students' => Student::count(),
            'new_this_week' => Student::where('created_at', '>=', now()->subWeek())->count(),
            'total_campuses' => Student::whereNotNull('campus')->distinct('campus')->count('campus'),
        ];

        $campusBreakdown = Student::select('campus', DB::raw('count(*) as total'))
            ->whereNotNull('campus')
            ->groupBy('campus')
            ->orderByDesc('total')
            ->get();

        $remarksByCampus = Student::select(
            'campus',
            DB::raw("SUM(CASE WHEN remarks IS NOT NULL AND remarks != '' THEN 1 ELSE 0 END) as remarked"),
            DB::raw("SUM(CASE WHEN remarks IS NULL OR remarks = '' THEN 1 ELSE 0 END) as not_remarked")
        )
            ->whereNotNull('campus')
            ->groupBy('campus')
            ->orderByDesc(DB::raw("SUM(CASE WHEN remarks IS NOT NULL AND remarks != '' THEN 1 ELSE 0 END) + SUM(CASE WHEN remarks IS NULL OR remarks = '' THEN 1 ELSE 0 END)"))
            ->get();

        return Inertia::render('admin/dashboard/index', [
            'stats' => $stats,
            'campusBreakdown' => $campusBreakdown,
            'remarksByCampus' => $remarksByCampus,
        ]);
    }

    public function redirect()
    {

        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        try {

            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {

                return redirect()->route('admin')->with('error', 'Invalid credentials');
            }

            $user->update([
                'name' => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
            ]);

            Auth::login($user);

            return redirect()->route('dashboard')->with('success', 'Welcome '.$user->name);

        } catch (Exception $e) {

            Log::error($e->getMessage());

            return redirect()->route('admin')->with('error', 'Something went wrong.');
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $request->session()->flush();

        return redirect()->route('admin')->with('success', 'Logged out successfully');
    }
}
