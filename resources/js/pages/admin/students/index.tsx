import { Head, usePage } from '@inertiajs/react';

import dayjs from 'dayjs';
import {
    Award,
    CheckCheck,
    ClipboardPenIcon,
    ClockIcon,
    Mars,
    Printer,
    UserSearchIcon,
    Users,
    UserPlus,
    Venus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StudentDetailsDialog from '@/components/admin/students/student-details-dialog';
import StudentSIIPrintForm from '@/components/admin/students/student-print-form';
import StudentRemarksDialog from '@/components/admin/students/student-remarks-dialog';
import TableFilter from '@/components/admin/students/table-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import TableLayout from '@/layouts/table-layout';
import apiService from '@/lib/api-service';
import { paginateStudents } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { defaultStudentFilters } from '@/types/entities';
import type {
    StudentFilters,
    Student,
    PaginateStudents,
} from '@/types/entities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/admin/students',
    },
];

type IndexStats = {
    total: number;
    new_this_week: number;
    pending_review: number;
    with_scholarship: number;
};

type IndexPageProps = {
    stats: IndexStats;
};

export default function Index() {
    const { stats } = usePage<IndexPageProps>().props;

    const [students, setStudents] = useState<PaginateStudents | null>(null);

    const [filter, setFilter] = useState<StudentFilters>(defaultStudentFilters);

    // NEW: which student is currently queued up to print
    const [printStudent, setPrintStudent] = useState<Student | null>(null);

    const updateFilter = (key: string, value: any) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchStudentsData = async () => {
        try {
            const { data } = await apiService.get(paginateStudents().url, {
                params: filter,
            });

            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
            setStudents(null);
            toast.error('Something went wrong fetching students.');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStudentsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        if (!printStudent) {
            return;
        }

        const printRoot = document.getElementById('print-root');

        if (!printRoot) {
            return;
        }

        const images = Array.from(printRoot.querySelectorAll('img'));

        const waitForImages = Promise.all(
            images.map(
                (img) =>
                    new Promise<void>((resolve) => {
                        if (img.complete && img.naturalWidth > 0) {
                            resolve();
                        } else {
                            img.onload = () => resolve();
                            img.onerror = () => resolve();
                        }
                    }),
            ),
        );

        waitForImages.then(() => {
            requestAnimationFrame(() => {
                window.print();
            });
        });

        const afterPrint = () => setPrintStudent(null);

        window.addEventListener('afterprint', afterPrint);

        return () => {
            window.removeEventListener('afterprint', afterPrint);
        };
    }, [printStudent]);
    const tableColumns = [
        '#',
        'ID Number',
        'Name',
        'Campus',
        'Mobile #',
        'Gender',
        'Remarks Status',
        'Student Type',
        'Date',
        'Action',
    ];

    const refresh = async () => {
        const toastId = 'refresh';

        toast.loading('Refreshing...', { id: toastId });

        try {
            await fetchStudentsData();

            toast.success('Refreshed!', {
                id: toastId,
            });
        } catch {
            toast.error('Failed to refresh', {
                id: toastId,
            });
        }
    };
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null,
    );

    const studentTypeStyles: Record<string, string> = {
        Freshmen: 'bg-blue-100 text-blue-700 border-blue-200',
        Shiftee: 'bg-amber-100 text-amber-700 border-amber-200',
        Transferee: 'bg-purple-100 text-purple-700 border-purple-200',
        Returnee: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    const widgets = [
        {
            label: 'Total Students',
            value: stats?.total ?? 0,
            icon: Users,
        },
        {
            label: 'New This Week',
            value: stats?.new_this_week ?? 0,
            icon: UserPlus,
        },
        {
            label: 'Pending Review',
            value: stats?.pending_review ?? 0,
            icon: ClockIcon,
            warn: true,
        },
        {
            label: 'On Scholarship',
            value: stats?.with_scholarship ?? 0,
            icon: Award,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <StudentDetailsDialog
                open={openStudentDialog}
                setOpen={setOpenStudentDialog}
                student={selectedStudent}
            />
            <StudentRemarksDialog
                open={openRemarksDialog}
                setOpen={setOpenRemarksDialog}
                student={selectedStudent}
                onSuccess={fetchStudentsData}
            />

            <StudentSIIPrintForm student={printStudent} />

            <div className="m-5 mt-0 flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {widgets.map(({ label, value, icon: Icon, warn }) => (
                        <div
                            key={label}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 transition-colors hover:border-primary/30 dark:border-sidebar-border"
                        >
                            <div
                                className="absolute inset-x-0 top-0 h-1 opacity-80"
                                style={{
                                    background: warn
                                        ? 'linear-gradient(90deg, oklch(0.75 0.14 70), oklch(0.68 0.16 40))'
                                        : 'linear-gradient(90deg, oklch(0.781 0.123 156.451), oklch(0.490 0.08 176.516))',
                                }}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {label}
                                </span>
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                        warn
                                            ? 'bg-amber-500/10'
                                            : 'bg-primary/10'
                                    }`}
                                >
                                    <Icon
                                        className={`h-4.5 w-4.5 ${
                                            warn
                                                ? 'text-amber-600'
                                                : 'text-primary'
                                        }`}
                                    />
                                </div>
                            </div>
                            <span className="mt-4 text-3xl font-bold tabular-nums">
                                {value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
                <TableLayout>
                    <TableFilter
                        data={filter}
                        setFilter={updateFilter}
                        total={students?.total ?? null}
                        onRefresh={() => {
                            refresh();
                        }}
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
                                {students?.data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-muted/50"
                                    >
                                        <td data-label={tableColumns[0]}>
                                            {row.id}
                                        </td>
                                        <td data-label={tableColumns[1]}>
                                            {row.id_number}
                                        </td>
                                        <td data-label={tableColumns[2]}>
                                            <div className="flex flex-col">
                                                <p className="m-0! p-0! font-bold">
                                                    {row.full_name}{' '}
                                                    <span className="text-xs">
                                                        (
                                                        {dayjs().diff(
                                                            dayjs(
                                                                row.date_of_birth,
                                                            ),
                                                            'year',
                                                        )}
                                                        )
                                                    </span>
                                                </p>
                                                <small>{row.email}</small>
                                            </div>
                                        </td>

                                        <td data-label={tableColumns[3]}>
                                            <div className="flex flex-col">
                                                <p className="m-0! p-0! font-bold">
                                                    {row.campus}{' '}
                                                </p>
                                                <small>
                                                    {row.course_year_section}
                                                </small>
                                            </div>
                                        </td>
                                        <td data-label={tableColumns[4]}>
                                            0{row.phone}
                                        </td>

                                        <td data-label={tableColumns[5]}>
                                            {row.gender === 'Male' ? (
                                                <Badge
                                                    className="bg-indigo-500 text-white"
                                                    variant={'secondary'}
                                                >
                                                    <Mars /> {row.gender}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    className="bg-fuchsia-500 text-white"
                                                    variant={'secondary'}
                                                >
                                                    <Venus /> {row.gender}
                                                </Badge>
                                            )}
                                        </td>

                                        <td data-label={tableColumns[6]}>
                                            {row.remarks ? (
                                                <Badge variant="default">
                                                    <CheckCheck /> Complete
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    <ClockIcon /> Pending
                                                </Badge>
                                            )}
                                        </td>
                                        <td data-label={tableColumns[7]}>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    studentTypeStyles[
                                                        row.type
                                                    ] ??
                                                    'border-gray-200 bg-gray-100 text-gray-700'
                                                }
                                            >
                                                {row.type}
                                            </Badge>
                                        </td>
                                        <td data-label={tableColumns[8]}>
                                            <div className="flex flex-col font-medium">
                                                <small>
                                                    Created:{' '}
                                                    {dayjs(
                                                        row.created_at,
                                                    ).format(
                                                        `MMM D, YYYY hh:mm A`,
                                                    )}
                                                </small>
                                                <small>
                                                    Updated:{' '}
                                                    {dayjs(
                                                        row.created_at,
                                                    ).format(
                                                        `MMM D, YYYY hh:mm A`,
                                                    )}
                                                </small>
                                                {row.remarked_at && (
                                                    <small>
                                                        Remarked:{' '}
                                                        {dayjs(
                                                            row.remarked_at,
                                                        ).format(
                                                            `MMM D, YYYY hh:mm A`,
                                                        )}
                                                    </small>
                                                )}
                                            </div>
                                        </td>

                                        <td data-label={tableColumns[9]}>
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                setSelectedStudent(
                                                                    row,
                                                                );
                                                                setOpenStudentDialog(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <UserSearchIcon className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Student</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            disabled={
                                                                !!row.remarks
                                                            }
                                                            size="icon"
                                                            className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                setSelectedStudent(
                                                                    row,
                                                                );
                                                                setOpenRemarksDialog(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <ClipboardPenIcon className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Remark</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600"
                                                            onClick={() => {
                                                                setPrintStudent(
                                                                    row,
                                                                );
                                                            }}
                                                            disabled={
                                                                !row.e_signature
                                                            }
                                                        >
                                                            {!row.e_signature ? (
                                                                <Spinner className="size-4" />
                                                            ) : (
                                                                <Printer className="size-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Print</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students?.data.length === 0 || !students ? (
                                    <>
                                        <tr>
                                            <td
                                                colSpan={tableColumns.length}
                                                className="force-center p-3 text-center"
                                            >
                                                No students found.
                                            </td>
                                        </tr>
                                    </>
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
                                                    {students?.from}
                                                </span>
                                                –
                                                <span className="font-medium">
                                                    {students?.to}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium">
                                                    {students?.total}
                                                </span>
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {students?.links?.map(
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
                                                                                paginateStudents()
                                                                                    .url,
                                                                                {
                                                                                    params: {
                                                                                        ...filter,
                                                                                        page,
                                                                                    },
                                                                                },
                                                                            );

                                                                        setStudents(
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
