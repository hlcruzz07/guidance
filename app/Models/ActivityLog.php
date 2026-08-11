<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'action',
        'description',
        'email',
        'ip_address',
        'browser',
    ];

    /**
     * Convenience accessor to the User record, matched by email since
     * that's what's stored on the log row rather than a user_id FK.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }
}