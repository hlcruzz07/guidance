// resources/js/components/form/SocioEconomicCheckboxField.tsx
import { Asterisk, ImagePlus, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { SocioEconomicCategory } from '@/types/entities';
import type { StudentSocioEconomicProfileForm } from '@/types/form';

interface SocioEconomicCheckboxFieldProps {
    category: SocioEconomicCategory;

    value?: StudentSocioEconomicProfileForm;

    error?: string;

    onChange: (value: StudentSocioEconomicProfileForm | undefined) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function SocioEconomicCheckboxField({
    category,
    value,
    error,
    onChange,
}: SocioEconomicCheckboxFieldProps) {
    const checked = value?.status === 1;

    const handleCheckedChange = (checked: boolean) => {
        if (!checked) {
            onChange(undefined);

            return;
        }

        onChange({
            ...value,
            socio_economic_category_id: category.id,
            id_number: null,
            status: 1,
            student_economic_proofs: [],
        });
    };

    const handleIdNumberChange = (idNumber: string) => {
        if (!value) {
            return;
        }

        onChange({
            ...value,
            id_number: idNumber,
        });
    };

    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!value || !e.target.files) {
            return;
        }

        const files = Array.from(e.target.files);
        const validFiles: File[] = [];

        for (const file of files) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                toast.error(
                    `"${file.name}" is not a supported file type. Only JPG, JPEG, and PNG images are allowed.`,
                );
                continue;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`"${file.name}" exceeds the 5MB size limit.`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            onChange({
                ...value,
                student_economic_proofs: [
                    ...(value.student_economic_proofs ?? []),
                    ...validFiles.map((file) => ({
                        proof: file,
                    })),
                ],
            });
        }

        // Allows selecting the same file again
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        if (!value) {
            return;
        }

        const proofs = [...(value.student_economic_proofs ?? [])];

        proofs.splice(index, 1);

        onChange({
            ...value,
            student_economic_proofs: proofs,
        });
    };

    return (
        <Field className="rounded-lg border p-4" data-invalid={!!error}>
            <div className="flex items-start gap-3">
                <Checkbox
                    id={`socio-economic-${category.id}`}
                    checked={checked}
                    onCheckedChange={handleCheckedChange}
                />

                <div className="flex-1 space-y-1">
                    <FieldLabel
                        htmlFor={`socio-economic-${category.id}`}
                        className="cursor-pointer font-medium"
                    >
                        {category.name}
                    </FieldLabel>

                    {category.desc && (
                        <p className="text-sm text-muted-foreground">
                            {category.desc}
                        </p>
                    )}
                </div>
            </div>

            {checked && (
                <div className="mt-4 space-y-4 pl-7">
                    {category.with_id && (
                        <Field>
                            <FieldLabel htmlFor={`id-${category.id}`}>
                                Identification Number
                                <Asterisk size={15} color="red" />
                            </FieldLabel>

                            <Input
                                id={`id-${category.id}`}
                                value={value?.id_number ?? ''}
                                placeholder="Enter Identification Number"
                                onChange={(e) =>
                                    handleIdNumberChange(e.target.value)
                                }
                            />
                        </Field>
                    )}

                    <Field>
                        <FieldLabel>
                            Supporting Documents
                            <Asterisk size={15} color="red" />
                        </FieldLabel>

                        <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            multiple
                            onChange={handleFilesChange}
                        />

                        <p className="text-xs text-muted-foreground">
                            Upload one or more supporting images (JPG, JPEG, or
                            PNG, max 5MB each).
                        </p>
                    </Field>

                    {value?.student_economic_proofs &&
                        value.student_economic_proofs.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Selected Files
                                </p>

                                <div className="space-y-2">
                                    {value.student_economic_proofs.map(
                                        (proof, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-md border p-2"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <ImagePlus className="size-4 shrink-0" />

                                                    <span className="truncate text-sm">
                                                        {typeof proof.proof ===
                                                        'string'
                                                            ? proof.proof
                                                            : proof.proof?.name}
                                                    </span>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {error && <FieldError>{error}</FieldError>}
                </div>
            )}
        </Field>
    );
}
