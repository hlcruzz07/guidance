import { CheckCheckIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';

interface SuccessDialogProps {
    open: boolean;
    message?: string;
    confirmLabel?: string;
    onConfirm: () => void;
}

export function SuccessDialog({
    open,
    message = 'Your information has been submitted successfully.',
    confirmLabel = 'Confirm',
    onConfirm,
}: SuccessDialogProps) {
    return (
        <Dialog open={open}>
            <DialogContent
                className="overflow-hidden sm:max-w-sm [&>button]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
                    {/* Icon with a soft celebratory ring */}
                    <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-green-500/20" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    {/* Message, fades/slides in */}
                    <div className="animate-in space-y-1.5 duration-500 fade-in slide-in-from-bottom-2">
                        <p className="text-base font-semibold tracking-tight">
                            Success
                        </p>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {message}
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={onConfirm} className="w-full sm:w-auto">
                        <CheckCheckIcon /> {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
