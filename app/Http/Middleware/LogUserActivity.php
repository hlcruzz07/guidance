<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogUserActivity
{
    /**
     * Route/path prefixes to skip so logs aren't flooded with noise
     * (asset pings, polling, health checks). Adjust to fit your app.
     */
    protected array $except = [
        'up',
        'sanctum/csrf-cookie',
        'storage/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Just pass the request through; all the work happens in terminate()
        // so it never adds latency to the actual response.
        return $next($request);
    }

    /**
     * Laravel calls terminate() automatically after the response has
     * already been sent to the browser, for any middleware that defines it.
     */
    public function terminate(Request $request, Response $response): void
    {
        $user = $request->user();

        if ($this->shouldSkip($request)) {
            return;
        }

        if (!$user) {
            return;
        }
        // Only log successful/redirected requests by default; flip this off
        // if you want failed (4xx/5xx) requests logged too.
        if ($response->getStatusCode() >= 400) {
            return;
        }

        $action = $this->resolveAction($request);

        // No CREATE/UPDATE/DELETE/LOGIN match (e.g. a plain GET) -> skip.
        if ($action === null) {
            return;
        }

        try {
            ActivityLog::create([
                'email' => $user->email,
                'action' => $action,
                'description' => $this->resolveDescription($request, $action),
                'ip_address' => $request->ip(),
                'browser' => $this->resolveBrowser($request->userAgent()),
            ]);
        } catch (Throwable $e) {
            // Never let logging failures break the request lifecycle.
            report($e);
        }
    }

    protected function shouldSkip(Request $request): bool
    {
        return $request->is($this->except);
    }

    /**
     * Map the request to one of: create, update, delete, login.
     * Returns null for anything else (e.g. a plain GET/view), which
     * tells terminate() to skip logging it.
     */
    protected function resolveAction(Request $request): ?string
    {
        if ($request->route()?->getName() === 'googleCallback') {
            return 'login';
        }

        return match ($request->method()) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => null,
        };
    }

    /**
     * Builds a human-readable description like "Created /students" or,
     * when a named route exists, "Created students.store".
     */
    protected function resolveDescription(Request $request, string $action): string
    {
        $verb = ucfirst($action);
        $target = $request->route()?->getName() ?? $request->path();

        return "{$verb} {$target}";
    }

    /**
     * Lightweight browser detection from the user agent string.
     * Swap this out for jenssegers/agent if you want device/OS detail too.
     */
    protected function resolveBrowser(?string $userAgent): ?string
    {
        if (!$userAgent) {
            return null;
        }

        return match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera') => 'Opera',
            str_contains($userAgent, 'Chrome/') && !str_contains($userAgent, 'Chromium') => 'Chrome',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Safari/') && !str_contains($userAgent, 'Chrome') => 'Safari',
            default => 'Other',
        };
    }
}