import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

import { UserPenIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AccountFilter from '@/components/admin/accounts/accounts-table-filter';
import { EditAccountDialog } from '@/components/admin/accounts/edit-account-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import TableLayout from '@/layouts/table-layout';
import apiService from '@/lib/api-service';
import { accounts, paginateAccounts } from '@/routes';
import type { BreadcrumbItem, PaginateUsers, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: accounts().url,
    },
];

type PageProps = {
    roles: {
        id: number;
        name: string;
    }[];
};

export default function Index() {
    const { roles } = usePage<PageProps>().props;

    const [accountsData, setAccountsData] = useState<PaginateUsers | null>(
        null,
    );

    const [filter, setFilter] = useState<any>({
        search: null,
        role: null,
        email: null,
        show: 10,
        sort: 'id',
        order: 'desc',
    });

    const updateFilter = (key: string, value: any) => {
        setFilter((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchAccountsData = async () => {
        try {
            const { data } = await apiService.get(paginateAccounts().url, {
                params: filter,
            });

            setAccountsData(data);
        } catch (error) {
            console.error('Error fetching accounts', error);
            setAccountsData(null);
            toast.error('Something went wrong fetching accounts.');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAccountsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const getInitials = useInitials();
    const tableColumns = [
        '#',
        'Picture',
        'Name',
        'Email',
        'Role',
        'Date',
        'Action',
    ];

    const roleStyles: Record<string, string> = {
        Admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        Counselor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Staff: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    const refresh = async () => {
        const toastId = 'refresh';

        toast.loading('Refreshing...', { id: toastId });

        try {
            await fetchAccountsData();

            toast.success('Refreshed!', {
                id: toastId,
            });
        } catch {
            toast.error('Failed to refresh', {
                id: toastId,
            });
        }
    };

    const [openEditAccountModal, setOpenEditAccountModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />

            <EditAccountDialog
                open={openEditAccountModal}
                setOpen={setOpenEditAccountModal}
                user={selectedUser}
                onReload={fetchAccountsData}
                roles={roles}
            />

            <div className="m-5 mt-0 flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <TableLayout>
                    <AccountFilter
                        data={filter}
                        setFilter={updateFilter}
                        total={accountsData?.total ?? null}
                        onRefresh={() => {
                            refresh();
                        }}
                        roles={roles}
                    />

                    <div className="relative mt-3 overflow-x-auto rounded-md lg:border">
                        <table className="table w-full text-left text-base text-foreground">
                            <thead className="lg:border-b">
                                <tr>
                                    {tableColumns.map((header) => (
                                        <th key={header} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="lg:border-b">
                                {accountsData?.data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-muted/50"
                                    >
                                        <td data-label={tableColumns[0]}>
                                            {row.id}
                                        </td>
                                        <td data-label={tableColumns[1]}>
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    src={row.avatar ?? ''}
                                                    alt={row.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(row.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </td>
                                        <td data-label={tableColumns[2]}>
                                            <p className="m-0! p-0! font-bold">
                                                {row.name}
                                            </p>
                                        </td>
                                        <td data-label={tableColumns[3]}>
                                            {row.email}
                                        </td>
                                        <td data-label={tableColumns[4]}>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    roleStyles[
                                                        row.roles[0].name
                                                    ] ??
                                                    'border-gray-200 bg-gray-100 text-gray-700'
                                                }
                                            >
                                                {row.roles[0].name}
                                            </Badge>
                                        </td>
                                        <td data-label={tableColumns[5]}>
                                            <div className="flex flex-col font-medium">
                                                <small>
                                                    Created:{' '}
                                                    {dayjs(
                                                        row.created_at,
                                                    ).format(
                                                        `MMM D, YYYY hh:mm A`,
                                                    )}
                                                </small>
                                            </div>
                                        </td>
                                        <td data-label={tableColumns[6]}>
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                setSelectedUser(
                                                                    row,
                                                                );
                                                                setOpenEditAccountModal(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <UserPenIcon className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit Account</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {accountsData?.data.length === 0 ||
                                !accountsData ? (
                                    <tr>
                                        <td
                                            colSpan={tableColumns.length}
                                            className="force-center p-3 text-center"
                                        >
                                            No accounts found.
                                        </td>
                                    </tr>
                                ) : (
                                    ''
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td
                                        colSpan={tableColumns.length}
                                        className="px-6 py-4"
                                    >
                                        <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                <span className="font-medium">
                                                    {accountsData?.from}
                                                </span>
                                                –
                                                <span className="font-medium">
                                                    {accountsData?.to}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium">
                                                    {accountsData?.total}
                                                </span>
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {accountsData?.links?.map(
                                                    (link, idx) => {
                                                        let page:
                                                            string | null =
                                                            null;

                                                        if (link.url) {
                                                            const url = new URL(
                                                                link.url,
                                                            );
                                                            page =
                                                                url.searchParams.get(
                                                                    'page',
                                                                );
                                                        }

                                                        return (
                                                            <button
                                                                key={idx}
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                onClick={async (
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();

                                                                    if (!page) {
                                                                        return;
                                                                    }

                                                                    try {
                                                                        const {
                                                                            data,
                                                                        } =
                                                                            await apiService.get(
                                                                                paginateAccounts()
                                                                                    .url,
                                                                                {
                                                                                    params: {
                                                                                        ...filter,
                                                                                        page,
                                                                                    },
                                                                                },
                                                                            );

                                                                        setAccountsData(
                                                                            data,
                                                                        );
                                                                    } catch (error) {
                                                                        console.error(
                                                                            'Failed to fetch page:',
                                                                            error,
                                                                        );
                                                                    }
                                                                }}
                                                                className={`rounded px-3 py-1 ${
                                                                    link.active
                                                                        ? 'bg-primary text-white dark:text-black'
                                                                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                                }`}
                                                                type="button"
                                                            >
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: link.label,
                                                                    }}
                                                                />
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </TableLayout>
            </div>
        </AppLayout>
    );
}
