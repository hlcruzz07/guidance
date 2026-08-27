<?php

namespace App\Services;

class ImageCompressionService
{
    /**
     * Compress and downscale an image in place using GD.
     * Skips non-image extensions silently (safe to call on any temp file).
     */
    public function compress(string $path, int $maxWidth = 1920, int $quality = 75): void
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) {
            return;
        }

        $size = @getimagesize($path);

        if (!$size) {
            return;
        }

        [$width, $height] = $size;

        $source = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($path),
            'png' => @imagecreatefrompng($path),
        };

        if (!$source) {
            return;
        }

        $image = $source;

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round(($height / $width) * $newWidth);

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            if ($ext === 'png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }

            imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($source);
            $image = $resized;
        }

        match ($ext) {
            'jpg', 'jpeg' => imagejpeg($image, $path, $quality),
            'png' => imagepng($image, $path, (int) round((100 - $quality) / 11)),
        };

        imagedestroy($image);
    }
}