<?php

namespace App\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Encryption\Encrypter;

class ExternalDecrypter
{
    protected Encrypter $encrypter;

    public function __construct()
    {
        $appKey = config('services.external.app_key');

        $key = str_starts_with($appKey, 'base64:')
            ? base64_decode(substr($appKey, 7))
            : $appKey;

        $this->encrypter = new Encrypter($key, 'AES-256-CBC');
    }

    public function decryptValue(?string $value): ?string
    {
        if (blank($value)) {
            return $value;
        }

        // Laravel encrypted payloads usually start with "eyJp"
        if (! str_starts_with($value, 'eyJp')) {
            return $value;
        }

        try {
            return $this->encrypter->decryptString($value);
        } catch (DecryptException) {
            return $value;
        }
    }
}
