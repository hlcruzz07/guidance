<?php

namespace App\Jobs;

use App\Services\GoogleDriveService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UploadFileToGoogleDriveJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $uploads,
        protected string $campus,
    ) {}

   public function handle(GoogleDriveService $drive): void
{
    Log::info('UploadFileToGoogleDriveJob started', ['uploads' => count($this->uploads)]);

    foreach ($this->uploads as $upload) {

        if (! file_exists($upload['path'])) {
            Log::warning('Upload file missing, skipping', ['path' => $upload['path']]);
            continue;
        }

        $modelClass = $upload['model'];
        $record = $modelClass::find($upload['id']);

        if (! $record) {
            Log::warning('Record not found, skipping', ['model' => $modelClass, 'id' => $upload['id']]);
            @unlink($upload['path']);
            continue;
        }

        $googleDriveId = $drive->uploadFromPath(
            $upload['path'],
            $upload['filename'],
            $this->campus
        );

        $updated = $record->update([
            $upload['field'] => $googleDriveId,
        ]);

        Log::info('Record updated', [
            'model' => $modelClass,
            'id' => $record->id,
            'field' => $upload['field'],
            'value' => $googleDriveId,
            'update_result' => $updated,
        ]);

        @unlink($upload['path']);
    }
}
}
