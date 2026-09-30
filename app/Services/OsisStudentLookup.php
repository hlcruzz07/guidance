<?php

namespace App\Services;

use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OsisStudentLookup
{
    private const CONNECTION = 'osis_mysql';

    /** students columns that are stored in plain text. */
    private const STUDENT_PLAIN = ['id', 'status', 'synced_at', 'created_at', 'updated_at'];

    private const SOCIO_ECONOMIC_CATEGORY_PLAIN = [
        'id',
        'desc',
        'with_id',
        'created_at',
        'updated_at',
    ];

    private ?Encrypter $encrypter = null;

    public function findByEmail(string $email): ?array
    {
        $hash = $this->hash($email);

        if ($hash === null) {
            return null;
        }

        $row = DB::connection(self::CONNECTION)
            ->table('students')
            ->where('email_hash', $hash)
            ->first();

        if (!$row) {
            return null;
        }

        $student = $this->decryptRow($row, self::STUDENT_PLAIN, table: 'students');

        $student['socio_economic_profiles'] = $this->manyEconomicProfiles($row->id);

        return array_merge($student, [
            'socio_economic_categories' => $this->getEconomicCategories(),

        ]);
    }

    public function getEconomicCategories(): array
    {
        return DB::connection(self::CONNECTION)
            ->table('socio_economic_categories')
            ->get()
            ->map(fn($row) => $this->decryptRow(
                $row,
                plain: self::SOCIO_ECONOMIC_CATEGORY_PLAIN,
                table: 'socio_economic_categories',
            ))
            ->all();
    }

    private function manyEconomicProfiles(int|string $studentId): array
    {
        $profiles = DB::connection(self::CONNECTION)
            ->table('student_socio_economic_profiles')
            ->where('student_id', $studentId)
            ->get();

        return $profiles->map(function ($profile) {
            $profile = $this->decryptRow(
                $profile,
                plain: ['id', 'student_id', 'socio_economic_category_id', 'status', 'created_at', 'updated_at'],
                table: 'student_socio_economic_profiles',
            );

            $proofs = DB::connection(self::CONNECTION)
                ->table('student_economic_proofs')
                ->where('socio_economic_profile_id', $profile['id'])
                ->get()
                ->map(fn($proof) => $this->decryptRow(
                    $proof,
                    plain: [
                        'id',
                        'socio_economic_profile_id',
                        'created_at',
                        'updated_at',
                    ],
                    table: 'student_economic_proofs',
                ))->values()->all();

            $profile['proofs'] = $proofs;

            return $profile;
        })->all();
    }

    /**
     * Mirrors OSIS's HashService::make(): HMAC-SHA256 of the lowercased,
     * trimmed value, keyed with the OSIS app's key.
     */
    private function hash(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $key = (string) (config('osis.hash_key') ?: config('osis.key'));

        return hash_hmac('sha256', mb_strtolower(trim($value)), $key);
    }

    private function one(string $table, int|string $studentId, array $encrypted): ?array
    {
        $row = DB::connection(self::CONNECTION)
            ->table($table)
            ->where('student_id', $studentId)
            ->first();

        return $row ? $this->decryptRow($row, encrypted: $encrypted, table: $table) : null;
    }

    private function many(string $table, int|string $studentId, array $encrypted): array
    {
        return DB::connection(self::CONNECTION)
            ->table($table)
            ->where('student_id', $studentId)
            ->get()
            ->map(fn($row) => $this->decryptRow($row, encrypted: $encrypted, table: $table))
            ->all();
    }

    /**
     * Decrypt a row. Pass $plain to decrypt everything except those columns
     * (and *_hash columns), or $encrypted to decrypt only those columns.
     *
     * DIAGNOSTIC: $table is only used for logging which column/table blew up.
     */
    private function decryptRow(object $row, array $plain = [], array $encrypted = [], string $table = 'unknown'): array
    {
        $out = [];
        $rowId = $row->id ?? null;

        foreach ((array) $row as $column => $value) {
            if (Str::endsWith($column, '_hash')) {
                continue; // blind indexes aren't needed by callers
            }

            $shouldDecrypt = $encrypted !== []
                ? in_array($column, $encrypted, true)
                : !in_array($column, $plain, true);

            if (!$shouldDecrypt) {
                $out[$column] = $value;

                continue;
            }

            try {
                $out[$column] = $this->decrypt($value);
            } catch (\Throwable $e) {
                Log::error('OSIS decrypt failed', [
                    'table' => $table,
                    'column' => $column,
                    'row_id' => $rowId,
                    'value_preview' => is_string($value) ? substr($value, 0, 40) : gettype($value),
                    'exception' => $e->getMessage(),
                ]);

                throw $e;
            }
        }

        return $out;
    }

    private function decrypt(mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return $value;
        }

        // The `encrypted` cast uses encryptString/decryptString.
        return $this->encrypter()->decryptString($value);
    }

    private function encrypter(): Encrypter
    {
        if ($this->encrypter === null) {
            $key = (string) config('osis.key');

            if (Str::startsWith($key, 'base64:')) {
                $key = base64_decode(Str::after($key, 'base64:'));
            }

            $this->encrypter = new Encrypter($key, config('osis.cipher'));
        }

        return $this->encrypter;
    }
}
