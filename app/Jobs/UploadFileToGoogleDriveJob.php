<?php

namespace App\Jobs;

use App\Services\GoogleDriveService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UploadFileToGoogleDriveJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $uploads,
        protected string $campus,
    ) {}

    public function handle(GoogleDriveService $drive): void
    {
        foreach ($this->uploads as $upload) {

            if (! file_exists($upload['path'])) {
                continue;
            }

            $modelClass = $upload['model'];
            $record = $modelClass::find($upload['id']);

            if (! $record) {
                @unlink($upload['path']);

                continue;
            }

            $googleDriveId = $drive->uploadFromPath(
                $upload['path'],
                $upload['filename'],
                $this->campus
            );

            $record->update([
                $upload['field'] => $googleDriveId,
            ]);

            @unlink($upload['path']);
        }
    }
}
