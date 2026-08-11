// resources/js/components/admin/student-remarks-dialog.tsx
import { useForm } from '@inertiajs/react';
import { ClipboardPenIcon, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { updateRemarks } from '@/routes';
import type { Student } from '@/types/entities';
import { Field, FieldError, FieldLabel } from '../../ui/field';
// import { updateStudentRemarks } from '@/routes'; // adjust to your actual route helper

interface StudentRemarksDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    student: Student | null;
    onSuccess?: () => void; // e.g. call refresh() from the parent table
}

export default function StudentRemarksDialog({
    open,
    setOpen,
    student,
    onSuccess,
}: StudentRemarksDialogProps) {
    const { data, setData, put, errors, processing, reset, clearErrors } =
        useForm({
            remarks: '',
        });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, reset, clearErrors]);

    const handleSubmit = () => {
        if (!student) {
            return;
        }

        put(updateRemarks(student.id!).url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                onSuccess?.();
                reset();
                clearErrors();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (processing) {
                    return;
                }

                setOpen(next);
            }}
        >
            <DialogContent
                className="gap-0 overflow-hidden p-0 sm:max-w-lg"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-3 border-b bg-muted/40 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <ClipboardPenIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-base">
                                Add Remarks
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                                    {student ? (
                                        <>
                                            <span className="truncate font-medium text-foreground">
                                                {student.full_name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="font-normal"
                                            >
                                                {student.id_number}
                                            </Badge>
                                        </>
                                    ) : (
                                        'Select a student to add remarks.'
                                    )}
                                </div>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2 px-6 py-5">
                    <Field>
                        <FieldLabel htmlFor="remarks">Remarks</FieldLabel>
                        <Textarea
                            id="remarks"
                            placeholder="Enter your remarks here..."
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            rows={6}
                            maxLength={200}
                            aria-invalid={!!errors['remarks']}
                            disabled={processing || !student}
                            className="resize-none"
                            autoFocus
                        />

                        {errors['remarks'] && (
                            <FieldError>{errors['remarks']}</FieldError>
                        )}
                    </Field>
                </div>

                <DialogFooter className="gap-2 border-t bg-muted/20 px-6 py-4 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing || !student}
                    >
                        {processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        {processing ? 'Saving...' : 'Save Remarks'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
