<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GoogleDriveFileController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/form', [StudentController::class, 'form'])->name('studentForm');
Route::post('/form/store', [StudentController::class, 'store'])->name('storeStudent');

// Guest Routes asdasdasd adasdasd asd
Route::middleware('guest')->group(function () {
    Route::inertia('/', 'welcome')->name('home');
    Route::get('/admin', [AdminController::class, 'index'])->name('admin');

});

Route::get('/db-check', function () {
    $connections = [
        'Talisay' => 'tal_mysql',
        'Alijis' => 'ali_mysql',
        'Fortune Towne' => 'ft_mysql',
        'Binalbagan' => 'bin_mysql',
    ];

    $results = [];

    foreach ($connections as $campus => $connection) {
        try {
            DB::connection($connection)->getPdo();

            $results[$campus] = [
                'connection' => $connection,
                'status' => 'Connected',
                'message' => 'Database connection successful.',
            ];
        } catch (\Throwable $e) {
            $results[$campus] = [
                'connection' => $connection,
                'status' => 'Failed',
                'message' => $e->getMessage(),
            ];
        }
    }

    return response()->json([
        'status' => 'complete',
        'databases' => $results,
    ]);
});

Route::get('/auth/google/redirect', [AdminController::class, 'redirect'])->name('googleRedirect');
Route::get('/auth/google/callback', [AdminController::class, 'callback'])->name('googleCallback');

Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard')->middleware(['role:administrator|super_administrator']);

    Route::get('/students', [StudentController::class, 'index'])->name('students')->middleware('permission:view_students');
    Route::put('/student/{id}/remarks/update', [StudentController::class, 'updateRemarks'])->name('updateRemarks')->middleware('permission:upddate_students');

    Route::get('/students/{signature}/e-signature', [GoogleDriveFileController::class, 'getSignature'])->name('getSignature')->middleware(['role:administrator|super_administrator']);
    Route::get('/students/{proof}', [GoogleDriveFileController::class, 'getProof'])->name('getProof')->middleware(['role:administrator|super_administrator']);

    Route::middleware(['permission:view_accounts|update_accounts|delete_accounts|create_accounts|view_activity_logs'])->group(function () {
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts');
        Route::post('/account/create', [AccountController::class, 'create'])->name('createAccount');
        Route::put('/account/{id}/update', [AccountController::class, 'update'])->name('updateAccount');

        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activityLogs');
    });
});

require __DIR__ . '/api.php';
