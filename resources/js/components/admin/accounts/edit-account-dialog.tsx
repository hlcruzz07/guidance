import { useForm } from '@inertiajs/react';
import { Asterisk, UserIcon, X } from 'lucide-react';
import { useEffect } from 'react';
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
// import { updateAccount } from '@/routes';
import { updateAccount } from '@/routes';
import type { User } from '@/types';
// import { RoleProps } from '@/types/role';
import { Field, FieldError, FieldLabel } from '../../ui/field';

type FormData = {
    email: string;
    name: string;
    role: any;
};

export function EditAccountDialog({
    open,
    setOpen,
    roles,
    onReload,
    user,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    roles: {
        id: number;
        name: string;
    }[];
    onReload: () => void;
    user: User | null;
}) {
    const { data, setData, processing, errors, put, clearErrors, reset } =
        useForm<FormData>({
            email: user?.email || '',
            name: user?.name || '',
            role: (user?.roles[0]?.name as any) ?? null,
        });

    const handleForm = (e: React.FormEvent) => {
        e.preventDefault();

        if (processing) {
            return;
        }

        if (!user || !user.id) {
            return;
        }

        put(updateAccount(user.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                reset();
                setOpen(false);
                onReload();
            },
            onError: (err) => {
                handleErrors(err);
            },
        });
    };

    useEffect(() => {
        if (!user) {
            return;
        }

        setData({
            email: user?.email || '',
            name: user?.name || '',
            role: user?.roles[0]?.name,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <Dialog open={open || processing} onOpenChange={setOpen}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update the user's account details, including their role
                        and permissions.
                    </DialogDescription>
                    <form onSubmit={handleForm} className="my-5 space-y-5">
                        <Field>
                            <FieldLabel htmlFor="email">
                                Email <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                value={data.email ?? ''}
                                aria-invalid={!!errors['email']}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }

                                className="py-2"
                                placeholder="Enter email"
                            />
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

                                className="py-2"
                                placeholder="Enter name"
                            />
                            {errors['name'] && (
                                <FieldError>{errors['name']}</FieldError>
                            )}
                        </Field>

                        <div className="flex flex-col gap-3">
                            <Label>Role</Label>
                            <div className="relative flex items-center">
                                <UserIcon
                                    size={15}
                                    className="absolute start-3"
                                />
                                <Select
                                    value={data.role ?? ''}
                                    name="role"
                                    onValueChange={(value: any) => {
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
                                    <>Save changes</>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
