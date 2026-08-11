import { format } from 'date-fns';
import isEqual from 'lodash/isEqual';
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    ArrowUpDownIcon,
    BookTextIcon,
    CalendarIcon,
    ChartNoAxesColumn,
    ChevronDownIcon,
    GraduationCap,
    RefreshCwIcon,
    School2,
    SearchIcon,
    SlidersHorizontalIcon,
    Users2,
    XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import DropdownFilter from '@/components/dropdown-filter';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDropdowns } from '@/hooks/use-dropdowns';
import apiService from '@/lib/api-service';
import { fetchCourses, fetchSections, fetchYearLevels } from '@/routes';
import type { StudentFilters } from '@/types/entities';
import { defaultStudentFilters } from '@/types/entities';

type FilterProps = {
    data: StudentFilters;
    setFilter: (key: string, value: any) => void;
    total: number | null;
    onRefresh: () => void;
};

export default function TableFilter({
    data,
    setFilter,
    total,
    onRefresh,
}: FilterProps) {
    const [searchVal, setSearchVal] = useState('');
    const [range, setRange] = useState<DateRange | undefined>(undefined);
    const { studentTypes } = useDropdowns();
    const [courses, setCourses] = useState<string[]>([]);
    const [yearLevels, setYearLevels] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilter('search', searchVal || null);
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchVal]);

    const resetFilter = () => {
        Object.entries(defaultStudentFilters).forEach(([key, value]) => {
            setFilter(key, value);
        });
        setRange(undefined);
        setSearchVal('');
    };

    const getCourses = async (campus: string) => {
        try {
            const response = await apiService.get(fetchCourses(campus).url);
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setCourses([]);
        }
    };

    const getYearLevels = async (campus: string, course: string) => {
        try {
            const response = await apiService.get(
                fetchYearLevels({ campus, course }).url,
            );
            setYearLevels(response.data);
        } catch (error) {
            console.error('Failed to fetch year levels:', error);
            setYearLevels([]);
        }
    };

    const getSections = async (
        campus: string,
        course: string,
        year_level: string,
    ) => {
        try {
            const response = await apiService.get(
                fetchSections({ campus, course, year_level }).url,
            );
            setSections(response.data);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
            setSections([]);
        }
    };

    const activeChips: { key: string; label: string; onClear: () => void }[] =
        [];

    if (data.type) {
        activeChips.push({
            key: 'type',
            label: data.type,
            onClear: () => setFilter('type', null),
        });
    }

    if (data.campus) {
        activeChips.push({
            key: 'campus',
            label: data.campus,
            onClear: () => {
                setFilter('campus', null);
                setFilter('course', null);
                setFilter('year_level', null);
                setFilter('section', null);
                setCourses([]);
                setYearLevels([]);
                setSections([]);
            },
        });
    }

    if (data.course) {
        activeChips.push({
            key: 'course',
            label: data.course,
            onClear: () => {
                setFilter('course', null);
                setFilter('year_level', null);
                setFilter('section', null);
                setYearLevels([]);
                setSections([]);
            },
        });
    }

    if (data.year_level) {
        activeChips.push({
            key: 'year_level',
            label: data.year_level,
            onClear: () => {
                setFilter('year_level', null);
                setFilter('section', null);
                setSections([]);
            },
        });
    }

    if (data.section) {
        activeChips.push({
            key: 'section',
            label: data.section,
            onClear: () => setFilter('section', null),
        });
    }

    if (range?.from && range?.to) {
        activeChips.push({
            key: 'date',
            label: `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`,
            onClear: () => {
                setRange(undefined);
                setFilter('date_from', null);
                setFilter('date_to', null);
            },
        });
    }

    const hasActiveFilters = !isEqual(defaultStudentFilters, data);

    return (
        <div className="space-y-3">
            {/* Command bar */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-2 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex min-w-0 flex-1 items-center">
                    <SearchIcon className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search id, email, name..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="h-10 w-full rounded-full border-0 bg-background pr-4 pl-10 text-sm shadow-sm ring-1 ring-transparent transition-shadow outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Icon action cluster */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onRefresh}
                        title="Refresh"
                        className="inline-flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    >
                        <RefreshCwIcon className="size-4" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-10 items-center gap-1 rounded-full bg-background px-3.5 text-sm font-medium shadow-sm"
                            >
                                {data.show}
                                <span className="hidden text-muted-foreground sm:inline">
                                    / page
                                </span>
                                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32" align="end">
                            {[10, 25, 50, 100].map((option) => (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => setFilter('show', option)}
                                    className={
                                        data.show === option
                                            ? 'font-medium text-primary'
                                            : ''
                                    }
                                >
                                    {option} per page
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                title="Sort"
                                className="inline-flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                            >
                                <ArrowUpDownIcon className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuGroup className="space-y-2 p-2 pt-0">
                                <Select
                                    value={data.sort}
                                    onValueChange={(value) =>
                                        setFilter('sort', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="id">
                                                #
                                            </SelectItem>
                                            <SelectItem value="fname">
                                                First name
                                            </SelectItem>
                                            <SelectItem value="lname">
                                                Last name
                                            </SelectItem>
                                            <SelectItem value="email">
                                                Email
                                            </SelectItem>
                                            <SelectItem value="gender">
                                                Gender
                                            </SelectItem>
                                            <SelectItem value="campus">
                                                Campus
                                            </SelectItem>
                                            <SelectItem value="course">
                                                Course
                                            </SelectItem>
                                            <SelectItem value="created_at">
                                                Date created
                                            </SelectItem>
                                            <SelectItem value="updated_at">
                                                Date updated
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter('order', 'asc')
                                        }
                                        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                                            data.order === 'asc'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                        }`}
                                    >
                                        <ArrowDownNarrowWide className="size-3.5" />
                                        Asc
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter('order', 'desc')
                                        }
                                        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                                            data.order === 'desc'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                        }`}
                                    >
                                        <ArrowUpNarrowWide className="size-3.5" />
                                        Desc
                                    </button>
                                </div>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    <span className="mr-0.5 hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                        <SlidersHorizontalIcon className="size-3.5" />
                        Filters
                    </span>

                    <DropdownFilter
                        label="Student type"
                        filterKey="type"
                        options={studentTypes}
                        value={data.type ?? ''}
                        onSelect={setFilter}
                        icon={Users2}
                    />
                    <DropdownFilter
                        label="Campus"
                        filterKey="campus"
                        options={[
                            'Talisay',
                            'Alijis',
                            'Fortune Towne',
                            'Binalbagan',
                        ]}
                        value={data.campus ?? ''}
                        onSelect={(key, value) => {
                            setFilter(key, value);
                            setFilter('course', null);
                            setFilter('year_level', null);
                            setFilter('section', null);

                            setCourses([]);
                            setYearLevels([]);
                            setSections([]);

                            if (value) {
                                getCourses(value);
                            }
                        }}
                        icon={School2}
                    />
                    <DropdownFilter
                        label="Course"
                        disabled={courses.length === 0}
                        filterKey="course"
                        options={courses}
                        value={data.course || ''}
                        onSelect={(key, value) => {
                            setFilter(key, value);
                            setFilter('year_level', null);
                            setFilter('section', null);

                            setYearLevels([]);
                            setSections([]);

                            if (data.campus && value) {
                                getYearLevels(data.campus, value);
                            }
                        }}
                        icon={GraduationCap}
                    />
                    <DropdownFilter
                        label="Year level"
                        disabled={yearLevels.length === 0}
                        filterKey="year_level"
                        options={yearLevels}
                        value={data.year_level || ''}
                        onSelect={(key, value) => {
                            setFilter(key, value);
                            setFilter('section', null);

                            setSections([]);

                            if (data.campus && data.course && value) {
                                getSections(data.campus, data.course, value);
                            }
                        }}
                        icon={ChartNoAxesColumn}
                    />
                    <DropdownFilter
                        label="Section"
                        disabled={sections.length === 0}
                        filterKey="section"
                        options={sections}
                        value={data.section || ''}
                        onSelect={(key, value) => {
                            setFilter(key, value);
                        }}
                        icon={BookTextIcon}
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
                                    range?.from && range?.to
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                <CalendarIcon className="size-3.5 shrink-0" />
                                <span>
                                    {range?.from && range?.to
                                        ? `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`
                                        : 'Date Submitted'}
                                </span>
                                <ChevronDownIcon
                                    className={`size-3.5 shrink-0 ${range?.from && range?.to ? 'opacity-80' : 'text-muted-foreground'}`}
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-auto p-0"
                            align="start"
                        >
                            <Calendar
                                mode="range"
                                selected={range}
                                buttonVariant="secondary"
                                captionLayout="dropdown"
                                classNames={{ today: '' }}
                                onSelect={(newRange) => {
                                    if (!newRange) {
                                        return;
                                    }

                                    setRange(newRange);

                                    setFilter(
                                        'date_from',
                                        format(newRange.from!, 'yyyy-MM-dd'),
                                    );
                                    setFilter(
                                        'date_to',
                                        format(newRange.to!, 'yyyy-MM-dd'),
                                    );
                                }}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <Badge className="rounded-full px-2.5 tabular-nums">
                        {Number(total).toLocaleString()}
                    </Badge>
                </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
                    {activeChips.map((chip) => (
                        <span
                            key={chip.key}
                            className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-2.5 text-xs font-medium text-secondary-foreground"
                        >
                            {chip.label}
                            <button
                                type="button"
                                onClick={chip.onClear}
                                className="inline-flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 hover:bg-background hover:text-foreground"
                            >
                                <XIcon className="size-3" />
                            </button>
                        </span>
                    ))}

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilter}
                            className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
