<?php

use App\Http\Controllers\Api\AccountApiController;
use App\Http\Controllers\Api\ActivityLogApiController;
use App\Http\Controllers\Api\CampusApiController;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->middleware(['auth'])->group(function () {
    Route::get('/students', [StudentApiController::class, 'paginate'])->name('paginateStudents');
    Route::get('/courses/{campus}', [CampusApiController::class, 'fetchCourses'])->name('fetchCourses');
    Route::get('/year-levels/{campus}/{course}', [CampusApiController::class, 'fetchYearLevels'])->name('fetchYearLevels');
    Route::get('/sections/{campus}/{course}/{year_level}', [CampusApiController::class, 'fetchSections'])->name('fetchSections');

    Route::get('/accounts', [AccountApiController::class, 'paginate'])->name('paginateAccounts');
    Route::get('/activity-logs', [ActivityLogApiController::class, 'paginate'])->name('paginateActivityLogs');
});