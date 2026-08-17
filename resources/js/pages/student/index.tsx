import { useForm, usePage } from '@inertiajs/react';
import {
    Asterisk,
    Check,
    ChevronsUpDown,
    CopyCheck,
    MailIcon,
    PhoneIcon,
    Plus,
    RulerIcon,
    SendIcon,
    Star,
    Trash2,
    WeightIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import SignatureModal from '@/components/student/SignaturePad';
import { SubmittingDialog } from '@/components/student/SubmittingDialog';

import ThemeButton from '@/components/ThemeButton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDropdowns } from '@/hooks/use-dropdowns';
import {
    capitalizeString,
    fetchNationalities,
    handleErrors,
} from '@/lib/utils';
import { storeStudent } from '@/routes';

import type {
    EquityGroup,
    Guardian,
    PsychTest,
    Student,
    StudentRecord,
} from '@/types/entities';

type StudentForm = Omit<
    Student,
    'id' | 'created_at' | 'updated_at' | 'counselors' | 'remark_by'
>;
type PageProps = {
    student: StudentRecord;
};

type EducationLevel =
    | 'College'
    | 'Vocational'
    | 'Senior High School'
    | 'Junior High School'
    | 'Elementary';

type EducationEntry = {
    education_level: EducationLevel;
    school_name: string;
    year_covered: string;
    school_type: 'Public' | 'Private' | '';
    honor_received: string | null;
};

const EDUCATION_LEVELS_ORDER: EducationLevel[] = [
    'College',
    'Vocational',
    'Senior High School',
    'Junior High School',
    'Elementary',
];

const createEmptyEducationEntry = (
    education_level: EducationLevel,
): EducationEntry => ({
    education_level,
    school_name: '',
    year_covered: '',
    school_type: '',
    honor_received: null,
});

// ---- Home & Family Background types ----

type GuardianRelationship = 'Father' | 'Mother' | 'Guardian';

type GuardianEntry = Omit<
    Guardian,
    'id' | 'student_id' | 'created_at' | 'updated_at'
>;

const GUARDIAN_TYPES_ORDER: GuardianRelationship[] = [
    'Father',
    'Mother',
    'Guardian',
];

const createEmptyGuardianEntry = (
    relationship: GuardianRelationship,
): GuardianEntry => ({
    fname: '',
    mname: null,
    lname: '',
    suffix: null,
    relationship,
    birthdate: '',
    birthplace: '',
    religion: '',
    nationality: '',
    highest_educ_attainment: '',
    phone: '',
    life_status: '',
    cause_of_death: null,
    year_of_death: null,
    occupation: null,
});

const LIFE_STATUS_OPTIONS = ['Living', 'Deceased'];

// ---- Siblings types ----

type SiblingEntry = {
    fname: string;
    mname: string | null;
    lname: string;
    gender: string;
    birthdate: string;
    is_employed: boolean;
};

const createEmptySiblingEntry = (): SiblingEntry => ({
    fname: '',
    mname: null,
    lname: '',
    gender: '',
    birthdate: '',
    is_employed: false,
});

// ---- Equity Target Group Affiliation types ----

const SOLO_PARENT_CHILD_GROUP =
    'Child of a Solo Parent (Living with Mother or Father)';

type EquityGroupEntry = {
    group: string;
    proof: File | null;
    living_with?: 'Mother' | 'Father' | '';
};

// ---- Psychological Test Records types ----

type PsychTestEntry = {
    date_taken: string;
    test_name: string;
    test_result: string;
    interpretation: string;
};

const createEmptyPsychTestEntry = (): PsychTestEntry => ({
    date_taken: '',
    test_name: '',
    test_result: '',
    interpretation: '',
});

// ---- Concerns types ----

type ConcernAnswerType = 'boolean' | 'text';

type ConcernSubQuestion = {
    question: string;
    answer_type: ConcernAnswerType;
};

type ConcernQuestion = {
    question: string;
    answer_type: ConcernAnswerType;
    sub_question?: ConcernSubQuestion[];
};

type ConcernAnswerState = {
    answer: 'Yes' | 'No' | '';
    subAnswer: string;
};

export default function Index() {
    const { student } = usePage<PageProps>().props;

    const flash: any = usePage().props.flash || {};

    useEffect(() => {
        if (!flash) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (flash.success) {
                toast.success(flash.success);
            }

            if (flash.error) {
                toast.error(flash.error);
            }

            if (flash.info) {
                toast.info(flash.info);
            }

            if (flash.warning) {
                toast.warning(flash.warning);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash.success, flash.error, flash.info, flash.warning]);

    const {
        studentTypes,
        sexualOrientations,
        religions,
        contactPersonRelationships,
        maritalRelationships,
        financers,
        houseMonthlyIncomes,
        equityGroups,
        natureResidence,
        concerns,
        highestEducationalAttainments,
    } = useDropdowns();
    const { data, setData, processing, post, errors, progress } =
        useForm<StudentForm>({
            id_number: '',
            campus: '',
            e_signature: null,
            fname: '',
            mname: null,
            lname: '',
            suffix: null,

            email: '',
            phone: '',

            type: '',
            course: '',
            year_level: null,
            section: '',

            gender: '',
            civil_status: '',
            sexual_orientation: '',

            height: null,
            weight: null,
            nationality: '',
            religion: '',

            date_of_birth: '',
            place_of_birth: '',

            last_school_attended: '',

            current_address: '',
            home_address: '',

            general_average: '',
            strand_course: '',
            scholarship: null,
            has_scholarship: false,

            contact_person: '',
            contact_person_address: '',
            contact_person_mobile_um: '',
            contact_person_relationship: '',

            parent_marital_relationship: '',
            birth_order: '',
            financer: '',

            weekly_allowance: '',
            household_income: '',

            nature_of_residence: '',

            guardians: [],
            educations: [],
            siblings: [],
            psych_tests: [],
            equity_groups: [],
            concerns: [],
        });

    const createEmptyConcernAnswers = (): ConcernAnswerState[] =>
        concerns.map(() => ({ answer: '', subAnswer: '' }));

    const [selectedSexualOrientation, setSelectedSexualOrientation] = useState<
        string | null
    >(null);
    const [selectedFinancer, setSelectedFinancer] = useState<string | null>(
        null,
    );
    const [
        selectedParentMaritalRelationship,
        setSelectedParentMaritalRelationship,
    ] = useState<string | null>(null);
    const [selectedNatureOfResidence, setSelectedNatureOfResidence] = useState<
        string | null
    >(null);
    const [nationalityOpen, setNationalityOpen] = useState(false);
    const [nationalities, setNationalities] = useState<string[]>([]);
    const [guardianNationalityOpen, setGuardianNationalityOpen] = useState<
        Record<GuardianRelationship, boolean>
    >({
        Father: false,
        Mother: false,
        Guardian: false,
    });

    // Data Privacy Consent state
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [dataPrivacyConsent, setDataPrivacyConsent] = useState(false);
    useEffect(() => {
        if (!dataPrivacyConsent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSignatureModalOpen(false);
        }
    }, [dataPrivacyConsent]);
    // Educational Background state
    const [educationEntries, setEducationEntries] = useState<
        Record<EducationLevel, EducationEntry>
    >(() => {
        const entries = {} as Record<EducationLevel, EducationEntry>;
        EDUCATION_LEVELS_ORDER.forEach((education_level) => {
            entries[education_level] =
                createEmptyEducationEntry(education_level);
        });

        return entries;
    });
    const [includeCollege, setIncludeCollege] = useState(false);
    const [includeVocational, setIncludeVocational] = useState(false);

    const visibleEducationLevels = useMemo(() => {
        return EDUCATION_LEVELS_ORDER.filter((education_level) => {
            if (education_level === 'College') {
                return includeCollege;
            }

            if (education_level === 'Vocational') {
                return includeVocational;
            }

            return true; // Senior High, Junior High, Elementary are always shown
        });
    }, [includeCollege, includeVocational]);

    const updateEducationField = (
        education_level: EducationLevel,
        field: keyof Omit<EducationEntry, 'education_level'>,
        value: string,
    ) => {
        setEducationEntries((prev) => ({
            ...prev,
            [education_level]: {
                ...prev[education_level],
                [field]: value,
            },
        }));
    };

    // Home & Family Background state (guardians)
    const [guardianEntries, setGuardianEntries] = useState<
        Record<GuardianRelationship, GuardianEntry>
    >(() => {
        const entries = {} as Record<GuardianRelationship, GuardianEntry>;
        GUARDIAN_TYPES_ORDER.forEach((relationship) => {
            entries[relationship] = createEmptyGuardianEntry(relationship);
        });

        return entries;
    });
    const [includeGuardian] = useState(false);

    const visibleGuardianTypes = useMemo(() => {
        return GUARDIAN_TYPES_ORDER.filter((relationship) => {
            if (relationship === 'Guardian') {
                return includeGuardian;
            }

            return true; // Father and Mother always shown
        });
    }, [includeGuardian]);

    const updateGuardianField = (
        relationship: GuardianRelationship,
        field: keyof Omit<GuardianEntry, 'relationship'>,
        value: string | number | null,
    ) => {
        setGuardianEntries((prev) => ({
            ...prev,
            [relationship]: {
                ...prev[relationship],
                [field]: value,
            },
        }));
    };

    const updateGuardianRelationshipLabel = (value: string) => {
        setGuardianEntries((prev) => ({
            ...prev,
            Guardian: {
                ...prev.Guardian,
                relationship: value,
            },
        }));
    };
    const handleConsentToggle = (checked: boolean) => {
        if (checked) {
            // only path that ever opens the modal
            setSignatureModalOpen(true);
        } else {
            setDataPrivacyConsent(false);
            setData('e_signature', null);
            setSignatureModalOpen(false);
        }
    };
    // Siblings state
    const [siblings, setSiblings] = useState<SiblingEntry[]>([]);

    const addSibling = () => {
        setSiblings((prev) => [...prev, createEmptySiblingEntry()]);
    };

    const removeSibling = (index: number) => {
        setSiblings((prev) => prev.filter((_, i) => i !== index));
    };

    const updateSiblingField = (
        index: number,
        field: keyof SiblingEntry,
        value: string | boolean | null,
    ) => {
        setSiblings((prev) =>
            prev.map((sibling, i) =>
                i === index ? { ...sibling, [field]: value } : sibling,
            ),
        );
    };

    // Equity Target Group Affiliation state
    const [equityGroupEntries, setEquityGroupEntries] = useState<
        Record<string, EquityGroupEntry>
    >({});

    const toggleEquityGroup = (group: string, checked: boolean) => {
        setEquityGroupEntries((prev) => {
            const next = { ...prev };

            if (checked) {
                next[group] = {
                    group,
                    proof: null,
                    ...(group === SOLO_PARENT_CHILD_GROUP
                        ? { living_with: '' }
                        : {}),
                };
            } else {
                delete next[group];
            }

            return next;
        });
    };

    const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    const updateEquityGroupProof = (group: string, file: File | null) => {
        if (file) {
            if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
                toast.error('Only JPG, JPEG, or PNG files are allowed.');
                return;
            }

            if (file.size > MAX_PROOF_SIZE_BYTES) {
                toast.error('File size must not exceed 5MB.');
                return;
            }
        }

        setEquityGroupEntries((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                proof: file,
            },
        }));
    };

    const updateEquityGroupLivingWith = (group: string, value: string) => {
        setEquityGroupEntries((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                living_with: value as 'Mother' | 'Father',
            },
        }));
    };

    // Psychological Test Records state
    const [psychTests, setPsychTests] = useState<PsychTestEntry[]>([]);

    const addPsychTest = () => {
        setPsychTests((prev) => [...prev, createEmptyPsychTestEntry()]);
    };

    const removePsychTest = (index: number) => {
        setPsychTests((prev) => prev.filter((_, i) => i !== index));
    };

    const updatePsychTestField = (
        index: number,
        field: keyof PsychTestEntry,
        value: string,
    ) => {
        setPsychTests((prev) =>
            prev.map((test, i) =>
                i === index ? { ...test, [field]: value } : test,
            ),
        );
    };

    // Concerns state
    const [concernAnswers, setConcernAnswers] = useState<ConcernAnswerState[]>(
        createEmptyConcernAnswers,
    );

    const updateConcernAnswer = (index: number, value: 'Yes' | 'No') => {
        setConcernAnswers((prev) =>
            prev.map((entry, i) =>
                i === index
                    ? {
                          answer: value,
                          // reset sub-answer if switching away from "Yes"
                          subAnswer: value === 'Yes' ? entry.subAnswer : '',
                      }
                    : entry,
            ),
        );
    };
    const updateConcernSubAnswer = (index: number, value: string) => {
        setConcernAnswers((prev) =>
            prev.map((entry, i) =>
                i === index ? { ...entry, subAnswer: value } : entry,
            ),
        );

        if (subAnswerErrors[index]) {
            setSubAnswerErrors((prev) => {
                const next = { ...prev };
                delete next[index];

                return next;
            });
        }
    };

    useEffect(() => {
        fetchNationalities().then(setNationalities);

        if (student) {
            setData((prev) => ({
                ...prev,
                campus: capitalizeString(student.campus),
                id_number: student.student_id,
                fname: capitalizeString(student.student_firstname),
                mname: capitalizeString(student.student_middlename ?? ''),
                lname: capitalizeString(student.student_lastname),
                course: student.program_code,
                year_level: String(student.yearlevel),
                section: student.section_code,
                phone: student.contact_number,
                gender: student.gender === 'M' ? 'Male' : 'Female',
                civil_status: student.civilstatus,
                date_of_birth: student.birthdate,
                home_address: student.student_address,
                email: student.email.toLowerCase(),
                contact_person: student.person_notify_name ?? '',
                contact_person_address: student.person_notify_address ?? '',
                contact_person_mobile_um:
                    student.person_notify_cellphone?.toString() ?? '',
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep data.educations in sync with the visible rows only
    useEffect(() => {
        const list = visibleEducationLevels.map(
            (education_level) => educationEntries[education_level],
        );
        setData('educations', list as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [educationEntries, visibleEducationLevels]);

    // Keep data.guardians in sync with the visible guardian entries only
    useEffect(() => {
        const list = visibleGuardianTypes.map(
            (relationship) => guardianEntries[relationship],
        );
        setData('guardians', list as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guardianEntries, visibleGuardianTypes]);

    // Keep data.siblings in sync with the siblings list
    useEffect(() => {
        setData('siblings', siblings as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siblings]);

    // Keep data.equity_groups in sync with the selected equity groups
    useEffect(() => {
        const list: Partial<EquityGroup>[] = Object.values(
            equityGroupEntries,
        ).map((entry) => ({
            equity_group:
                entry.group === SOLO_PARENT_CHILD_GROUP && entry.living_with
                    ? `${entry.group} - ${entry.living_with}`
                    : entry.group,
            proof: entry.proof as any,
        }));
        setData('equity_groups', list as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [equityGroupEntries]);

    // Keep data.psych_tests in sync with the psych tests list
    useEffect(() => {
        setData('psych_tests', psychTests as Partial<PsychTest>[] as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [psychTests]);

    // Keep data.concerns in sync with the concerns answers
    useEffect(() => {
        const list = concerns.map((q: ConcernQuestion, index: number) => {
            const entry = concernAnswers[index];
            const hasSubAnswer =
                !!q.sub_question && entry.answer === 'Yes' && !!entry.subAnswer;

            return {
                question: q.question,
                answer: hasSubAnswer
                    ? `${entry.answer}, ${entry.subAnswer}`
                    : entry.answer,
            };
        });
        setData('concerns', list as any[]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [concernAnswers]);

    // if (!student) {
    //     window.location.href = '/';
    // }

    const formErrors = errors as unknown as Record<string, string | undefined>;
    const [subAnswerErrors, setSubAnswerErrors] = useState<
        Record<number, boolean>
    >({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!dataPrivacyConsent) {
            toast.error('Please check the Data Privacy Consent box to submit.');

            return;
        }

        const missingSubAnswerIndex = concerns.findIndex(
            (q: ConcernQuestion, index: number) => {
                const entry = concernAnswers[index];

                return (
                    !!q.sub_question &&
                    entry.answer === 'Yes' &&
                    !entry.subAnswer.trim()
                );
            },
        );

        if (missingSubAnswerIndex !== -1) {
            setSubAnswerErrors({ [missingSubAnswerIndex]: true });

            toast.error(
                'Please answer the follow-up question under Concerns before submitting.',
            );

            const el = document.getElementById(
                `concern_${missingSubAnswerIndex}_sub`,
            );
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();

            return;
        }

        setSubAnswerErrors({});

        post(storeStudent().url, {
            preserveScroll: true,
            onError: (errors) => {
                handleErrors(errors);
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <>
            <ThemeButton />
            <SubmittingDialog
                open={processing}
                percentage={progress?.percentage}
            />

            <header
                className="relative flex min-h-150 items-center justify-center bg-cover bg-fixed bg-bottom bg-no-repeat"
                style={{ backgroundImage: "url('/chmsu.webp')" }}
            >
                <div className="absolute top-0 right-0 z-1 h-full w-full bg-black/70"></div>

                <div className="z-10 mx-5 flex max-w-4xl flex-col items-center space-y-10 text-white">
                    <div className="flex flex-col items-center gap-3 md:flex-row">
                        <img
                            src="/logo.webp"
                            className="w-15 md:w-25"
                            loading="lazy"
                            alt="CHMSU LOGO"
                        />
                        <div className="text-center font-extrabold md:text-start">
                            <h1 className="text-3xl md:text-5xl">
                                CARLOS HILADO
                            </h1>
                            <h1 className="text-lg md:text-2xl">
                                MEMORIAL STATE UNIVERSITY
                            </h1>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-extrabold uppercase md:text-5xl">
                            Student's Individual Inventory Form
                        </h2>
                        <p className="mt-2 text-base font-medium tracking-wide text-gray-200 uppercase md:text-lg">
                            Guidance Information System
                        </p>
                    </div>

                    <p className="text-center text-sm md:text-lg">
                        Welcome to the{' '}
                        <strong>Guidance Information System</strong> of Carlos
                        Hilado Memorial State University. This platform enables
                        students to accomplish the{' '}
                        <strong>Student's Individual Inventory (SII)</strong>,
                        an official guidance form used to gather essential
                        personal, educational, family, and socio-economic
                        information. The information collected serves as the
                        basis for providing appropriate guidance and counseling
                        services, planning student development programs, and
                        promoting the academic, personal, and social well-being
                        of every CHMSU student.
                    </p>
                </div>
            </header>

            <form
                onSubmit={handleSubmit}
                className="mx-5 max-w-6xl space-y-10 py-10 lg:mx-auto"
            >
                <FieldSet>
                    <FieldLegend>I. Personal Information</FieldLegend>
                    <FieldDescription>
                        This appears on invoices and emails.
                    </FieldDescription>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel>Full name</FieldLabel>
                                <Input
                                    id="fullname_display"
                                    disabled
                                    value={[
                                        data.fname,
                                        data.mname
                                            ? data.mname.slice(0, 1) + '.'
                                            : '',
                                        data.lname,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Course / Year & Section</FieldLabel>
                                <Input
                                    disabled
                                    value={`${data.course} ${data.year_level}-${data.section}`}
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="type">
                                    Student Type
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={data.type ?? ''}
                                    onValueChange={(value) => {
                                        setData('type', value);
                                    }}
                                >
                                    <SelectTrigger
                                        id="type"
                                        name="type"
                                        aria-invalid={!!errors['type']}
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {studentTypes.map(
                                                (item: string) => (
                                                    <SelectItem
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors['type'] && (
                                    <FieldError>{errors['type']}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="sexual_orientation">
                                    Sexual Orientation
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={selectedSexualOrientation ?? ''}
                                    onValueChange={(value) => {
                                        setSelectedSexualOrientation(value);

                                        if (value !== 'Others') {
                                            setData(
                                                'sexual_orientation',
                                                value,
                                            );

                                            return;
                                        }

                                        setData('sexual_orientation', '');
                                    }}
                                >
                                    <SelectTrigger
                                        aria-invalid={
                                            !!errors['sexual_orientation']
                                        }
                                        id="sexual_orientation"
                                        name="sexual_orientation"
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sexualOrientations.map(
                                                (item: string) => (
                                                    <SelectItem
                                                        value={item}
                                                        key={item}
                                                    >
                                                        {item}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {selectedSexualOrientation === 'Others' && (
                                    <Field>
                                        <Input
                                            type="text"
                                            value={
                                                data.sexual_orientation ?? ''
                                            }
                                            maxLength={10}
                                            onChange={(e) =>
                                                setData(
                                                    'sexual_orientation',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            name={
                                                data.sexual_orientation ??
                                                undefined
                                            }
                                            placeholder="Please specify your sexual orientation"
                                        />
                                    </Field>
                                )}
                                {errors['sexual_orientation'] && (
                                    <FieldError>
                                        {errors['sexual_orientation']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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
                                        disabled={!!student.email}
                                        className="py-2 ps-9"
                                        placeholder="Enter email"
                                    />
                                </div>
                                {errors['email'] && (
                                    <FieldError>{errors['email']}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">
                                    Mobile Number{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <div className="relative flex items-center">
                                    <PhoneIcon
                                        size={15}
                                        className="absolute left-3"
                                    />
                                    <Input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={data.phone ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(
                                                0,
                                                10,
                                            );
                                            setData('phone', value);
                                        }}
                                        disabled={!!student.contact_number}
                                        className="py-2 ps-17"
                                        placeholder="Enter mobile number"
                                        aria-invalid={!!errors['phone']}
                                    />
                                    <span className="absolute left-10 mt-0.5 text-sm">
                                        +63
                                    </span>
                                </div>
                                {errors['phone'] && (
                                    <FieldError>{errors['phone']}</FieldError>
                                )}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="place_of_birth">
                                Place of Birth{' '}
                            </FieldLabel>
                            <Input
                                type="place_of_birth"
                                name="place_of_birth"
                                id="place_of_birth"
                                value={data.place_of_birth ?? ''}
                                maxLength={30}
                                aria-invalid={!!errors['place_of_birth']}
                                onChange={(e) =>
                                    setData(
                                        'place_of_birth',
                                        capitalizeString(e.target.value),
                                    )
                                }

                                placeholder="Enter place of birth"
                            />
                            {errors['place_of_birth'] && (
                                <FieldError>
                                    {errors['place_of_birth']}
                                </FieldError>
                            )}
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="height">Height</FieldLabel>
                                <div className="relative flex items-center">
                                    <RulerIcon
                                        size={15}
                                        className="absolute left-3"
                                    />
                                    <Input
                                        type="number"
                                        name="height"
                                        id="height"
                                        value={data.height ?? ''}
                                        aria-invalid={!!errors['height']}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(
                                                0,
                                                3,
                                            );
                                            setData('height', value);
                                        }}
                                        className="py-2 ps-9"
                                        placeholder="Enter height"
                                    />
                                    <span className="absolute right-3 text-sm">
                                        cm
                                    </span>
                                </div>
                                {errors['height'] && (
                                    <FieldError>{errors['height']}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="weight">Weight</FieldLabel>
                                <div className="relative flex items-center">
                                    <WeightIcon
                                        size={15}
                                        className="absolute left-3"
                                    />
                                    <Input
                                        type="number"
                                        name="weight"
                                        id="weight"
                                        value={data.weight ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(
                                                0,
                                                3,
                                            );
                                            setData('weight', value);
                                        }}
                                        className="py-2 ps-9"
                                        placeholder="Enter weight"
                                        aria-invalid={!!errors['weight']}
                                    />
                                    <span className="absolute right-3 text-sm">
                                        kg
                                    </span>
                                </div>
                                {errors['weight'] && (
                                    <FieldError>{errors['weight']}</FieldError>
                                )}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="nationality">
                                Nationality
                                <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <Popover
                                open={nationalityOpen}
                                onOpenChange={setNationalityOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        aria-invalid={!!errors['nationality']}
                                        role="combobox"
                                        className="justify-between"
                                        aria-expanded={nationalityOpen}
                                        name="nationality"
                                        id="nationality"
                                    >
                                        {data.nationality || 'Choose an option'}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search nationality..."
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                No nationality found.
                                            </CommandEmpty>

                                            <CommandGroup>
                                                {[
                                                    'Filipino',
                                                    ...nationalities.filter(
                                                        (nationality) =>
                                                            nationality !==
                                                            'Filipino',
                                                    ),
                                                ].map((item, itemIndex) => (
                                                    <CommandItem
                                                        key={itemIndex}
                                                        onSelect={() => {
                                                            setData(
                                                                'nationality',
                                                                item,
                                                            );
                                                            setNationalityOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex w-full items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                {item ===
                                                                    'Filipino' && (
                                                                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                                                                )}
                                                                <span>
                                                                    {item}
                                                                </span>
                                                            </div>
                                                            <p>
                                                                {item ===
                                                                    data.nationality && (
                                                                    <Check />
                                                                )}
                                                            </p>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors['nationality'] && (
                                <FieldError>{errors['nationality']}</FieldError>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel>Home Address</FieldLabel>
                            <Input
                                id="home_address_display"
                                disabled
                                value={data.home_address}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="current_address">
                                Current Address{' '}
                                <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <div className="flex">
                                <Input
                                    id="current_address"
                                    name="current_address"
                                    onChange={(e) =>
                                        setData(
                                            'current_address',
                                            capitalizeString(e.target.value),
                                        )
                                    }
                                    maxLength={150}
                                    className="rounded-e-none"
                                    value={data.current_address}
                                    placeholder="Enter current address"
                                    aria-invalid={!!errors['current_address']}
                                />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'current_address',
                                                    data.home_address,
                                                )
                                            }
                                            className="rounded-s-none"
                                            variant="secondary"
                                        >
                                            <CopyCheck />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Same as above</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            {errors['current_address'] && (
                                <FieldError>
                                    {errors['current_address']}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="last_school_attended">
                                Last School Attended
                            </FieldLabel>
                            <Input
                                type="text"
                                id="last_school_attended"
                                value={data.last_school_attended ?? ''}
                                maxLength={150}
                                onChange={(e) =>
                                    setData(
                                        'last_school_attended',
                                        capitalizeString(e.target.value),
                                    )
                                }
                                aria-invalid={!!errors['last_school_attended']}
                                placeholder="Enter last school attended"
                            />
                            {errors['last_school_attended'] && (
                                <FieldError>
                                    {errors['last_school_attended']}
                                </FieldError>
                            )}
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="general_average">
                                    General Average ( HS/SHS/College )
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="general_average"
                                    value={data.general_average ?? ''}
                                    maxLength={20}
                                    onChange={(e) =>
                                        setData(
                                            'general_average',
                                            capitalizeString(e.target.value),
                                        )
                                    }
                                    aria-invalid={!!errors['general_average']}
                                    placeholder="e.g. 90/88/89"
                                />
                                {errors['general_average'] && (
                                    <FieldError>
                                        {errors['general_average']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="strand_course">
                                    Strand / Course (STEM / ICT / MAED etc.)
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="strand_course"
                                    value={data.strand_course ?? ''}
                                    maxLength={20}
                                    onChange={(e) =>
                                        setData(
                                            'strand_course',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    aria-invalid={!!errors['strand_course']}
                                    placeholder="Enter strand / course"
                                />
                                {errors['strand_course'] && (
                                    <FieldError>
                                        {errors['strand_course']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="religion">
                                Religion <Asterisk size={15} color="red" />
                            </FieldLabel>
                            <Select
                                value={data.religion}
                                onValueChange={(value) =>
                                    setData('religion', value)
                                }
                            >
                                <SelectTrigger
                                    id="religion"
                                    name="religion"
                                    aria-invalid={!!errors['religion']}
                                >
                                    <SelectValue placeholder="Choose an option" />
                                </SelectTrigger>
                                <SelectContent align="center">
                                    <SelectGroup>
                                        {religions.map((item: string) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors['religion'] && (
                                <FieldError>{errors['religion']}</FieldError>
                            )}
                        </Field>
                        <Field
                            onClick={(e) => {
                                if (
                                    (e.target as HTMLElement).closest(
                                        '#has_scholarship',
                                    )
                                ) {
                                    return;
                                }

                                const next = data.scholarship === null;
                                setData('scholarship', next ? '' : null);
                                setData('has_scholarship', next);
                            }}
                            className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                data.scholarship !== null
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="has_scholarship"
                                    checked={data.scholarship !== null}
                                    onCheckedChange={(checked) => {
                                        setData(
                                            'scholarship',
                                            checked ? '' : null,
                                        );
                                        setData('has_scholarship', !!checked);
                                    }}
                                />

                                <div className="flex-1">
                                    <FieldLabel
                                        htmlFor="has_scholarship"
                                        className="cursor-pointer"
                                    >
                                        Do you have an existing scholarship?
                                    </FieldLabel>

                                    {data.scholarship !== null && (
                                        <Input
                                            className="mt-3"
                                            id="scholarship"
                                            placeholder="Enter your scholarship"
                                            value={data.scholarship}
                                            onChange={(e) =>
                                                setData(
                                                    'scholarship',
                                                    e.target.value,
                                                )
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}

                                    {errors.scholarship && (
                                        <FieldError className="mt-1">
                                            {errors.scholarship}
                                        </FieldError>
                                    )}
                                </div>
                            </div>
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>In Case of Emergency Information</FieldLegend>
                    <FieldDescription>
                        Provide the name and contact details of the person we
                        should notify in case of an emergency.
                    </FieldDescription>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="contact_person">
                                    Contact Person Name{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="contact_person"
                                    value={data.contact_person}
                                    disabled={!!student.person_notify_name}
                                    maxLength={50}
                                    onChange={(e) => {
                                        if (student.person_notify_name) {
                                            return;
                                        }

                                        setData(
                                            'contact_person',
                                            capitalizeString(e.target.value),
                                        );
                                        setData(
                                            'contact_person',
                                            capitalizeString(e.target.value),
                                        );
                                    }}
                                    aria-invalid={!!errors['contact_person']}
                                    placeholder="Enter contact person"
                                />
                                {errors['contact_person'] && (
                                    <FieldError>
                                        {errors['contact_person']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="contact_person_address">
                                    Contact Person Address{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="contact_person_address"
                                    value={data.contact_person_address}
                                    disabled={!!student.person_notify_address}
                                    maxLength={100}
                                    onChange={(e) => {
                                        if (student.person_notify_address) {
                                            return;
                                        }

                                        setData(
                                            'contact_person_address',
                                            capitalizeString(e.target.value),
                                        );
                                    }}
                                    aria-invalid={
                                        !!errors['contact_person_address']
                                    }
                                    placeholder="Enter contact person address"
                                />
                                {errors['contact_person_address'] && (
                                    <FieldError>
                                        {errors['contact_person_address']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="contact_person_mobile_um">
                                    Contact Person Mobile Number{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-sm opacity-80">
                                        +63
                                    </span>
                                    <Input
                                        type="number"
                                        value={
                                            data.contact_person_mobile_um ?? ''
                                        }
                                        disabled={
                                            !!student.person_notify_cellphone
                                        }
                                        id="contact_person_mobile_um"
                                        onChange={(e) => {
                                            if (
                                                student.person_notify_cellphone
                                            ) {
                                                return;
                                            }

                                            const value = e.target.value.slice(
                                                0,
                                                10,
                                            );
                                            setData(
                                                'contact_person_mobile_um',
                                                value ? value : '',
                                            );
                                        }}
                                        className="py-2 ps-11"
                                        placeholder="Enter contact person mobile number"
                                    />
                                </div>
                                {errors['contact_person_mobile_um'] && (
                                    <FieldError>
                                        {errors['contact_person_mobile_um']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="contact_person_relationship">
                                    Contact Person Relationship{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={data.contact_person_relationship}
                                    onValueChange={(value) => {
                                        setData(
                                            'contact_person_relationship',
                                            value,
                                        );
                                    }}
                                >
                                    <SelectTrigger
                                        id="contact_person_relationship"
                                        aria-invalid={
                                            !!errors[
                                                'contact_person_relationship'
                                            ]
                                        }
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {contactPersonRelationships.map(
                                                (item: string) => (
                                                    <SelectItem
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {errors['contact_person_relationship'] && (
                                    <FieldError>
                                        {errors['contact_person_relationship']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>II. Educational Background</FieldLegend>
                    <FieldDescription>
                        Elementary, Junior High School, and Senior High School
                        are included by default. Check the boxes below if you
                        also attended Vocational or College.
                    </FieldDescription>
                    <FieldGroup>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="include_college"
                                    checked={includeCollege}
                                    onCheckedChange={(checked) =>
                                        setIncludeCollege(!!checked)
                                    }
                                />
                                <FieldLabel
                                    htmlFor="include_college"
                                    className="cursor-pointer"
                                >
                                    Add College
                                </FieldLabel>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="include_vocational"
                                    checked={includeVocational}
                                    onCheckedChange={(checked) =>
                                        setIncludeVocational(!!checked)
                                    }
                                />
                                <FieldLabel
                                    htmlFor="include_vocational"
                                    className="cursor-pointer"
                                >
                                    Add Vocational
                                </FieldLabel>
                            </div>
                        </div>

                        {/* Mobile: stacked cards, one per education level.
                            NOTE: no error-scroll ids are placed here to avoid
                            duplicate DOM ids with the desktop table below,
                            since both are always rendered (CSS-hidden only). */}
                        <div className="space-y-4 md:hidden">
                            {visibleEducationLevels.map(
                                (education_level, i) => (
                                    <div
                                        key={education_level}
                                        className="rounded-lg border p-4"
                                    >
                                        <p className="mb-3 font-semibold">
                                            {education_level}
                                        </p>
                                        <div className="space-y-3">
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={`school_name_${education_level}`}
                                                >
                                                    School
                                                    <Asterisk
                                                        size={15}
                                                        color="red"
                                                    />
                                                </FieldLabel>
                                                <Input
                                                    id={`school_name_${education_level}`}
                                                    value={
                                                        educationEntries[
                                                            education_level
                                                        ].school_name
                                                    }
                                                    onChange={(e) =>
                                                        updateEducationField(
                                                            education_level,
                                                            'school_name',
                                                            capitalizeString(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    aria-invalid={
                                                        !!formErrors[
                                                            `educations.${i}.school_name`
                                                        ]
                                                    }
                                                    placeholder="Enter school"
                                                />
                                                {formErrors[
                                                    `educations.${i}.school_name`
                                                ] && (
                                                    <FieldError>
                                                        {
                                                            formErrors[
                                                                `educations.${i}.school_name`
                                                            ]
                                                        }
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Field>
                                                    <FieldLabel
                                                        htmlFor={`year_covered_${education_level}`}
                                                    >
                                                        Year Covered
                                                    </FieldLabel>
                                                    <Input
                                                        id={`year_covered_${education_level}`}
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].year_covered
                                                        }
                                                        onChange={(e) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'year_covered',
                                                                e.target.value,
                                                            )
                                                        }
                                                        aria-invalid={
                                                            !!formErrors[
                                                                `educations.${i}.year_covered`
                                                            ]
                                                        }
                                                        placeholder="e.g. 2020-2021"
                                                    />
                                                    {formErrors[
                                                        `educations.${i}.year_covered`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `educations.${i}.year_covered`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                                </Field>

                                                <Field>
                                                    <FieldLabel
                                                        htmlFor={`school_type_${education_level}`}
                                                    >
                                                        Public/Private{' '}
                                                        <Asterisk
                                                            size={15}
                                                            color="red"
                                                        />
                                                    </FieldLabel>
                                                    <Select
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].school_type
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'school_type',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`school_type_${education_level}`}
                                                            className="w-full"
                                                            aria-invalid={
                                                                !!formErrors[
                                                                    `educations.${i}.school_type`
                                                                ]
                                                            }
                                                        >
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Public">
                                                                Public
                                                            </SelectItem>
                                                            <SelectItem value="Private">
                                                                Private
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors[
                                                        `educations.${i}.school_type`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `educations.${i}.school_type`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                                </Field>
                                            </div>

                                            <Field>
                                                <FieldLabel
                                                    htmlFor={`honor_received_${education_level}`}
                                                >
                                                    Honor Received
                                                </FieldLabel>
                                                <Input
                                                    id={`honor_received_${education_level}`}
                                                    value={
                                                        educationEntries[
                                                            education_level
                                                        ].honor_received ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        updateEducationField(
                                                            education_level,
                                                            'honor_received',
                                                            capitalizeString(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="Optional"
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>

                        {/* Desktop: full table.
                            Backend-matching ids (educations.{index}.*) live
                            here, using the array index sent to the server. */}
                        <div className="hidden overflow-x-auto rounded-lg border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">
                                            Level
                                        </TableHead>
                                        <TableHead className="flex min-w-[180px] gap-1">
                                            School{' '}
                                            <Asterisk size={12} color="red" />
                                        </TableHead>
                                        <TableHead className="min-w-[140px]">
                                            Year Covered
                                        </TableHead>
                                        <TableHead className="flex min-w-[130px] gap-1">
                                            Public/Private{' '}
                                            <Asterisk size={12} color="red" />
                                        </TableHead>
                                        <TableHead className="min-w-[160px]">
                                            Honor Received
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleEducationLevels.map(
                                        (education_level, eduIndex) => (
                                            <TableRow key={education_level}>
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {education_level}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        id={`educations.${eduIndex}.school_name`}
                                                        className="h-9"
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].school_name
                                                        }
                                                        onChange={(e) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'school_name',
                                                                capitalizeString(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        aria-invalid={
                                                            !!formErrors[
                                                                `educations.${eduIndex}.school_name`
                                                            ]
                                                        }
                                                        placeholder="Enter school"
                                                    />
                                                    {formErrors[
                                                        `educations.${eduIndex}.school_name`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `educations.${eduIndex}.school_name`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        id={`educations.${eduIndex}.year_covered`}
                                                        className="h-9"
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].year_covered
                                                        }
                                                        onChange={(e) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'year_covered',
                                                                e.target.value,
                                                            )
                                                        }
                                                        aria-invalid={
                                                            !!formErrors[
                                                                `educations.${eduIndex}.year_covered`
                                                            ]
                                                        }
                                                        placeholder="e.g. 2020-2021"
                                                    />
                                                    {formErrors[
                                                        `educations.${eduIndex}.year_covered`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `educations.${eduIndex}.year_covered`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].school_type
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'school_type',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`educations.${eduIndex}.school_type`}
                                                            className="h-9"
                                                            aria-invalid={
                                                                !!formErrors[
                                                                    `educations.${eduIndex}.school_type`
                                                                ]
                                                            }
                                                        >
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Public">
                                                                Public
                                                            </SelectItem>
                                                            <SelectItem value="Private">
                                                                Private
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors[
                                                        `educations.${eduIndex}.school_type`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `educations.${eduIndex}.school_type`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        id={`educations.${eduIndex}.honor_received`}
                                                        className="h-9"
                                                        value={
                                                            educationEntries[
                                                                education_level
                                                            ].honor_received ??
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateEducationField(
                                                                education_level,
                                                                'honor_received',
                                                                capitalizeString(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Optional"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {errors['educations'] && (
                            <FieldError>{errors['educations']}</FieldError>
                        )}
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>
                        III. Home & Family Background Information
                    </FieldLegend>
                    <FieldDescription>
                        Father and Mother information are included by default.
                        Check the box below if the student is under the care of
                        another guardian.
                    </FieldDescription>
                    <FieldGroup>
                        {visibleGuardianTypes.map((relationship) => {
                            const guardian = guardianEntries[relationship];
                            const isDeceased =
                                guardian.life_status === 'Deceased';
                            // Array index as sent to the backend in
                            // data.guardians — used to build ids that match
                            // Laravel's dot-array error keys.
                            const guardianIndex =
                                visibleGuardianTypes.indexOf(relationship);

                            return (
                                <div
                                    key={relationship}
                                    className="space-y-4 rounded-lg border p-4"
                                >
                                    <p className="font-semibold">
                                        {relationship} Information
                                    </p>

                                    {relationship === 'Guardian' && (
                                        <Field>
                                            <FieldLabel htmlFor="guardian_relationship_label">
                                                Relationship to Student
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.relationship`}
                                                value={guardian.relationship}
                                                maxLength={50}
                                                onChange={(e) =>
                                                    updateGuardianRelationshipLabel(
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="e.g. Grandmother, Aunt, Legal Guardian"
                                            />
                                        </Field>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_fname`}
                                            >
                                                First Name
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.fname`}
                                                value={guardian.fname}
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'fname',
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Enter first name"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_mname`}
                                            >
                                                Middle Name
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.mname`}
                                                value={guardian.mname ?? ''}
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'mname',
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Optional"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_lname`}
                                            >
                                                Last Name
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.lname`}
                                                value={guardian.lname}
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'lname',
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Enter last name"
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_birthdate`}
                                            >
                                                Birthdate
                                            </FieldLabel>
                                            <Input
                                                type="date"
                                                id={`guardians.${guardianIndex}.birthdate`}
                                                value={guardian.birthdate ?? ''}
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'birthdate',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_birthplace`}
                                            >
                                                Birthplace
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.birthplace`}
                                                value={
                                                    guardian.birthplace ?? ''
                                                }
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'birthplace',
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Enter birthplace"
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_phone`}
                                            >
                                                Phone Number
                                            </FieldLabel>
                                            <div className="relative flex items-center">
                                                <PhoneIcon
                                                    size={15}
                                                    className="absolute left-3"
                                                />
                                                <Input
                                                    type="tel"
                                                    id={`guardians.${guardianIndex}.phone`}
                                                    value={guardian.phone ?? ''}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value.slice(
                                                                0,
                                                                10,
                                                            );
                                                        updateGuardianField(
                                                            relationship,
                                                            'phone',
                                                            value,
                                                        );
                                                    }}
                                                    className="py-2 ps-17"
                                                    placeholder="Enter phone number"
                                                    aria-invalid={
                                                        !!formErrors[
                                                            `guardians.${guardianIndex}.phone`
                                                        ]
                                                    }
                                                />
                                                <span className="absolute left-10 mt-0.5 text-sm">
                                                    +63
                                                </span>
                                            </div>
                                            {formErrors[
                                                `guardians.${guardianIndex}.phone`
                                            ] && (
                                                <FieldError>
                                                    {
                                                        formErrors[
                                                            `guardians.${guardianIndex}.phone`
                                                        ]
                                                    }
                                                </FieldError>
                                            )}
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_religion`}
                                            >
                                                Religion{' '}
                                            </FieldLabel>
                                            <Select
                                                value={guardian.religion}
                                                onValueChange={(value) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'religion',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id={`guardians.${guardianIndex}.religion`}
                                                >
                                                    <SelectValue placeholder="Choose an option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {religions.map(
                                                            (item: string) => (
                                                                <SelectItem
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_nationality`}
                                            >
                                                Nationality
                                            </FieldLabel>
                                            <Popover
                                                open={
                                                    guardianNationalityOpen[
                                                        relationship
                                                    ]
                                                }
                                                onOpenChange={(open) =>
                                                    setGuardianNationalityOpen(
                                                        (prev) => ({
                                                            ...prev,
                                                            [relationship]:
                                                                open,
                                                        }),
                                                    )
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        role="combobox"
                                                        id={`guardians.${guardianIndex}.nationality`}
                                                        className="w-full justify-between"
                                                        aria-expanded={
                                                            guardianNationalityOpen[
                                                                relationship
                                                            ]
                                                        }
                                                    >
                                                        {guardian.nationality ||
                                                            'Choose an option'}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    className="p-0"
                                                    align="start"
                                                >
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search nationality..."
                                                            className="h-9"
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No nationality
                                                                found.
                                                            </CommandEmpty>

                                                            <CommandGroup>
                                                                {[
                                                                    'Filipino',
                                                                    ...nationalities.filter(
                                                                        (
                                                                            nationality,
                                                                        ) =>
                                                                            nationality !==
                                                                            'Filipino',
                                                                    ),
                                                                ].map(
                                                                    (
                                                                        item,
                                                                        itemIndex,
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                itemIndex
                                                                            }
                                                                            onSelect={() => {
                                                                                updateGuardianField(
                                                                                    relationship,
                                                                                    'nationality',
                                                                                    item,
                                                                                );
                                                                                setGuardianNationalityOpen(
                                                                                    (
                                                                                        prev,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [relationship]: false,
                                                                                    }),
                                                                                );
                                                                            }}
                                                                        >
                                                                            <div className="flex w-full items-center justify-between gap-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    {item ===
                                                                                        'Filipino' && (
                                                                                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                                                                                    )}
                                                                                    <span>
                                                                                        {
                                                                                            item
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <p>
                                                                                    {item ===
                                                                                        guardian.nationality && (
                                                                                        <Check />
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </Field>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_highest_educ_attainment`}
                                            >
                                                Highest Educational Attainment
                                            </FieldLabel>
                                            <Select
                                                value={
                                                    guardian.highest_educ_attainment
                                                }
                                                onValueChange={(value) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'highest_educ_attainment',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id={`guardians.${guardianIndex}.highest_educ_attainment`}
                                                >
                                                    <SelectValue placeholder="Choose an option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {highestEducationalAttainments.map(
                                                            (item: string) => (
                                                                <SelectItem
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${relationship}_occupation`}
                                            >
                                                Occupation
                                            </FieldLabel>
                                            <Input
                                                id={`guardians.${guardianIndex}.occupation`}
                                                value={
                                                    guardian.occupation ?? ''
                                                }
                                                onChange={(e) =>
                                                    updateGuardianField(
                                                        relationship,
                                                        'occupation',
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="Enter occupation"
                                            />
                                        </Field>
                                    </div>

                                    <Field>
                                        <FieldLabel
                                            htmlFor={`${relationship}_life_status`}
                                        >
                                            Life Status{' '}
                                        </FieldLabel>
                                        <Select
                                            value={guardian.life_status}
                                            onValueChange={(value) => {
                                                updateGuardianField(
                                                    relationship,
                                                    'life_status',
                                                    value,
                                                );

                                                if (value !== 'Deceased') {
                                                    updateGuardianField(
                                                        relationship,
                                                        'cause_of_death',
                                                        null,
                                                    );
                                                    updateGuardianField(
                                                        relationship,
                                                        'year_of_death',
                                                        null,
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id={`guardians.${guardianIndex}.life_status`}
                                            >
                                                <SelectValue placeholder="Choose an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {LIFE_STATUS_OPTIONS.map(
                                                        (item) => (
                                                            <SelectItem
                                                                key={item}
                                                                value={item}
                                                            >
                                                                {item}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {isDeceased && (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={`${relationship}_cause_of_death`}
                                                >
                                                    Cause of Death
                                                </FieldLabel>
                                                <Input
                                                    id={`guardians.${guardianIndex}.cause_of_death`}
                                                    value={
                                                        guardian.cause_of_death ??
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        updateGuardianField(
                                                            relationship,
                                                            'cause_of_death',
                                                            capitalizeString(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="Enter cause of death"
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={`${relationship}_year_of_death`}
                                                >
                                                    Year of Death
                                                </FieldLabel>
                                                <Input
                                                    type="number"
                                                    id={`guardians.${guardianIndex}.year_of_death`}
                                                    value={
                                                        guardian.year_of_death ??
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        updateGuardianField(
                                                            relationship,
                                                            'year_of_death',
                                                            e.target.value.slice(
                                                                0,
                                                                4,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="e.g. 2020"
                                                />
                                            </Field>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="parent_marital_relationship">
                                    Parents' Marital Relationship{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={
                                        selectedParentMaritalRelationship ?? ''
                                    }
                                    onValueChange={(value) => {
                                        setSelectedParentMaritalRelationship(
                                            value,
                                        );

                                        if (value !== 'Others') {
                                            setData(
                                                'parent_marital_relationship',
                                                value,
                                            );

                                            return;
                                        }

                                        setData(
                                            'parent_marital_relationship',
                                            '',
                                        );
                                    }}
                                >
                                    <SelectTrigger
                                        id="parent_marital_relationship"
                                        aria-invalid={
                                            !!errors[
                                                'parent_marital_relationship'
                                            ]
                                        }
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {maritalRelationships.map(
                                                (item: string) => (
                                                    <SelectItem
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {selectedParentMaritalRelationship ===
                                    'Others' && (
                                    <Field>
                                        <Input
                                            type="text"
                                            value={
                                                data.parent_marital_relationship ??
                                                ''
                                            }
                                            maxLength={100}
                                            onChange={(e) =>
                                                setData(
                                                    'parent_marital_relationship',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Please specify the marital relationship"
                                        />
                                    </Field>
                                )}

                                {errors['parent_marital_relationship'] && (
                                    <FieldError>
                                        {errors['parent_marital_relationship']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="birth_order">
                                    Birth Order{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="birth_order"
                                    value={data.birth_order ?? ''}
                                    maxLength={50}
                                    onChange={(e) =>
                                        setData('birth_order', e.target.value)
                                    }
                                    aria-invalid={!!errors['birth_order']}
                                    placeholder="e.g. 2nd of 4 children"
                                />
                                {errors['birth_order'] && (
                                    <FieldError>
                                        {errors['birth_order']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="financer">
                                    Who Finances Your Education?{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={selectedFinancer ?? ''}
                                    onValueChange={(value) => {
                                        setSelectedFinancer(value);

                                        if (value !== 'Others') {
                                            setData('financer', value);

                                            return;
                                        }

                                        setData('financer', '');
                                    }}
                                >
                                    <SelectTrigger
                                        id="financer"
                                        aria-invalid={!!errors['financer']}
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {financers.map((item: string) => (
                                                <SelectItem
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {selectedFinancer === 'Others' && (
                                    <Field>
                                        <Input
                                            type="text"
                                            value={data.financer ?? ''}
                                            maxLength={100}
                                            onChange={(e) =>
                                                setData(
                                                    'financer',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Please specify who finances your education"
                                        />
                                    </Field>
                                )}

                                {errors['financer'] && (
                                    <FieldError>
                                        {errors['financer']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="weekly_allowance">
                                    Weekly Allowance{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-sm opacity-80">
                                        ₱
                                    </span>
                                    <Input
                                        type="number"
                                        id="weekly_allowance"
                                        value={data.weekly_allowance ?? ''}
                                        onChange={(e) =>
                                            setData(
                                                'weekly_allowance',
                                                e.target.value,
                                            )
                                        }
                                        className="ps-7"
                                        placeholder="Enter weekly allowance"
                                        aria-invalid={
                                            !!errors['weekly_allowance']
                                        }
                                    />
                                </div>
                                {errors['weekly_allowance'] && (
                                    <FieldError>
                                        {errors['weekly_allowance']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="household_income">
                                    Household Monthly Income{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={data.household_income ?? undefined}
                                    onValueChange={(value) =>
                                        setData('household_income', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="household_income"
                                        aria-invalid={
                                            !!errors['household_income']
                                        }
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {houseMonthlyIncomes.map(
                                                (item: {
                                                    monthly: string;
                                                    annual: string;
                                                }) => (
                                                    <SelectItem
                                                        key={item.monthly}
                                                        value={item.monthly}
                                                    >
                                                        {item.monthly}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors['household_income'] && (
                                    <FieldError>
                                        {errors['household_income']}
                                    </FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="nature_of_residence">
                                    Nature of Residence{' '}
                                    <Asterisk size={15} color="red" />
                                </FieldLabel>
                                <Select
                                    value={selectedNatureOfResidence ?? ''}
                                    onValueChange={(value) => {
                                        setSelectedNatureOfResidence(value);

                                        if (value !== 'Others') {
                                            setData(
                                                'nature_of_residence',
                                                value,
                                            );

                                            return;
                                        }

                                        setData('nature_of_residence', '');
                                    }}
                                >
                                    <SelectTrigger
                                        id="nature_of_residence"
                                        aria-invalid={
                                            !!errors['nature_of_residence']
                                        }
                                    >
                                        <SelectValue placeholder="Choose an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {natureResidence.map(
                                                (item: string) => (
                                                    <SelectItem
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {selectedNatureOfResidence === 'Others' && (
                                    <Field>
                                        <Input
                                            type="text"
                                            value={
                                                data.nature_of_residence ?? ''
                                            }
                                            maxLength={100}
                                            onChange={(e) =>
                                                setData(
                                                    'nature_of_residence',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Please specify your nature of residence"
                                        />
                                    </Field>
                                )}

                                {errors['nature_of_residence'] && (
                                    <FieldError>
                                        {errors['nature_of_residence']}
                                    </FieldError>
                                )}
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>Siblings</FieldLegend>
                    <FieldDescription>
                        Add the student's siblings, if any. Click "Add Sibling"
                        to include a new entry.
                    </FieldDescription>
                    <FieldGroup>
                        {siblings.map((sibling, index) => (
                            <div
                                key={index}
                                className="space-y-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">
                                        Sibling #{index + 1}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSibling(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-4">
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`siblings.${index}.fname`}
                                        >
                                            First Name{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Input
                                            id={`siblings.${index}.fname`}
                                            aria-invalid={
                                                !!formErrors[
                                                    `siblings.${index}.fname`
                                                ]
                                            }
                                            value={sibling.fname}
                                            onChange={(e) =>
                                                updateSiblingField(
                                                    index,
                                                    'fname',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Enter first name"
                                        />
                                        {formErrors[
                                            `siblings.${index}.fname`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `siblings.${index}.fname`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`siblings.${index}.mname`}
                                        >
                                            Middle Name
                                        </FieldLabel>
                                        <Input
                                            id={`siblings.${index}.mname`}
                                            aria-invalid={
                                                !!formErrors[
                                                    `siblings.${index}.mname`
                                                ]
                                            }
                                            value={sibling.mname ?? ''}
                                            onChange={(e) =>
                                                updateSiblingField(
                                                    index,
                                                    'mname',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Optional"
                                        />
                                        {formErrors[
                                            `siblings.${index}.mname`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `siblings.${index}.mname`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`siblings.${index}.lname`}
                                        >
                                            Last Name{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Input
                                            id={`siblings.${index}.lname`}
                                            value={sibling.lname}
                                            aria-invalid={
                                                !!formErrors[
                                                    `siblings.${index}.lname`
                                                ]
                                            }
                                            onChange={(e) =>
                                                updateSiblingField(
                                                    index,
                                                    'lname',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Enter last name"
                                        />
                                        {formErrors[
                                            `siblings.${index}.lname`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `siblings.${index}.lname`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel
                                            htmlFor={`siblings.${index}.gender`}
                                        >
                                            Gender{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Select
                                            value={sibling.gender}
                                            onValueChange={(value) =>
                                                updateSiblingField(
                                                    index,
                                                    'gender',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id={`siblings.${index}.gender`}
                                                aria-invalid={
                                                    !!formErrors[
                                                        `siblings.${index}.gender`
                                                    ]
                                                }
                                            >
                                                <SelectValue placeholder="Choose an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Male">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="Female">
                                                        Female
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {formErrors[
                                            `siblings.${index}.gender`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `siblings.${index}.gender`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`siblings.${index}.birthdate`}
                                        >
                                            Birthdate
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            id={`siblings.${index}.birthdate`}
                                            value={sibling.birthdate ?? ''}
                                            onChange={(e) =>
                                                updateSiblingField(
                                                    index,
                                                    'birthdate',
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={
                                                !!formErrors[
                                                    `siblings.${index}.birthdate`
                                                ]
                                            }
                                        />
                                        {formErrors[
                                            `siblings.${index}.birthdate`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `siblings.${index}.birthdate`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`siblings.${index}.is_employed`}
                                        checked={sibling.is_employed}
                                        onCheckedChange={(checked) =>
                                            updateSiblingField(
                                                index,
                                                'is_employed',
                                                !!checked,
                                            )
                                        }
                                    />
                                    <FieldLabel
                                        htmlFor={`siblings.${index}.is_employed`}
                                        className="cursor-pointer"
                                    >
                                        Currently employed
                                    </FieldLabel>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={addSibling}
                            className="w-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sibling
                        </Button>

                        {errors['siblings'] && (
                            <FieldError>{errors['siblings']}</FieldError>
                        )}
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>
                        IV. Equity Target Group Affiliation
                    </FieldLegend>
                    <FieldDescription>
                        DO YOU BELONG TO THE FOLLOWING GROUP? If YES, please
                        CHECK (☑) the box(es) corresponding to the group(s) you
                        belong to and upload the required supporting document or
                        proof (e.g., Identification Card, Certificate of
                        Membership, Barangay Certification, Tax Exemption
                        Certificate, or another applicable government-issued
                        certification/issuance).
                    </FieldDescription>

                    <FieldGroup>
                        {equityGroups.map((group: string) => {
                            const entry = equityGroupEntries[group];
                            const isChecked = !!entry;

                            const submittedIndex =
                                data.equity_groups?.findIndex((item) => {
                                    if (!item.equity_group) {
                                        return false;
                                    }

                                    return (
                                        item.equity_group === group ||
                                        item.equity_group.startsWith(group)
                                    );
                                }) ?? -1;

                            const hasIndex = submittedIndex !== -1;

                            return (
                                <div
                                    key={group}
                                    onClick={(e) => {
                                        const target = e.target as HTMLElement;

                                        if (
                                            target.closest(
                                                '[data-checkbox-toggle]',
                                            ) ||
                                            target.closest(
                                                '[data-stop-card-toggle]',
                                            )
                                        ) {
                                            return;
                                        }

                                        toggleEquityGroup(group, !isChecked);
                                    }}
                                    className={`cursor-pointer space-y-3 rounded-lg border p-4 transition-all ${
                                        isChecked
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border'
                                    }`}
                                >
                                    <div
                                        data-checkbox-toggle
                                        className="flex items-start gap-3"
                                    >
                                        <Checkbox
                                            id={`equity_${group}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                                toggleEquityGroup(
                                                    group,
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <FieldLabel
                                            htmlFor={`equity_${group}`}
                                            className="cursor-pointer font-normal"
                                        >
                                            {group}
                                        </FieldLabel>
                                    </div>

                                    {isChecked &&
                                        group === SOLO_PARENT_CHILD_GROUP && (
                                            <div
                                                data-stop-card-toggle
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Field>
                                                    <FieldLabel
                                                        htmlFor={
                                                            hasIndex
                                                                ? `equity_groups.${submittedIndex}.equity_group`
                                                                : undefined
                                                        }
                                                    >
                                                        Living with
                                                    </FieldLabel>
                                                    <Select
                                                        value={
                                                            entry?.living_with ??
                                                            ''
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateEquityGroupLivingWith(
                                                                group,
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={
                                                                hasIndex
                                                                    ? `equity_groups.${submittedIndex}.equity_group`
                                                                    : undefined
                                                            }
                                                        >
                                                            <SelectValue placeholder="Choose an option" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="Mother">
                                                                    Mother
                                                                </SelectItem>
                                                                <SelectItem value="Father">
                                                                    Father
                                                                </SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>
                                        )}

                                    {isChecked && (
                                        <div
                                            data-stop-card-toggle
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={
                                                        hasIndex
                                                            ? `equity_groups.${submittedIndex}.proof`
                                                            : undefined
                                                    }
                                                >
                                                    Supporting Document / Proof{' '}
                                                    <Asterisk
                                                        size={15}
                                                        color="red"
                                                    />
                                                </FieldLabel>
                                                <Input
                                                    type="file"
                                                    id={
                                                        hasIndex
                                                            ? `equity_groups.${submittedIndex}.proof`
                                                            : undefined
                                                    }
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={(e) =>
                                                        updateEquityGroupProof(
                                                            group,
                                                            e.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                    aria-invalid={
                                                        hasIndex &&
                                                        !!formErrors[
                                                            `equity_groups.${submittedIndex}.proof`
                                                        ]
                                                    }
                                                />
                                                {entry?.proof && (
                                                    <FieldDescription>
                                                        Selected file:{' '}
                                                        {entry.proof.name}
                                                    </FieldDescription>
                                                )}
                                                {hasIndex &&
                                                    formErrors[
                                                        `equity_groups.${submittedIndex}.proof`
                                                    ] && (
                                                        <FieldError>
                                                            {
                                                                formErrors[
                                                                    `equity_groups.${submittedIndex}.proof`
                                                                ]
                                                            }
                                                        </FieldError>
                                                    )}
                                            </Field>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {errors.equity_groups && (
                            <FieldError>{errors.equity_groups}</FieldError>
                        )}
                    </FieldGroup>
                </FieldSet>{' '}
                <FieldSet>
                    <FieldLegend>V. Psychological Test Records</FieldLegend>
                    <FieldDescription>
                        If the student has undergone any psychological testing,
                        add the test details below. All fields are required for
                        each entry.
                    </FieldDescription>
                    <FieldGroup>
                        {psychTests.map((test, index) => (
                            <div
                                key={index}
                                className="space-y-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">
                                        Psychological Test #{index + 1}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePsychTest(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`psych_tests.${index}.date_taken`}
                                        >
                                            Date Taken{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            id={`psych_tests.${index}.date_taken`}
                                            value={test.date_taken}
                                            onChange={(e) =>
                                                updatePsychTestField(
                                                    index,
                                                    'date_taken',
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={
                                                !!formErrors[
                                                    `psych_tests.${index}.date_taken`
                                                ]
                                            }
                                        />
                                        {formErrors[
                                            `psych_tests.${index}.date_taken`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `psych_tests.${index}.date_taken`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel
                                            htmlFor={`psych_tests.${index}.test_name`}
                                        >
                                            Test Name{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Input
                                            id={`psych_tests.${index}.test_name`}
                                            value={test.test_name}
                                            maxLength={60}
                                            onChange={(e) =>
                                                updatePsychTestField(
                                                    index,
                                                    'test_name',
                                                    capitalizeString(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="e.g. 16PF, MMPI"
                                            aria-invalid={
                                                !!formErrors[
                                                    `psych_tests.${index}.test_name`
                                                ]
                                            }
                                        />
                                        {formErrors[
                                            `psych_tests.${index}.test_name`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `psych_tests.${index}.test_name`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel
                                        htmlFor={`psych_tests.${index}.test_result`}
                                    >
                                        Test Result{' '}
                                        <Asterisk size={15} color="red" />
                                    </FieldLabel>
                                    <Input
                                        id={`psych_tests.${index}.test_result`}
                                        value={test.test_result}
                                        maxLength={100}
                                        onChange={(e) =>
                                            updatePsychTestField(
                                                index,
                                                'test_result',
                                                capitalizeString(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="Enter test result"
                                        aria-invalid={
                                            !!formErrors[
                                                `psych_tests.${index}.test_result`
                                            ]
                                        }
                                    />
                                    {formErrors[
                                        `psych_tests.${index}.test_result`
                                    ] && (
                                        <FieldError>
                                            {
                                                formErrors[
                                                    `psych_tests.${index}.test_result`
                                                ]
                                            }
                                        </FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel
                                        htmlFor={`psych_tests.${index}.interpretation`}
                                    >
                                        Interpretation{' '}
                                        <Asterisk size={15} color="red" />
                                    </FieldLabel>
                                    <Input
                                        id={`psych_tests.${index}.interpretation`}
                                        value={test.interpretation}
                                        maxLength={150}
                                        onChange={(e) =>
                                            updatePsychTestField(
                                                index,
                                                'interpretation',
                                                capitalizeString(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="Enter interpretation"
                                        aria-invalid={
                                            !!formErrors[
                                                `psych_tests.${index}.interpretation`
                                            ]
                                        }
                                    />
                                    {formErrors[
                                        `psych_tests.${index}.interpretation`
                                    ] && (
                                        <FieldError>
                                            {
                                                formErrors[
                                                    `psych_tests.${index}.interpretation`
                                                ]
                                            }
                                        </FieldError>
                                    )}
                                </Field>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={addPsychTest}
                            className="w-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Psychological Test Record
                        </Button>

                        {errors['psych_tests'] && (
                            <FieldError>{errors['psych_tests']}</FieldError>
                        )}
                    </FieldGroup>
                </FieldSet>
                <FieldSet>
                    <FieldLegend>VI. Concerns</FieldLegend>
                    <FieldDescription>
                        Please answer the following questions honestly. Your
                        responses help the Guidance Office provide the
                        appropriate support.
                    </FieldDescription>
                    <FieldGroup>
                        {concerns.map((q: ConcernQuestion, index: number) => {
                            const entry = concernAnswers[index];
                            const showSubQuestion =
                                !!q.sub_question && entry.answer === 'Yes';

                            return (
                                <div
                                    key={index}
                                    className="space-y-3 rounded-lg border p-4"
                                >
                                    <Field>
                                        <FieldLabel
                                            htmlFor={`concerns.${index}.answer`}
                                        >
                                            {q.question}{' '}
                                            <Asterisk size={15} color="red" />
                                        </FieldLabel>
                                        <Select
                                            value={entry.answer}
                                            onValueChange={(value) =>
                                                updateConcernAnswer(
                                                    index,
                                                    value as 'Yes' | 'No',
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id={`concerns.${index}.answer`}
                                                aria-invalid={
                                                    !!formErrors[
                                                        `concerns.${index}.answer`
                                                    ]
                                                }
                                            >
                                                <SelectValue placeholder="Choose an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Yes">
                                                        Yes
                                                    </SelectItem>
                                                    <SelectItem value="No">
                                                        No
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {formErrors[
                                            `concerns.${index}.answer`
                                        ] && (
                                            <FieldError>
                                                {
                                                    formErrors[
                                                        `concerns.${index}.answer`
                                                    ]
                                                }
                                            </FieldError>
                                        )}
                                    </Field>

                                    {showSubQuestion && q.sub_question && (
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`concern_${index}_sub`}
                                            >
                                                {q.sub_question[0].question}{' '}
                                                <Asterisk
                                                    size={15}
                                                    color="red"
                                                />
                                            </FieldLabel>
                                            <Input
                                                id={`concern_${index}_sub`}
                                                value={entry.subAnswer}
                                                onChange={(e) =>
                                                    updateConcernSubAnswer(
                                                        index,
                                                        capitalizeString(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                aria-invalid={
                                                    !!subAnswerErrors[index]
                                                }
                                                placeholder="Enter your answer"
                                            />
                                            {subAnswerErrors[index] && (
                                                <FieldError>
                                                    This field is required.
                                                </FieldError>
                                            )}
                                        </Field>
                                    )}
                                </div>
                            );
                        })}

                        {errors['concerns'] && (
                            <FieldError>{errors['concerns']}</FieldError>
                        )}
                    </FieldGroup>
                </FieldSet>
                <SignatureModal
                    open={signatureModalOpen}
                    setOpen={setSignatureModalOpen}
                    id_number={data.id_number}
                    onSave={(file) => {
                        setData('e_signature', file);
                        setDataPrivacyConsent(true);
                        setSignatureModalOpen(false);
                    }}
                />
                <FieldSet>
                    <FieldLegend>Data Privacy Consent</FieldLegend>
                    <FieldGroup>
                        <label
                            htmlFor="data_privacy_consent"
                            className={`block cursor-pointer rounded-lg border p-4 transition-all ${
                                dataPrivacyConsent
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="data_privacy_consent"
                                    checked={dataPrivacyConsent}
                                    onCheckedChange={(checked) =>
                                        handleConsentToggle(!!checked)
                                    }
                                    aria-invalid={
                                        !!formErrors['data_privacy_consent']
                                    }
                                />
                                <div className="flex-1">
                                    <FieldLabel
                                        htmlFor="data_privacy_consent"
                                        className="cursor-pointer font-normal"
                                    >
                                        I hereby certify that the information
                                        provided above is true and correct to
                                        the best of my knowledge. I authorize
                                        the University Guidance Office and duly
                                        authorized personnel to collect,
                                        process, use, and maintain my
                                        information for legitimate educational,
                                        guidance, counseling, and other related
                                        University purposes, in accordance with
                                        the University Data Privacy Policy and
                                        applicable data privacy laws.
                                        <br />
                                        <br />
                                        By checking this box, I confirm that I
                                        have read, understood, and agreed to the
                                        statements stated above.
                                    </FieldLabel>
                                    {formErrors['data_privacy_consent'] && (
                                        <FieldError className="mt-1">
                                            {formErrors['data_privacy_consent']}
                                        </FieldError>
                                    )}
                                </div>
                            </div>
                        </label>
                    </FieldGroup>
                </FieldSet>
                <div className="flex flex-col items-end gap-2">
                    <Button
                        type="submit"
                        disabled={
                            !dataPrivacyConsent ||
                            !data.e_signature ||
                            processing
                        }
                        className="w-full md:w-auto"
                    >
                        {processing ? (
                            <>
                                <Spinner /> Submitting...
                            </>
                        ) : (
                            <>
                                Submit <SendIcon />
                            </>
                        )}
                    </Button>
                    {(!dataPrivacyConsent || !data.e_signature) && (
                        <p className="text-sm text-muted-foreground">
                            Please check the Data Privacy Consent box and
                            provide your e-signature to submit.
                        </p>
                    )}
                </div>
            </form>
        </>
    );
}
