<?php

namespace App\Jobs;

use App\Services\GoogleDriveService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UploadFileToGoogleDriveJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $uploads,
        protected string $campus,
    ) {
    }

    public function handle(GoogleDriveService $drive): void
    {
        Log::info('UploadFileToGoogleDriveJob started', ['uploads' => count($this->uploads)]);

        foreach ($this->uploads as $upload) {
            if (!file_exists($upload['path'])) {
                Log::warning('Upload file missing, skipping', ['path' => $upload['path']]);
                continue;
            }

            $modelClass = $upload['model'];

            if (!$modelClass::whereKey($upload['id'])->exists()) {
                Log::warning('Record not found, skipping', ['model' => $modelClass, 'id' => $upload['id']]);
                @unlink($upload['path']);
                continue;
            }

            try {
                $googleDriveId = $drive->uploadFromPath(
                    $upload['path'],
                    $upload['filename'],
                    $this->campus
                );
            } catch (\Throwable $e) {
                // Keep the temp file so a retry can pick it up.
                Log::error('Google Drive upload failed', [
                    'model' => $modelClass,
                    'id' => $upload['id'],
                    'filename' => $upload['filename'],
                    'message' => $e->getMessage(),
                ]);
                throw $e;
            }

            $append = $upload['append'] ?? false;

            DB::transaction(function () use ($modelClass, $upload, $googleDriveId, $append) {
                // Re-read the row under a lock so a second upload for the same
                // record can't read a stale array and overwrite this one.
                $record = $modelClass::whereKey($upload['id'])->lockForUpdate()->first();

                if (!$record) {
                    return;
                }

                $field = $upload['field'];

                if ($append) {
                    $current = $record->{$field};

                    // Cast returns an array; guard against legacy string / null.
                    $current = is_array($current)
                        ? $current
                        : (empty($current) ? [] : [$current]);

                    $record->{$field} = [...$current, $googleDriveId];
                } else {
                    $record->{$field} = $googleDriveId;
                }

                $record->save();

                Log::info('Record updated', [
                    'model' => $modelClass,
                    'id' => $record->id,
                    'field' => $field,
                    'append' => $append,
                    'value' => $googleDriveId,
                ]);
            });

            @unlink($upload['path']);
        }
    }
}