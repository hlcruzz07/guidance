import { EraserIcon, SaveIcon } from 'lucide-react';
import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SignatureModalProps {
    onSave: (file: File) => void;
    id_number: string | null;
    open: boolean;
    setOpen?: (open: boolean) => void;
}

export default function SignatureModal({
    onSave,
    id_number,
    open,
    setOpen,
}: SignatureModalProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => sigCanvas.current?.clear();

    const applyWhiteBackground = (blob: Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject('Canvas context error');
                }

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (jpgBlob) => {
                        if (!jpgBlob) {
                            reject('Failed to convert to JPEG');
                        } else {
                            resolve(jpgBlob);
                        }
                    },
                    'image/jpeg',
                    0.95,
                );
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    };

    const resizeSignature = (
        blob: Blob,
        width: number,
        height: number,
    ): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject('Canvas error');
                }

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);

                const ratio = Math.min(width / img.width, height / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                const offsetX = (width - newWidth) / 2;
                const offsetY = (height - newHeight) / 2;

                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                canvas.toBlob(
                    (outBlob) => {
                        if (!outBlob) {
                            reject('Resize failed');
                        } else {
                            resolve(outBlob);
                        }
                    },
                    'image/jpeg',
                    0.95,
                );
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    };

    const save = async () => {
        if (!sigCanvas.current) {
            return;
        }

        if (!id_number) {
            toast.error('No Student ID Number found');

            return;
        }

        if (sigCanvas.current.isEmpty()) {
            toast.error('Please draw your signature before saving.');

            return;
        }

        const dataURL = sigCanvas.current.toDataURL('image/png');
        const res = await fetch(dataURL);
        const blob = await res.blob();

        const blobWhite = await applyWhiteBackground(blob);
        const resizedBlob = await resizeSignature(blobWhite, 370, 120);

        const filename = `${id_number}.bmp`;
        const file = new File([resizedBlob], filename, { type: 'image/bmp' });
        onSave(file);

        setOpen?.(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => setOpen?.(o)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add E-Signature</DialogTitle>
                    <DialogDescription>
                        Please draw your signature in the box below, making sure
                        it stays centered within the drawing area.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="flex justify-center overflow-hidden border bg-white">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            minWidth={2}
                            maxWidth={4}
                            canvasProps={{
                                className:
                                    'sigCanvas border border-gray-300 dark:border-gray-600',
                                width: 370,
                                height: 120,
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen?.(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={clear} variant="secondary">
                        Clear <EraserIcon />
                    </Button>

                    <Button type="button" onClick={save}>
                        Save <SaveIcon />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
