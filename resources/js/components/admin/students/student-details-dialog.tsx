import dayjs from 'dayjs';
import {
    ImageIcon,
    UserRound,
    Users,
    GraduationCap,
    Contact,
    Brain,
    ShieldCheck,
    MessageCircleQuestion,
    IdCard,
    MessageSquareText,
    ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getSignature, getProof } from '@/routes';
import type { Student } from '@/types/entities';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    student: Student | null;
};

// Reusable label/value pair for the info grids
function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm font-medium text-foreground">
                {value === null || value === undefined || value === '' ? (
                    <span className="font-normal text-muted-foreground">—</span>
                ) : (
                    value
                )}
            </p>
        </div>
    );
}

function SectionCard({
    title,
    action,
    children,
    className,
}: {
    title?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border bg-card/50 p-4 shadow-sm',
                className,
            )}
        >
            {(title || action) && (
                <div className="mb-3 flex items-center justify-between gap-2">
                    {title && (
                        <p className="text-sm font-semibold text-foreground">
                            {title}
                        </p>
                    )}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
    );
}

// Builds a full, browser-loadable URL from a raw Google Drive file id
// using the getProof Wayfinder route.
function resolveProofUrl(proof: string | null | undefined): string | null {
    if (!proof) {
return null;
}

    return getProof(proof).url;
}

const NAV_ITEMS = [
    { value: 'personal', label: 'Personal', icon: IdCard },
    { value: 'family', label: 'Family', icon: Users },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'siblings', label: 'Siblings', icon: Contact },
    { value: 'psych', label: 'Psych Tests', icon: Brain },
    { value: 'equity', label: 'Equity', icon: ShieldCheck },
    { value: 'concerns', label: 'Concerns', icon: MessageCircleQuestion },
] as const;

function ImagePreviewDialog({
    open,
    setOpen,
    src,
    label,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    src: string | null;
    label?: string;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] w-fit max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <DialogHeader className="border-b px-4 py-3">
                    <DialogTitle className="text-sm">
                        {label ?? 'Proof'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex max-h-[calc(90vh-3rem)] items-center justify-center bg-black/5 p-2">
                    {src && (
                        <img
                            src={src}
                            alt={label ?? 'Proof'}
                            className="max-h-[calc(90vh-4.5rem)] w-auto max-w-full rounded-md object-contain"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function StudentDetailsDialog({
    open,
    setOpen,
    student,
}: Props) {
    // Hooks must run on every render, before any early return.
    const [previewImage, setPreviewImage] = useState<{
        src: string;
        label?: string;
    } | null>(null);

    if (!student) {
return null;
}

    const initials = [student.fname?.[0], student.lname?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase();

    const guardiansWithName =
        student.guardians?.filter((g) => g.fname?.trim() && g.lname?.trim()) ??
        [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className={cn(
                    'flex w-full flex-col gap-0 overflow-hidden p-0',
                    // Full-screen sheet on mobile, centered card from sm up
                    'h-[90dvh] rounded-none',
                    'sm:h-[85vh] sm:max-h-[85vh] sm:max-w-3xl sm:rounded-lg',
                    'lg:max-w-6xl',
                )}
            >
                {/* Header */}
                <DialogHeader className="flex-none border-b bg-gradient-to-r from-primary/5 to-transparent px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:size-11">
                            {initials || <UserRound className="size-5" />}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-sm sm:text-base">
                                {student.full_name}
                            </DialogTitle>
                            <DialogDescription className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm">
                                <span>{student.id_number}</span>
                                <span className="opacity-50">•</span>
                                <span>{student.course_year_section}</span>
                                <span className="opacity-50">•</span>
                                <span>{student.campus}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ImagePreviewDialog
                    open={!!previewImage}
                    setOpen={(open) => !open && setPreviewImage(null)}
                    src={previewImage?.src ?? null}
                    label={previewImage?.label}
                />
                <Tabs
                    defaultValue="personal"
                    orientation="vertical"
                    className="min-h-0 w-full flex-1 flex-col gap-0 sm:flex-row"
                >
                    <TabsList
                        className={cn(
                            'flex-none justify-start gap-1 rounded-none bg-muted/30 p-2',
                            'h-auto w-full flex-row overflow-x-auto border-b',
                            'sm:h-full sm:w-44 sm:flex-col sm:items-stretch sm:overflow-visible sm:border-r sm:border-b-0 sm:p-3',
                        )}
                    >
                        {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className={cn(
                                    'shrink-0 gap-2 rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm',
                                    'flex-row justify-center px-3 py-2',
                                    'sm:w-full sm:justify-start',
                                )}
                            >
                                <Icon className="size-4" />
                                <span className="inline">{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="min-h-0 flex-1">
                        <ScrollArea className="h-full">
                            {/* PERSONAL */}
                            <TabsContent
                                value="personal"
                                className="m-0 space-y-4 p-4 sm:p-6"
                            >
                                <SectionCard title="Contact & Identity">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field
                                            label="Email"
                                            value={student.email}
                                        />
                                        <Field
                                            label="Phone"
                                            value={student.phone}
                                        />
                                        <Field
                                            label="Gender"
                                            value={student.gender}
                                        />
                                        <Field
                                            label="Civil Status"
                                            value={student.civil_status}
                                        />
                                        <Field
                                            label="Sexual Orientation"
                                            value={student.sexual_orientation}
                                        />
                                        <Field
                                            label="Religion"
                                            value={student.religion}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Background">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field
                                            label="Date of Birth"
                                            value={
                                                student.date_of_birth
                                                    ? dayjs(
                                                          student.date_of_birth,
                                                      ).format('MMM D, YYYY')
                                                    : null
                                            }
                                        />
                                        <Field
                                            label="Age"
                                            value={
                                                student.date_of_birth
                                                    ? `${dayjs().diff(
                                                          dayjs(
                                                              student.date_of_birth,
                                                          ),
                                                          'year',
                                                      )} yrs old`
                                                    : null
                                            }
                                        />
                                        <Field
                                            label="Place of Birth"
                                            value={student.place_of_birth}
                                        />
                                        <Field
                                            label="Nationality"
                                            value={student.nationality}
                                        />
                                        <Field
                                            label="Height"
                                            value={
                                                student.height
                                                    ? `${student.height} cm`
                                                    : '—'
                                            }
                                        />
                                        <Field
                                            label="Weight"
                                            value={
                                                student.weight
                                                    ? `${student.weight} cm`
                                                    : '—'
                                            }
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Address">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Current Address"
                                            value={student.current_address}
                                        />
                                        <Field
                                            label="Home Address"
                                            value={student.home_address}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Academic & Financial">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field
                                            label="Last School Attended"
                                            value={student.last_school_attended}
                                        />

                                        <Field
                                            label="General Average (HS/SHS/College)"
                                            value={student.general_average}
                                        />
                                        <Field
                                            label="Strand / Course"
                                            value={student.strand_course}
                                        />
                                        <Field
                                            label="Scholarship"
                                            value={
                                                student.has_scholarship ? (
                                                    <Badge variant="secondary">
                                                        {student.scholarship ??
                                                            'Yes'}
                                                    </Badge>
                                                ) : (
                                                    'None'
                                                )
                                            }
                                        />
                                        <Field
                                            label="Nature of Residence"
                                            value={student.nature_of_residence}
                                        />
                                        <Field
                                            label="Weekly Allowance"
                                            value={
                                                student.weekly_allowance
                                                    ? Number(
                                                          student.weekly_allowance,
                                                      ).toLocaleString()
                                                    : ''
                                            }
                                        />
                                        <Field
                                            label="Household Income"
                                            value={student.household_income}
                                        />
                                        <Field
                                            label="Financer"
                                            value={student.financer}
                                        />
                                        <Field
                                            label="Birth Order"
                                            value={student.birth_order}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Emergency Contact">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field
                                            label="Contact Person"
                                            value={student.contact_person}
                                        />
                                        <Field
                                            label="Relationship"
                                            value={
                                                student.contact_person_relationship
                                            }
                                        />
                                        <Field
                                            label="Contact Mobile"
                                            value={
                                                student.contact_person_mobile_um
                                            }
                                        />
                                        <Field
                                            label="Contact Address"
                                            value={
                                                student.contact_person_address
                                            }
                                        />
                                    </div>
                                </SectionCard>

                                {student.remarks && (
                                    <SectionCard title="Counselor Remarks">
                                        <div className="flex gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                                <MessageSquareText className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-x-2 gap-y-0.5">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {student.counselor
                                                                ?.name ??
                                                                'Unknown counselor'}
                                                        </p>
                                                        <small>
                                                            {
                                                                student
                                                                    .counselor
                                                                    ?.email
                                                            }
                                                        </small>
                                                    </div>
                                                    {student.remarked_at && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {dayjs(
                                                                student.remarked_at,
                                                            ).format(
                                                                'MMM D, YYYY [at] h:mm A',
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 rounded-lg rounded-tl-none border bg-amber-50 px-3 py-2.5 text-sm text-foreground dark:border-amber-900 dark:bg-amber-950/20">
                                                    {student.remarks}
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>
                                )}
                            </TabsContent>

                            {/* FAMILY / GUARDIANS */}
                            <TabsContent
                                value="family"
                                className="m-0 space-y-4 p-4 sm:p-6"
                            >
                                <SectionCard title="Parents' Marital Relationship">
                                    <Field
                                        label="Status"
                                        value={
                                            student.parent_marital_relationship
                                        }
                                    />
                                </SectionCard>

                                {guardiansWithName.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        {guardiansWithName.map((g, i) => {
                                            const isDeceased =
                                                g.life_status?.toLowerCase() ===
                                                'deceased';
                                            const guardianInitials = [
                                                g.fname?.[0],
                                                g.lname?.[0],
                                            ]
                                                .filter(Boolean)
                                                .join('')
                                                .toUpperCase();

                                            return (
                                                <div
                                                    key={g.id ?? i}
                                                    className={cn(
                                                        'overflow-hidden rounded-xl border bg-card/50 shadow-sm',
                                                        isDeceased &&
                                                            'border-muted-foreground/20 bg-muted/20',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                                                        <div
                                                            className={cn(
                                                                'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                                                isDeceased
                                                                    ? 'bg-muted text-muted-foreground'
                                                                    : 'bg-primary/10 text-primary',
                                                            )}
                                                        >
                                                            {guardianInitials || (
                                                                <UserRound className="size-5" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-foreground">
                                                                {`${g.fname} ${g.mname ?? ''} ${g.lname} ${g.suffix ?? ''}`
                                                                    .replace(
                                                                        /\s+/g,
                                                                        ' ',
                                                                    )
                                                                    .trim()}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {g.relationship}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                isDeceased
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                            className="shrink-0"
                                                        >
                                                            {g.life_status ??
                                                                'Unknown Life Status'}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-4 p-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <Field
                                                                label="Birthdate"
                                                                value={
                                                                    g.birthdate
                                                                        ? dayjs(
                                                                              g.birthdate,
                                                                          ).format(
                                                                              'MMM D, YYYY',
                                                                          )
                                                                        : null
                                                                }
                                                            />
                                                            <Field
                                                                label="Birthplace"
                                                                value={
                                                                    g.birthplace
                                                                }
                                                            />
                                                            <Field
                                                                label="Occupation"
                                                                value={
                                                                    g.occupation
                                                                }
                                                            />
                                                            <Field
                                                                label="Phone"
                                                                value={g.phone}
                                                            />
                                                            <Field
                                                                label="Education"
                                                                value={
                                                                    g.highest_educ_attainment
                                                                }
                                                            />
                                                            <Field
                                                                label="Religion"
                                                                value={
                                                                    g.religion
                                                                }
                                                            />
                                                            <Field
                                                                label="Nationality"
                                                                value={
                                                                    g.nationality
                                                                }
                                                            />
                                                        </div>

                                                        {isDeceased && (
                                                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                                                <p className="mb-2 text-xs font-medium tracking-wide text-destructive uppercase">
                                                                    Deceased
                                                                    Details
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <Field
                                                                        label="Cause of Death"
                                                                        value={
                                                                            g.cause_of_death
                                                                        }
                                                                    />
                                                                    <Field
                                                                        label="Year of Death"
                                                                        value={
                                                                            g.year_of_death
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState label="No guardian information" />
                                )}
                            </TabsContent>

                            {/* EDUCATION */}
                            <TabsContent
                                value="education"
                                className="m-0 space-y-4 p-4 sm:p-6"
                            >
                                {student.educations?.length ? (
                                    student.educations.map((e, i) => (
                                        <SectionCard
                                            key={e.id ?? i}
                                            title={e.education_level}
                                            action={
                                                <Badge variant="outline">
                                                    {e.school_type}
                                                </Badge>
                                            }
                                        >
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <Field
                                                    label="School"
                                                    value={e.school_name}
                                                />
                                                <Field
                                                    label="Year Covered"
                                                    value={e.year_covered}
                                                />
                                                <Field
                                                    label="Honors Received"
                                                    value={e.honor_receieved}
                                                />
                                            </div>
                                        </SectionCard>
                                    ))
                                ) : (
                                    <EmptyState label="No education records." />
                                )}
                            </TabsContent>

                            {/* SIBLINGS */}
                            <TabsContent
                                value="siblings"
                                className="m-0 space-y-3 p-4 sm:p-6"
                            >
                                {student.siblings?.length ? (
                                    student.siblings.map((s, i) => (
                                        <div
                                            key={s.id ?? i}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card/50 p-4 shadow-sm"
                                        >
                                            <p className="text-sm font-medium">
                                                {s.fname} {s.mname}{' '}
                                                {s.lname}{' '}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {s.gender === 'Male' ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-indigo-500"
                                                    >
                                                        Male
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-fuchsia-500"
                                                    >
                                                        Female
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant={
                                                        s.is_employed
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {s.is_employed
                                                        ? 'Employed'
                                                        : 'Unemployed'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState label="No sibling records." />
                                )}
                            </TabsContent>

                            {/* PSYCH TESTS */}
                            <TabsContent
                                value="psych"
                                className="m-0 space-y-4 p-4 sm:p-6"
                            >
                                {student.psych_tests?.length ? (
                                    student.psych_tests.map((p, i) => (
                                        <SectionCard
                                            key={p.id ?? i}
                                            title={p.test_name}
                                            action={
                                                p.date_taken && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {dayjs(
                                                            p.date_taken,
                                                        ).format('MMM D, YYYY')}
                                                    </span>
                                                )
                                            }
                                        >
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field
                                                    label="Result"
                                                    value={p.test_result}
                                                />
                                                <Field
                                                    label="Interpretation"
                                                    value={p.interpretation}
                                                />
                                            </div>
                                        </SectionCard>
                                    ))
                                ) : (
                                    <EmptyState label="No psych test records." />
                                )}
                            </TabsContent>

                            {/* EQUITY GROUPS (proof = image, served via getProof) */}
                            <TabsContent
                                value="equity"
                                className="m-0 space-y-4 p-4 sm:p-6"
                            >
                                {student.equity_groups?.length ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {student.equity_groups.map((eq, i) => {
                                            const proofUrl = resolveProofUrl(
                                                eq.proof,
                                            );

                                            return (
                                                <div
                                                    key={eq.id ?? i}
                                                    className="overflow-hidden rounded-xl border bg-card/50 shadow-sm"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            proofUrl &&
                                                            setPreviewImage({
                                                                src: proofUrl,
                                                                label: eq.equity_group,
                                                            })
                                                        }
                                                        disabled={!proofUrl}
                                                        className="group relative block aspect-video w-full overflow-hidden bg-muted disabled:cursor-default"
                                                    >
                                                        {proofUrl ? (
                                                            <>
                                                                <img
                                                                    src={
                                                                        proofUrl
                                                                    }
                                                                    alt={
                                                                        eq.equity_group
                                                                    }
                                                                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                                                                    <ZoomIn className="size-6 text-white drop-shadow" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                                <ImageIcon className="size-6" />
                                                            </div>
                                                        )}
                                                    </button>
                                                    <div className="p-3">
                                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                            Equity Group
                                                        </p>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {eq.equity_group}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState label="No equity group records." />
                                )}
                            </TabsContent>

                            {/* CONCERNS */}
                            <TabsContent
                                value="concerns"
                                className="m-0 space-y-3 p-4 sm:p-6"
                            >
                                {student.concerns?.length ? (
                                    student.concerns.map((c, i) => (
                                        <div
                                            key={c.id ?? i}
                                            className="rounded-xl border bg-card/50 p-4 shadow-sm"
                                        >
                                            <p className="text-sm font-semibold">
                                                {c.question}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {c.answer}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState label="No concerns recorded." />
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
