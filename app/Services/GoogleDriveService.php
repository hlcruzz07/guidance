<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;

class GoogleDriveService
{
    protected Drive $drive;

    public function __construct()
    {
        $client = new Client();

        $client->setAuthConfig(base_path(env('GOOGLE_DRIVE_CREDENTIALS')));
        $client->addScope(Drive::DRIVE);

        $this->drive = new Drive($client);
    }

    public function uploadFromPath(
        string $path,
        string $filename,
        string $campus
    ): string {
        $folderId = $this->getCampusFolderId($campus);

        $metadata = new DriveFile([
            'name' => $filename,
            'parents' => [$folderId],
        ]);

        $uploaded = $this->drive->files->create(
            $metadata,
            [
                'data' => file_get_contents($path),
                'mimeType' => mime_content_type($path),
                'uploadType' => 'multipart',
                'supportsAllDrives' => true,
                'fields' => 'id',
            ]
        );

        return $uploaded->getId();
    }

    /**
     * List files inside a campus's folder.
     *
     * @return array<int, array{id: string, name: string, mimeType: string, size: ?string, createdTime: string, webViewLink: ?string}>
     */
    public function listFilesInCampusFolder(string $campus): array
    {
        $folderId = $this->getCampusFolderId($campus);

        return $this->listFilesInFolder($folderId);
    }

    /**
     * List files inside an arbitrary folder ID.
     *
     * @return array<int, array{id: string, name: string, mimeType: string, size: ?string, createdTime: string, webViewLink: ?string}>
     */
    public function listFilesInFolder(string $folderId): array
    {
        $files = [];
        $pageToken = null;

        do {
            $response = $this->drive->files->listFiles([
                'q' => "'{$folderId}' in parents and trashed = false",
                'fields' => 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink)',
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true,
                'pageToken' => $pageToken,
                'pageSize' => 100,
            ]);

            foreach ($response->getFiles() as $file) {
                $files[] = [
                    'id' => $file->getId(),
                    'name' => $file->getName(),
                    'mimeType' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'createdTime' => $file->getCreatedTime(),
                    'webViewLink' => $file->getWebViewLink(),
                ];
            }

            $pageToken = $response->getNextPageToken();
        } while ($pageToken);

        return $files;
    }

    /**
     * Fetch a single file's metadata by its Drive file ID.
     *
     * @return array{id: string, name: string, mimeType: string, size: ?string, createdTime: string, webViewLink: ?string}
     */
    public function getFileMetadata(string $fileId): array
    {
        $file = $this->drive->files->get($fileId, [
            'fields' => 'id, name, mimeType, size, createdTime, webViewLink',
            'supportsAllDrives' => true,
        ]);

        return [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'mimeType' => $file->getMimeType(),
            'size' => $file->getSize(),
            'createdTime' => $file->getCreatedTime(),
            'webViewLink' => $file->getWebViewLink(),
        ];
    }

    /**
     * Download a file's raw contents by its Drive file ID.
     */
    public function downloadFile(string $fileId): string
    {
        $response = $this->drive->files->get($fileId, [
            'alt' => 'media',
            'supportsAllDrives' => true,
        ]);

        return $response->getBody()->getContents();
    }

    /**
     * Download a file to a local path.
     */
    public function downloadFileToPath(string $fileId, string $destinationPath): string
    {
        $contents = $this->downloadFile($fileId);

        file_put_contents($destinationPath, $contents);

        return $destinationPath;
    }

    private function getCampusFolderId(string $campus): string
    {
        return match (strtolower(trim($campus))) {
            'talisay' => env('GOOGLE_DRIVE_TALISAY_FOLDER_ID'),
            'alijis' => env('GOOGLE_DRIVE_ALIJIS_FOLDER_ID'),
            'fortune towne' => env('GOOGLE_DRIVE_FORTUNE_TOWNE_FOLDER_ID'),
            'binalbagan' => env('GOOGLE_DRIVE_BINALBAGAN_FOLDER_ID'),
            default => throw new \InvalidArgumentException("Invalid campus: {$campus}"),
        };
    }
}