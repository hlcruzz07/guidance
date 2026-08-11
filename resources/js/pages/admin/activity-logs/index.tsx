import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import {
    Activity,
    CalendarClock,
    FilePlus2,
    Trash2,
    LogIn,
    Globe,
    Eye,
    PencilLine,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
    CartesianGrid,
    Tooltip as RechartsTooltip,
} from 'recharts';
import { toast } from 'sonner';
import ActivityLogDetailsDialog from '@/components/admin/activity-logs/activity-log-details';
import ActivityLogFilter from '@/components/admin/activity-logs/table-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import TableLayout from '@/layouts/table-layout';
import apiService from '@/lib/api-service';

import { paginateActivityLogs } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// NOTE: add these to your types/entities.ts, mirroring Student / StudentFilters / PaginateStudents
type ActivityLog = {
    id: number;
    action: 'create' | 'update' | 'delete' | 'login';
    description: string;
    email: string;
    ip_address: string | null;
    browser: string | null;
    created_at: string;
    user?: {
        name: string;
        email: string;
    } | null;
};

type ActivityLogFilters = {
    search: string | null;
    action: string | null;
    date_from: string | null;
    date_to: string | null;
    show: number;
    sort: string;
    order: 'asc' | 'desc';
};

const defaultActivityLogFilters: ActivityLogFilters = {
    search: null,
    action: null,
    date_from: null,
    date_to: null,
    show: 10,
    sort: 'created_at',
    order: 'desc',
};

type PaginateActivityLogs = {
    data: ActivityLog[];
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Logs',
        href: '/admin/activity-logs',
    },
];

type IndexStats = {
    total: number;
    today: number;
    creates: number;
    updates: number;
    deletes: number;
    logins: number;
};

type IndexPageProps = {
    stats: IndexStats;
};

export default function Index() {
    const { stats } = usePage<IndexPageProps>().props;

    const [logs, setLogs] = useState<PaginateActivityLogs | null>(null);

    const [filter, setFilter] = useState<ActivityLogFilters>(
        defaultActivityLogFilters,
    );

    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    const updateFilter = (key: string, value: any) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchLogsData = async () => {
        try {
            const { data } = await apiService.get(paginateActivityLogs().url, {
                params: filter,
            });

            setLogs(data);
        } catch (error) {
            console.error('Error fetching activity logs', error);
            setLogs(null);
            toast.error('Something went wrong fetching activity logs.');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLogsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const tableColumns = [
        '#',
        'User',
        'Action',
        'Description',
        'IP Address',
        'Browser',
        'Date',
        'Action',
    ];

    const refresh = async () => {
        const toastId = 'refresh';

        toast.loading('Refreshing...', { id: toastId });

        try {
            await fetchLogsData();

            toast.success('Refreshed!', {
                id: toastId,
            });
        } catch {
            toast.error('Failed to refresh', {
                id: toastId,
            });
        }
    };

    const actionStyles: Record<string, string> = {
        create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        update: 'bg-blue-100 text-blue-700 border-blue-200',
        delete: 'bg-red-100 text-red-700 border-red-200',
        login: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const actionIcons: Record<string, any> = {
        create: FilePlus2,
        update: PencilLine,
        delete: Trash2,
        login: LogIn,
    };

    // Hex fills kept in sync with actionStyles above so the chart and the
    // table badges read as the same data.
    const actionChartData = [
        { name: 'Creates', value: stats?.creates ?? 0, fill: '#10b981' },
        { name: 'Updates', value: stats?.updates ?? 0, fill: '#3b82f6' },
        { name: 'Deletes', value: stats?.deletes ?? 0, fill: '#ef4444' },
        { name: 'Logins', value: stats?.logins ?? 0, fill: '#a855f7' },
    ];

    const todayPct =
        stats?.total > 0 ? Math.round((stats.today / stats.total) * 100) : 0;

    const gaugeData = [
        { name: 'today', value: todayPct, fill: 'oklch(0.636 0.108 172.521)' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <ActivityLogDetailsDialog
                open={openDetailsDialog}
                setOpen={setOpenDetailsDialog}
                log={selectedLog}
            />

            <div className="m-5 mt-0 flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="mt-5 grid gap-4 lg:grid-cols-5">
                    {/* Activity overview: total + today, as a radial gauge */}
                    <div className="flex flex-col rounded-xl border border-sidebar-border/70 bg-card lg:col-span-2 dark:border-sidebar-border">
                        <div className="flex items-center gap-2 border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">
                                Activity Overview
                            </h3>
                        </div>

                        <div className="flex flex-1 items-center gap-4 p-5">
                            <div className="relative h-28 w-28 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="72%"
                                        outerRadius="100%"
                                        data={gaugeData}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            angleAxisId={0}
                                            tick={false}
                                        />
                                        <RadialBar
                                            background={{
                                                fill: 'oklch(0.94 0 0)',
                                            }}
                                            dataKey="value"
                                            cornerRadius={6}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold tabular-nums">
                                        {todayPct}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col gap-3">
                                <div>
                                    <span className="text-2xl font-bold tabular-nums">
                                        {(stats?.total ?? 0).toLocaleString()}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        Total logs recorded
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold tabular-nums">
                                        {(stats?.today ?? 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        logged today
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions breakdown: bar chart, colors matched to table badges */}
                    <div className="flex flex-col rounded-xl border border-sidebar-border/70 bg-card lg:col-span-3 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                            <h3 className="text-sm font-semibold">
                                Actions Breakdown
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                All-time counts by action type
                            </p>
                        </div>

                        <div className="flex-1 p-5" style={{ minHeight: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={actionChartData}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 24,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        horizontal={false}
                                        stroke="oklch(0.9 0 0)"
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 11,
                                            fill: 'oklch(0.55 0 0)',
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={70}
                                        interval={0}
                                        tick={{
                                            fontSize: 12,
                                            fill: 'currentColor',
                                        }}
                                        className="text-foreground"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'oklch(0.96 0 0)' }}
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: '1px solid oklch(0.9 0 0)',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 4, 4, 0]}
                                        maxBarSize={22}
                                    >
                                        {actionChartData.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <TableLayout>
                    <ActivityLogFilter
                        data={filter}
                        setFilter={updateFilter}
                        total={logs?.total ?? null}
                        onRefresh={() => {
                            refresh();
                        }}
                    />

                    <div className="relative mt-3 overflow-x-auto rounded-md lg:border">
                        <table className="table w-full text-left text-base text-foreground">
                            <thead className="lg:border-b">
                                <tr>
                                    {tableColumns.map((header, i) => (
                                        <th key={`${header}-${i}`} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="lg:border-b">
                                {logs?.data.map((row) => {
                                    const ActionIcon =
                                        actionIcons[row.action] ?? Activity;

                                    return (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <td data-label={tableColumns[0]}>
                                                {row.id}
                                            </td>
                                            <td data-label={tableColumns[1]}>
                                                <div className="flex flex-col">
                                                    <p className="m-0! p-0! font-bold">
                                                        {row.user?.name ??
                                                            'Unknown User'}
                                                    </p>
                                                    <small>{row.email}</small>
                                                </div>
                                            </td>
                                            <td data-label={tableColumns[2]}>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        actionStyles[
                                                            row.action
                                                        ] ??
                                                        'border-gray-200 bg-gray-100 text-gray-700'
                                                    }
                                                >
                                                    <ActionIcon className="size-3.5" />{' '}
                                                    {row.action
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        row.action.slice(1)}
                                                </Badge>
                                            </td>
                                            <td data-label={tableColumns[3]}>
                                                {row.description}
                                            </td>
                                            <td data-label={tableColumns[4]}>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Globe className="size-3.5" />
                                                    {row.ip_address ?? '—'}
                                                </div>
                                            </td>
                                            <td data-label={tableColumns[5]}>
                                                {row.browser ?? '—'}
                                            </td>
                                            <td data-label={tableColumns[6]}>
                                                <small>
                                                    {dayjs(
                                                        row.created_at,
                                                    ).format(
                                                        'MMM D, YYYY hh:mm A',
                                                    )}
                                                </small>
                                            </td>
                                            <td data-label={tableColumns[7]}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                setSelectedLog(
                                                                    row,
                                                                );
                                                                setOpenDetailsDialog(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {logs?.data.length === 0 || !logs ? (
                                    <tr>
                                        <td
                                            colSpan={tableColumns.length}
                                            className="force-center p-3 text-center"
                                        >
                                            No activity logs found.
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
                                                    {logs?.from}
                                                </span>
                                                –
                                                <span className="font-medium">
                                                    {logs?.to}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium">
                                                    {logs?.total}
                                                </span>
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {logs?.links?.map(
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
                                                                                paginateActivityLogs()
                                                                                    .url,
                                                                                {
                                                                                    params: {
                                                                                        ...filter,
                                                                                        page,
                                                                                    },
                                                                                },
                                                                            );

                                                                        setLogs(
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
