<?php

namespace App\Http\Controllers;

use App\Models\EquityGroup;
use App\Models\Student;
use App\Services\GoogleDriveService;
use Google\Service\Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class GoogleDriveFileController extends Controller
{
    public function __construct(
        protected GoogleDriveService $googleDrive
    ) {}

    public function getSignature(string $signature): Response
    {
        $student = Student::where('e_signature', $signature)->first();

        if (! $student) {
            return response('Student not found.', 404);
        }

        try {
            $cacheKey = "student:{$student->id}:e_signature";

            $metadata = Cache::remember(
                $cacheKey,
                now()->addMinutes(30),
                fn () => $this->googleDrive->getFileMetadata($student->e_signature)
            );

            $contents = $this->googleDrive->downloadFile($student->e_signature);

            return response($contents)
                ->header('Content-Type', $metadata['mimeType']);
        } catch (Exception $e) {
            if ($e->getCode() === 404) {
                return response('Signature file does not exist in Google Drive.', 404);
            }

            throw $e;
        }
    }

    public function getProof(string $proof): Response
    {
        $equityGroup = EquityGroup::where('proof', $proof)->first();

        if (! $equityGroup) {
            return response('Proof not found.', 404);
        }

        try {
            $cacheKey = "equity_group:{$equityGroup->id}:proof";

            $metadata = Cache::remember(
                $cacheKey,
                now()->addMinutes(30),
                fn () => $this->googleDrive->getFileMetadata($equityGroup->proof)
            );

            $contents = $this->googleDrive->downloadFile($equityGroup->proof);

            return response($contents)
                ->header('Content-Type', $metadata['mimeType']);
        } catch (Exception $e) {
            if ($e->getCode() === 404) {
                return response('Proof file does not exist in Google Drive.', 404);
            }

            throw $e;
        }
    }
}
