<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Jobs\UploadFileToGoogleDriveJob;
use App\Models\EquityGroup;
use App\Models\Student;
use App\Repositories\StudentRepo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function __construct(protected StudentRepo $studentRepo)
    {
    }

    public function index()
    {
        $stats = [
            'total' => Student::count(),
            'new_this_week' => Student::where('created_at', '>=', now()->subWeek())->count(),
            'pending_review' => Student::whereNull('remarked_at')->count(),
            'with_scholarship' => Student::whereNotNull('scholarship')->where('scholarship', '!=', '')->count(),
        ];

        return Inertia::render('admin/students/index', [
            'stats' => $stats,
        ]);
    }

    public function form(Request $request)
    {
        $data = $request->validate([
            'id_number' => 'required|string',
            'campus' => 'required|string',
            'birthdate' => 'required|date',
        ]);
        $id_number = $data['id_number'];
        $campus = $data['campus'];
        $birthdate = $data['birthdate'];

        try {
            $connection = match (strtolower($campus)) {
                'talisay' => 'tal_mysql',
                'alijis' => 'ali_mysql',
                'fortune towne' => 'ft_mysql',
                'binalbagan' => 'bin_mysql',
                default => null,
            };

            if (!$connection) {
                return redirect()->route('home')->with('error', 'Invalid selected campus.');
            }

            // Step 1: check if the student exists at all (id + birthdate match)
            $studentExists = DB::connection($connection)
                ->table('student')
                ->where('student_id', $id_number)
                ->where('birthdate', $birthdate)
                ->exists();

            if (!$studentExists) {
                return redirect()->route('home')->with('error', 'Student not found. Please check your details and try again.');
            }

            // Step 2: fetch full record only if they have a current school-year enrollment
            $student = DB::connection($connection)
                ->table('student')
                ->join('student_load', 'student.student_id', '=', 'student_load.student_id')
                ->join('student_user', 'student_user.student_id', '=', 'student.student_id')
                ->join('class', 'student_load.class_code', '=', 'class.class_code')
                ->join('section', 'class.section_id', '=', 'section.section_id')
                ->where('class.school_year', now()->year)
                ->where('student.student_id', $id_number)
                ->where('student.birthdate', $birthdate)
                ->select(
                    'student.student_id',
                    'student.student_lastname',
                    'student.student_middlename',
                    'student.student_firstname',
                    'student.gender',
                    'student.birthdate',
                    'student.birthplace',
                    'student.student_address',
                    'student.zip_code',
                    'student.civilstatus',
                    'student.religion',
                    'student.person_notify_name',
                    'student.person_notify_address',
                    'student.person_notify_cellphone',
                    'section.yearlevel',
                    'section.program_code',
                    'section.section_code',
                    'class.school_year',
                    'student_user.email',
                    DB::raw('SUBSTRING(student_user.contact_number, 2) as contact_number')
                )
                ->orderByDesc('section.yearlevel')
                ->first();

            if (!$student) {
                return redirect()->route('home')->with('error', 'Only students who are fully enrolled for the current school year (' . now()->year . ') can submit this form.');
            }

            return Inertia::render('student/index', [
                'student' => array_merge((array) $student, [
                    'campus' => $campus,
                ]),
            ]);
        } catch (\Throwable $th) {
            Log::error('Student lookup DB connection failed', [
                'campus' => $campus,
                'message' => $th->getMessage(),
            ]);

            return redirect()->route('home')->with('error', 'Database connection error. Please try again later.');
        }
    }

    public function store(StoreStudentRequest $request)
    {
        try {
            $data = $request->validated();

            $uploads = [];
            $campus = $data['campus'];

            // Pull the signature file out before it touches the student
            // model — only the Drive file ID belongs on the record.
            $signatureFile = $data['e_signature'] ?? null;
            unset($data['e_signature']);

            // NOTE ON FILE STORAGE:
            // Laravel's Storage/Flysystem local disk adapter requires the
            // `fileinfo` PHP extension just to construct itself
            // (League\Flysystem\Local\LocalFilesystemAdapter builds a
            // FinfoMimeTypeDetector in its constructor), independent of which
            // storage method is called. Since fileinfo is not installed on
            // this host, ANY Storage::disk()/->store()/->storeAs() call on a
            // local disk will fail with "Class finfo not found".
            //
            // Workaround: use Symfony's native UploadedFile::move(), which
            // calls PHP's move_uploaded_file()/rename() directly and never
            // touches Flysystem or fileinfo. This bypasses the Storage facade
            // entirely for these temp uploads.
            //
            // The real fix is enabling the fileinfo extension on the server —
            // this is a workaround until that's done.
            $tempDir = storage_path('app/private/temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            DB::transaction(function () use ($data, $signatureFile, $tempDir, &$uploads, &$campus) {

                $student = $this->studentRepo->updateOrCreate($data);

                $student->educations()->delete();
                $student->guardians()->delete();
                $student->concerns()->delete();
                $student->siblings()->delete();
                $student->psychTests()->delete();
                $student->equityGroups()->delete();

                $student->educations()->createMany($data['educations']);
                $student->guardians()->createMany($data['guardians']);
                $student->concerns()->createMany($data['concerns']);

                if (!empty($data['siblings'])) {
                    $student->siblings()->createMany($data['siblings']);
                }

                if (!empty($data['psych_tests'])) {
                    $student->psychTests()->createMany($data['psych_tests']);
                }

                if (!empty($data['equity_groups'])) {
                    foreach ($data['equity_groups'] as $group) {

                        $equityGroup = $student->equityGroups()->create([
                            'equity_group' => $group['equity_group'],
                            'proof' => null,
                        ]);

                        $proofFile = $group['proof'];
                        $extension = strtolower($proofFile->getClientOriginalExtension()) ?: 'jpg';
                        $tempFilename = uniqid('proof_', true) . '.' . $extension;

                        // move() = Symfony's native move, bypasses Flysystem/finfo.
                        $movedFile = $proofFile->move($tempDir, $tempFilename);

                        $uploads[] = [
                            'model' => EquityGroup::class,
                            'id' => $equityGroup->id,
                            'field' => 'proof',
                            'path' => $movedFile->getPathname(),
                            'filename' => $proofFile->getClientOriginalName(),
                        ];
                    }
                }

                if ($signatureFile) {
                    $sigExtension = strtolower($signatureFile->getClientOriginalExtension()) ?: 'png';
                    $sigFilename = uniqid('signature_', true) . '.' . $sigExtension;

                    $movedSignature = $signatureFile->move($tempDir, $sigFilename);

                    $uploads[] = [
                        'model' => Student::class,
                        'id' => $student->id,
                        'field' => 'e_signature',
                        'path' => $movedSignature->getPathname(),
                        'filename' => $signatureFile->getClientOriginalName(),
                    ];
                }
            });

            if (!empty($uploads)) {
                UploadFileToGoogleDriveJob::dispatch($uploads, $campus);
            }

            return back()->with('success', 'Your information has been submitted successfully.');
        } catch (\Throwable $th) {
            Log::error('Student SII submission failed', [
                'message' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);

            return back()->with('error', 'Something went wrong. Please try again later.');
        }
    }
    public function updateRemarks(string $id, Request $request)
    {
        $data = $request->validate([
            'remarks' => 'required|string|max:250',

        ]);

        $this->studentRepo->setRemarks($id, $data['remarks']);

        return back()->with('success', 'Remarks updated successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
