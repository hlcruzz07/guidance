import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface SubmittingDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    percentage?: number | null;
}

export function SubmittingDialog({
    open,
    title = 'Submitting Form',
    description = 'Please wait while your information is being processed and securely saved. Kindly do not close or refresh this window.',
    percentage = null,
}: SubmittingDialogProps) {
    const hasProgress = percentage !== null && percentage !== undefined;

    return (
        <Dialog open={open}>
            <DialogContent
                className="overflow-hidden sm:max-w-sm [&>button]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
                    {/* Icon with pulsing ring effect */}
                    <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-primary/20" />
                        <span className="absolute inline-flex h-16 w-16 animate-pulse rounded-full bg-primary/10" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                    </div>

                    {/* Text, fades/slides in */}
                    <div className="animate-in space-y-1.5 duration-500 fade-in slide-in-from-bottom-2">
                        <p className="text-base font-semibold tracking-tight">
                            {title}
                        </p>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {hasProgress && (
                        <div className="w-full space-y-1.5">
                            <Progress value={percentage} className="h-1.5" />
                            <p className="text-right text-xs text-muted-foreground tabular-nums">
                                {Math.round(percentage as number)}%
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
