import { usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ThemeButton from '@/components/ThemeButton';
import { Button } from '@/components/ui/button';

export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    info?: string | null;
    warning?: string | null;
};

// Update this to your actual Google OAuth redirect route
// e.g. if you're using Laravel Socialite: Route::get('/auth/google/redirect', ...)
const GOOGLE_AUTH_URL = '/auth/google/redirect';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.31 24 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27v-3.1H1.27A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.27 5.37l4-3.1z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.63l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
            />
        </svg>
    );
}

export default function Index() {
    const flash: FlashMessages = usePage().props.flash || {};

    useEffect(() => {
        if (!flash) {
return;
}

        const timeoutId = setTimeout(() => {
            if (flash.success) {
toast.success(flash.success);
}

            if (flash.error) {
toast.error(flash.error);
}

            if (flash.info) {
toast.info(flash.info);
}

            if (flash.warning) {
toast.warning(flash.warning);
}
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [flash]);

    return (
        <div className="relative flex min-h-screen flex-col bg-background lg:flex-row">
            <ThemeButton />

            {/* Branding panel */}
            <div
                className="relative flex min-h-56 items-center justify-center bg-cover bg-center lg:min-h-screen lg:w-[44%] lg:flex-none"
                style={{ backgroundImage: "url('/chmsu.webp')" }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(160deg, oklch(0.205 0.05 176.5 / 0.92) 0%, oklch(0.28 0.06 172.5 / 0.85) 55%, oklch(0.636 0.108 172.521 / 0.75) 100%)',
                    }}
                />

                <div
                    className="absolute inset-y-0 right-0 hidden w-[3px] lg:block"
                    style={{
                        background:
                            'linear-gradient(180deg, oklch(0.781 0.123 156.451), oklch(0.636 0.108 172.521), oklch(0.490 0.08 176.516))',
                    }}
                />

                <div className="relative z-10 mx-6 flex max-w-md flex-col items-center gap-6 py-10 text-center text-white lg:mx-10 lg:items-start lg:text-left">
                    <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                        <img
                            src="/logo.webp"
                            className="w-14 sm:w-16"
                            loading="lazy"
                            alt="CHMSU LOGO"
                        />
                        <div className="text-center font-extrabold sm:text-left">
                            <h1 className="text-xl leading-tight sm:text-2xl">
                                CARLOS HILADO
                            </h1>
                            <h1 className="text-sm leading-tight text-white/80 sm:text-base">
                                MEMORIAL STATE UNIVERSITY
                            </h1>
                        </div>
                    </div>

                    <div>
                        <p
                            className="text-xs font-semibold tracking-[0.2em] uppercase"
                            style={{ color: 'oklch(0.781 0.123 156.451)' }}
                        >
                            Guidance & Counseling Information System
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                            Admin Portal
                        </h2>
                    </div>

                    <p className="hidden text-sm text-white/75 lg:block">
                        Restricted access for guidance counselors and staff
                        managing student records, appointments, and intake
                        forms.
                    </p>
                </div>
            </div>

            {/* Login panel */}
            <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Sign in</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Use your CHMSU Google account to access the
                                admin dashboard.
                            </p>
                        </div>
                    </div>

                    <Button asChild className="w-full" size="lg">
                        <a href={GOOGLE_AUTH_URL}>
                            <GoogleIcon />
                            Continue with Google
                        </a>
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Only authorized CHMSU staff accounts can sign in.
                        Contact IT support if you need access.
                    </p>
                </div>
            </div>
        </div>
    );
}
