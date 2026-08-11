import { useForm } from '@inertiajs/react';
import { Asterisk, MailIcon, UserIcon, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { handleErrors, normalizeName } from '@/lib/utils';
import { createAccount } from '@/routes';
import { Field, FieldError, FieldLabel } from '../../ui/field';

type FormData = {
    email: string;
    name: string;
    role: 'administrator' | 'super_administrator' | null;
    permissions: string[];
};

export function AddAccountDialog({
    open,
    setOpen,
    roles,
    onReload,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    roles: {
        id: number;
        name: string;
    }[];
    onReload?: () => void;
}) {
    const { data, setData, processing, errors, post, clearErrors, reset } =
        useForm<FormData>({
            email: '',
            name: '',
            role: null,
            permissions: [],
        });

    const handleForm = (e: React.FormEvent) => {
        e.preventDefault();

        if (processing) {
            return;
        }

        post(createAccount().url, {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                reset();
                setOpen(false);
                onReload?.();
            },
            onError: (err) => {
                handleErrors(err);
            },
        });
    };

    return (
        <Dialog open={open || processing} onOpenChange={setOpen}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>
                        Create a new user account by providing basic details and
                        assigning roles and permissions.
                    </DialogDescription>
                    <form onSubmit={handleForm} className="my-5 space-y-5">
                        <Field>
                            <FieldLabel htmlFor="email">
                                Email <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <div className="relative flex items-center">
                                <MailIcon
                                    size={15}
                                    className="absolute left-3"
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={data.email ?? ''}
                                    aria-invalid={!!errors['email']}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }

                                    className="py-2 ps-9"
                                    placeholder="Enter email"
                                />
                            </div>
                            {errors['email'] && (
                                <FieldError>{errors['email']}</FieldError>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="name">
                                Name <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                value={data.name ?? ''}
                                aria-invalid={!!errors['name']}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }

                                className="py-2 ps-9"
                                placeholder="Enter name"
                            />
                            {errors['name'] && (
                                <FieldError>{errors['name']}</FieldError>
                            )}
                        </Field>

                        <div className="flex flex-col gap-3">
                            <Label>Roles</Label>
                            <div className="relative flex items-center">
                                <UserIcon
                                    size={15}
                                    className="absolute start-3"
                                />
                                <Select
                                    value={data.role ?? ''}
                                    name="role"
                                    onValueChange={(
                                        value:
                                            | 'administrator'
                                            | 'super_administrator',
                                    ) => {
                                        setData('role', value);
                                    }}
                                >
                                    <SelectTrigger className="w-full ps-9">
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {roles?.map((item, index) => (
                                                <SelectItem
                                                    key={index}
                                                    value={item.name}
                                                >
                                                    {normalizeName(item.name)}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <InputError message={errors['role']} />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    clearErrors();
                                    reset();
                                }}
                                variant="outline"
                            >
                                <X />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Spinner /> Loading...
                                    </>
                                ) : (
                                    <>Submit</>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
