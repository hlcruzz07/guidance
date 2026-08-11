import { Head, usePage } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Building2,
    HeartHandshake,
    TrendingUp,
} from 'lucide-react';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type DashboardStats = {
    total_students: number;
    new_this_week: number;
    total_campuses: number;
};

type CampusBreakdown = {
    campus: string;
    total: number;
};

type RemarksByCampus = {
    campus: string;
    remarked: number;
    not_remarked: number;
};

type DashboardProps = {
    stats: DashboardStats;
    campusBreakdown?: CampusBreakdown[];
    remarksByCampus?: RemarksByCampus[];
};

const TODAY = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
});

export default function Index() {
    const {
        stats,
        campusBreakdown = [],
        remarksByCampus = [],
    } = usePage<DashboardProps>().props;

    const campuses = Array.isArray(campusBreakdown) ? campusBreakdown : [];
    const remarksSource = Array.isArray(remarksByCampus) ? remarksByCampus : [];

    const weeklyGrowth =
        stats.total_students > 0
            ? Math.round((stats.new_this_week / stats.total_students) * 100)
            : 0;

    const maxCampusTotal = Math.max(1, ...campuses.map((c) => c.total));

    const totalRemarked = remarksSource.reduce(
        (sum, r) => sum + Number(r.remarked),
        0,
    );
    const coveragePct =
        stats.total_students > 0
            ? Math.round((totalRemarked / stats.total_students) * 100)
            : 0;

    const gaugeData = [
        {
            name: 'coverage',
            value: coveragePct,
            fill: 'oklch(0.636 0.108 172.521)',
        },
    ];

    const cards = [
        {
            label: 'Total Students',
            value: stats.total_students,
            icon: Users,
            meta: `${stats.total_campuses} campus${stats.total_campuses === 1 ? '' : 'es'}`,
        },
        {
            label: 'New This Week',
            value: stats.new_this_week,
            icon: UserPlus,
            meta: weeklyGrowth > 0 ? `+${weeklyGrowth}% of total` : 'No change',
            highlight: weeklyGrowth > 0,
        },
        {
            label: 'Campuses',
            value: stats.total_campuses,
            icon: Building2,
            meta: campuses[0]
                ? `${campuses[0].campus} leads`
                : 'No records yet',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Hero band */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium tracking-wide text-primary/70 uppercase">
                        {TODAY}
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Guidance overview
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Student records and counselor activity across all
                        campuses.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {cards.map(
                        ({ label, value, icon: Icon, meta, highlight }) => (
                            <div
                                key={label}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 transition-colors hover:border-primary/30 dark:border-sidebar-border"
                            >
                                <div
                                    className="absolute inset-x-0 top-0 h-1 opacity-80"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, oklch(0.781 0.123 156.451), oklch(0.490 0.08 176.516))',
                                    }}
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {label}
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Icon className="h-4.5 w-4.5 text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-end justify-between">
                                    <span className="text-3xl font-bold tabular-nums">
                                        {value.toLocaleString()}
                                    </span>
                                    {highlight ? (
                                        <span className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {meta}
                                        </span>
                                    ) : (
                                        <span className="mb-1 text-xs text-muted-foreground">
                                            {meta}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </div>

                <div className="grid flex-1 gap-4 lg:grid-cols-5">
                    {/* Campus breakdown */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card lg:col-span-3 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                            <h3 className="text-sm font-semibold">
                                Students by Campus
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Distribution across all campuses, highest first
                            </p>
                        </div>

                        {campuses.length === 0 ? (
                            <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                                No student records yet.
                            </div>
                        ) : (
                            <div className="space-y-4 p-5">
                                {campuses.map((c, i) => (
                                    <div
                                        key={c.campus}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="truncate font-medium">
                                                    {c.campus}
                                                </span>
                                                <span className="text-muted-foreground tabular-nums">
                                                    {c.total.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${(c.total / maxCampusTotal) * 100}%`,
                                                        background:
                                                            'linear-gradient(90deg, oklch(0.490 0.08 176.516), oklch(0.636 0.108 172.521))',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Counseling coverage gauge */}
                    <div className="flex flex-col rounded-xl border border-sidebar-border/70 bg-card lg:col-span-2 dark:border-sidebar-border">
                        <div className="flex items-center gap-2 border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">
                                Counseling Coverage
                            </h3>
                        </div>

                        {stats.total_students === 0 ? (
                            <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
                                No student records yet.
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-1 p-5">
                                <div className="relative h-40 w-40">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
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
                                                cornerRadius={8}
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold tabular-nums">
                                            {coveragePct}%
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            reviewed
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-center text-xs text-muted-foreground">
                                    {totalRemarked.toLocaleString()} of{' '}
                                    {stats.total_students.toLocaleString()}{' '}
                                    students have a counselor remark
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
