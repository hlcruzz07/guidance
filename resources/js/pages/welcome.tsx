import { usePage } from '@inertiajs/react';

import { useForm } from '@inertiajs/react';
import { AlertCircleIcon, LogInIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SubmittingDialog } from '@/components/student/SubmittingDialog';
import ThemeButton from '@/components/ThemeButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { studentForm } from '@/routes';

type ValidateForm = {
    id_number: string;
    campus: string;
    birthdate: string;
};
export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    info?: string | null;
    warning?: string | null;
};

const CAMPUSES = ['Talisay', 'Fortune Towne', 'Alijis', 'Binalbagan'];

export default function Welcome() {
    const flash: FlashMessages = usePage().props.flash || {};

    const { data, setData, errors, processing, get } = useForm<ValidateForm>({
        id_number: '',
        campus: '',
        birthdate: '',
    });
    const message =
        flash.success || flash.error || flash.info || flash.warning || null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (processing) {
            return;
        } // Prevent multiple submissions

        get(studentForm().url, {
            preserveState: true,
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash.success, flash.error, flash.info, flash.warning]);

    return (
        <div className="relative flex min-h-screen flex-col bg-background lg:flex-row">
            <SubmittingDialog
                open={processing}
                title="Validating Student Information"
                description="Please wait while we validate your student ID number and campus. Kindly do not close or refresh this window."
            />
            <ThemeButton />

            {/* Branding panel */}
            <div
                className="relative flex min-h-70 items-center justify-center bg-cover bg-center lg:min-h-screen lg:w-[50%] lg:flex-none"
                style={{ backgroundImage: "url('/chmsu.webp')" }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(160deg, oklch(0.205 0.05 176.5 / 0.92) 0%, oklch(0.28 0.06 172.5 / 0.85) 55%, oklch(0.636 0.108 172.521 / 0.75) 100%)',
                    }}
                />

                {/* teal seam accent, desktop only */}
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
                            Guidance Information System
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl lg:text-4xl">
                            Student&apos;s Individual Inventory Form
                        </h2>
                    </div>

                    <p className="hidden text-sm text-white/75 lg:block">
                        A guidance form gathering personal, educational, family,
                        and socio-economic information. Used to support every
                        CHMSU student&apos;s academic, personal, and social
                        well-being.
                    </p>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-6"
                >
                    <FieldSet>
                        <div>
                            <h3 className="text-xl font-bold">Get started</h3>
                            <FieldDescription>
                                Enter your student ID number, campus, and
                                birthdate to begin or continue your form.
                            </FieldDescription>
                        </div>

                        <FieldGroup>
                            {message && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertDescription>
                                        {message}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field>
                                <FieldLabel htmlFor="id_number">
                                    Student ID Number
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="id_number"
                                    value={data.id_number}
                                    onChange={(e) =>
                                        setData(
                                            'id_number',
                                            String(
                                                e.target.value,
                                            ).toUpperCase(),
                                        )
                                    }
                                    aria-invalid={!!errors.id_number}
                                    placeholder="Enter your student ID number"
                                />
                                {errors.id_number && (
                                    <FieldError>{errors.id_number}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="birthdate">
                                    Birthdate
                                </FieldLabel>
                                <Input
                                    type="date"
                                    id="birthdate"
                                    value={data.birthdate}
                                    onChange={(e) =>
                                        setData(
                                            'birthdate',
                                            String(e.target.value),
                                        )
                                    }
                                    aria-invalid={!!errors.birthdate}
                                />
                                {errors.birthdate && (
                                    <FieldError>{errors.birthdate}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="campus">Campus</FieldLabel>
                                <Select
                                    value={data.campus}
                                    onValueChange={(value) =>
                                        setData('campus', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="campus"
                                        className="w-full"
                                        aria-invalid={!!errors.campus}
                                    >
                                        <SelectValue placeholder="Choose your campus" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="w-full border-2"
                                        side="top"
                                    >
                                        <SelectGroup>
                                            {CAMPUSES.map((campus) => (
                                                <SelectItem
                                                    key={campus}
                                                    value={campus}
                                                >
                                                    {campus}{' '}
                                                    {campus === 'Talisay'
                                                        ? '(Main Campus)'
                                                        : 'Campus'}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.campus && (
                                    <FieldError>{errors.campus}</FieldError>
                                )}
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? (
                            <>
                                <Spinner /> Validating...
                            </>
                        ) : (
                            <>
                                Continue <LogInIcon />
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
