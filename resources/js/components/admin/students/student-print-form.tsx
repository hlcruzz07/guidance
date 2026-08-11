import type { Student } from '@/types/entities';
import { createPortal } from 'react-dom';
import { Field, FieldGroup, FieldLabel } from '../../ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '../../ui/label';
import { useDropdowns } from '@/hooks/use-dropdowns';
import { CheckIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { tr } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { getSignature } from '@/routes';

type Props = {
    student: Student | null;
};

export default function StudentSIIPrintForm({ student }: Props) {
    const {
        studentTypes,
        sexualOrientations,
        maritalRelationships,
        financers,
        houseMonthlyIncomes,
        natureResidence,
        equityGroups,
        concerns,
    } = useDropdowns();

    const printRootRef = useRef<HTMLTableElement>(null);
    const page1Ref = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);
    const [page1Scale, setPage1Scale] = useState(1);
    const [signatureError, setSignatureError] = useState(false);

    // Keep these in sync with the `@page` rule in app.css:
    // `@page { size: 8.5in 13in; margin: 15px 30px; }`
    const PAGE_HEIGHT_PX = 13 * 96;
    const PAGE_VERTICAL_MARGIN_PX = 15 * 2;
    const USABLE_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_VERTICAL_MARGIN_PX;

    useEffect(() => {
        if (!student || !printRootRef.current) return;

        const el = printRootRef.current;

        const calculatePages = () => {
            setPageCount(
                Math.max(1, Math.ceil(el.scrollHeight / USABLE_HEIGHT_PX)),
            );
        };

        calculatePages();

        const resizeObserver = new ResizeObserver(() => calculatePages());
        resizeObserver.observe(el);

        window.addEventListener('beforeprint', calculatePages);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('beforeprint', calculatePages);
        };
    }, [student]);
    useEffect(() => {
        if (!student || !page1Ref.current) return;

        const el = page1Ref.current;

        const fit = () => {
            // Reset first so we measure the true, unzoomed content height.
            el.style.zoom = '1';
            const naturalHeight = el.scrollHeight;
            const scale =
                naturalHeight > USABLE_HEIGHT_PX
                    ? USABLE_HEIGHT_PX / naturalHeight
                    : 1;
            setPage1Scale(scale);
        };

        fit();

        const resizeObserver = new ResizeObserver(fit);
        resizeObserver.observe(el);
        window.addEventListener('beforeprint', fit);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('beforeprint', fit);
        };
    }, [student]);

    useEffect(() => {
        setSignatureError(false);
    }, [student]);

    if (!student) return null;

    const father = student.guardians?.find((g) => g.relationship === 'Father');
    const mother = student.guardians?.find((g) => g.relationship === 'Mother');

    const parentRowCount = 11; // Name, Age, Contact Number, ...
    const siblingRows = [...(student.siblings ?? [])].sort((a, b) => {
        if (!a.birthdate) return 1;
        if (!b.birthdate) return -1;
        return dayjs(a.birthdate).diff(dayjs(b.birthdate));
    });
    const totalRows = Math.max(parentRowCount, siblingRows.length);
    return createPortal(
        <table
            id="print-root"
            ref={printRootRef}
            className="w-full border-collapse"
        >
            <thead>
                <tr>
                    <td className="pb-4">
                        <table className="w-full table-fixed border-collapse border">
                            <tbody>
                                <tr>
                                    <td className="w-20 border-e">
                                        <div className="flex items-center justify-center">
                                            <img
                                                src="/logo.webp"
                                                className="size-15 object-contain"
                                                alt="Logo"
                                            />
                                        </div>
                                    </td>

                                    <td className="text-center font-extrabold">
                                        <h1>STUDENT’S INDIVIDUAL INVENTORY</h1>
                                        <h1>(NEW STUDENTS)</h1>
                                    </td>

                                    <td className="w-64 border-s !p-0">
                                        <p className="border-b px-2 font-extrabold">
                                            Document Code: F.11-OGS-CHMSU
                                        </p>
                                        <p className="border-b px-2 font-extrabold">
                                            Revision No.: 1
                                        </p>
                                        <p className="border-b px-2 font-extrabold">
                                            Effective Date: July 03, 2026
                                        </p>
                                        <p className="px-2 font-extrabold">
                                            Total Pages: {pageCount}
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </thead>

            <div className="fixed right-3 bottom-3 z-100 size-35 border-2 border-black bg-white text-center opacity-50">
                <h1 className="m-0! h-5 p-0! text-xs leading-5 italic">
                    STATUS
                </h1>

                <div className="flex h-[calc(100%-1.25rem)] items-center justify-center border-t border-black p-3">
                    <img
                        src="/footer.jpg"
                        className="max-h-full max-w-full object-contain"
                        alt=""
                    />
                </div>
            </div>
            <tbody>
                <tr>
                    <td>
                        <div className="space-y-4">
                            <div
                                ref={page1Ref}
                                style={{
                                    maxHeight: USABLE_HEIGHT_PX,
                                    overflow: 'hidden',
                                    zoom: page1Scale,
                                }}
                            >
                                <div className="space-y-4">
                                    <h1 className="mx-auto block w-[90%] border-2 p-2 text-[9px] text-wrap break-words">
                                        <b className="inline text-[9px]">
                                            GENERAL INSTRUCTION:
                                        </b>{' '}
                                        Please answer all items clearly and
                                        honestly. Write N/A if an item does not
                                        apply to you. All information you
                                        provide will be kept confidential and
                                        used only for guidance and counseling
                                        purposes, in accordance with the Data
                                        Privacy Act of 2012.
                                    </h1>
                                    <div className="grid grid-cols-[20px_1fr_2in] gap-3">
                                        <div className="flex justify-start font-bold">
                                            I.
                                        </div>

                                        <div>
                                            <h1 className="mb-5 text-xs font-bold">
                                                PERSONAL INFORMATION
                                            </h1>
                                            <div className="space-y-1">
                                                <div className="flex">
                                                    <p className="p-0! text-xs">
                                                        Name:
                                                    </p>
                                                    <table className="w-full">
                                                        <tr className="p-0! text-center [&>td]:p-0! [&>td]:text-sm! [&>td]:font-bold!">
                                                            <td>
                                                                {[
                                                                    student.lname,
                                                                    student.suffix,
                                                                ]
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .join(', ')}
                                                            </td>
                                                            <td>
                                                                {student.fname}
                                                            </td>
                                                            <td>
                                                                {student.mname ??
                                                                    'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-t p-0! text-center [&>td]:p-0! [&>td]:text-xs!">
                                                            <td>
                                                                (Family Name)
                                                            </td>
                                                            <td>
                                                                (First Name)
                                                            </td>
                                                            <td>
                                                                (Middle Name)
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <div>
                                                    <p className="text-xs">
                                                        Type of Student:
                                                    </p>

                                                    <div className="flex gap-5 text-xs">
                                                        {studentTypes.map(
                                                            (item: string) => (
                                                                <label className="flex items-center gap-2">
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        {student.type ===
                                                                            item && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>
                                                                    <span
                                                                        className={`${student.gender === item && 'font-bold'}`}
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid max-w-full grid-cols-3 gap-1 text-nowrap">
                                                    <div className="flex">
                                                        <p className="w-max text-xs">
                                                            Course:
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            {student.course}
                                                        </p>
                                                    </div>
                                                    <div className="flex">
                                                        <p className="w-max text-xs">
                                                            Year & Section:
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            {student.year_level}
                                                            -{student.section}
                                                        </p>
                                                    </div>
                                                    <div className="flex">
                                                        <p className="w-max text-xs">
                                                            Contact No.:
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            0{student.phone}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                                                    <div className="flex gap-2">
                                                        <p className="w-max text-xs">
                                                            Sex:
                                                        </p>
                                                        <div className="flex grow items-center gap-3 text-xs">
                                                            {[
                                                                'Male',
                                                                'Female',
                                                            ].map((item) => (
                                                                <label
                                                                    key={item}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        {student.gender ===
                                                                            item && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>
                                                                    <span
                                                                        className={`${student.gender === item && 'font-bold'}`}
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs">
                                                            Age:
                                                        </p>
                                                        <p className="w-16 border-b text-center text-xs font-bold">
                                                            {dayjs().diff(
                                                                dayjs(
                                                                    student.date_of_birth,
                                                                ),
                                                                'year',
                                                            )}{' '}
                                                            yrs
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <p className="w-max text-xs">
                                                            Civil Status:
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            {
                                                                student.civil_status
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[max-content_1fr] gap-2">
                                                    <p className="text-xs">
                                                        Sexual Orientation:
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-2 text-xs">
                                                        {sexualOrientations.map(
                                                            (item: string) => (
                                                                <label
                                                                    key={item}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        {student.sexual_orientation ===
                                                                            item && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={
                                                                            student.sexual_orientation ===
                                                                            item
                                                                                ? 'font-bold'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}

                                                        {student.sexual_orientation &&
                                                            !sexualOrientations.includes(
                                                                student.sexual_orientation,
                                                            ) && (
                                                                <label className="flex items-center gap-2">
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        <CheckIcon
                                                                            size={
                                                                                8
                                                                            }
                                                                            strokeWidth={
                                                                                5
                                                                            }
                                                                            className="shrink-0"
                                                                        />
                                                                    </span>

                                                                    <span>
                                                                        Others:{' '}
                                                                        <span className="border-b font-bold">
                                                                            {
                                                                                student.sexual_orientation
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex h-[2in] w-[2in] items-center justify-center border-3 text-center">
                                            <div>
                                                <h1 className="text-sm">
                                                    Recent 2×2
                                                </h1>
                                                <h1 className="text-sm">
                                                    Picture
                                                </h1>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[20px_1fr] gap-3">
                                        <div className="flex justify-center font-bold"></div>
                                        <div className="space-y-1 text-nowrap">
                                            <div className="grid grid-cols-[auto_auto_1fr_1fr_1fr] gap-2">
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Height:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.height ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Weight:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.weight ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Date of Birth:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {dayjs(
                                                            student.date_of_birth,
                                                        ).format(`MMM D, YYYY`)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Place of Birth:
                                                    </p>
                                                    <p
                                                        className={`grow border-b text-center ${student.place_of_birth.length > 25 ? 'text-[10px]' : 'text-xs'} font-bold`}
                                                    >
                                                        {student.place_of_birth}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Nationality:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.nationality}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <p className="text-xs">
                                                    Home Address:
                                                </p>
                                                <p className="grow border-b text-xs font-bold">
                                                    {student.home_address}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <p className="text-xs">
                                                    Current Address:
                                                </p>
                                                <p className="grow border-b text-xs font-bold">
                                                    {student.current_address}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <p className="text-xs">
                                                    Email Address:
                                                </p>
                                                <p className="grow border-b text-xs font-bold">
                                                    {student.email}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <p className="text-xs">
                                                    Last School Attended:
                                                </p>
                                                <p className="grow border-b ps-3 text-xs font-bold">
                                                    {student.last_school_attended ||
                                                        'N/A'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        General Average
                                                        (HS/SHS/College):
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.general_average ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Strand/Course:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.strand_course ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Religion:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.religion}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-[1fr_1fr] gap-2">
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Do you have an existing
                                                        scholarship?
                                                    </p>
                                                    <p className="flex grow items-center gap-2 text-center text-xs font-bold">
                                                        {['Yes', 'No'].map(
                                                            (item) => {
                                                                const checked =
                                                                    item ===
                                                                    'Yes'
                                                                        ? !!student.scholarship
                                                                        : !student.scholarship;

                                                                return (
                                                                    <label
                                                                        key={
                                                                            item
                                                                        }
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                            {checked && (
                                                                                <CheckIcon
                                                                                    size={
                                                                                        8
                                                                                    }
                                                                                    strokeWidth={
                                                                                        5
                                                                                    }
                                                                                    className="shrink-0"
                                                                                />
                                                                            )}
                                                                        </span>

                                                                        <span
                                                                            className={`${checked && 'font-bold'}`}
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                );
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        If yes, please specify:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {student.scholarship ??
                                                            'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <p className="text-xs">
                                                    Person to be contacted in
                                                    case of Emergency:
                                                </p>
                                                <p className="grow border-b text-xs font-bold">
                                                    {student.contact_person}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Address:
                                                    </p>
                                                    <p className="grow border-b text-xs font-bold">
                                                        {
                                                            student.contact_person_address
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Contact No.:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {
                                                            student.contact_person_mobile_um
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        Relationship:
                                                    </p>
                                                    <p className="grow border-b text-center text-xs font-bold">
                                                        {
                                                            student.contact_person_relationship
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[20px_1fr] gap-3">
                                        <div className="flex justify-start font-bold">
                                            II.
                                        </div>
                                        <div>
                                            <h1 className="text-xs font-bold">
                                                EDUCATIONAL BACKGROUND
                                            </h1>

                                            <table className="w-full table-auto border-collapse border text-start">
                                                <tr className="[&>th]:border! [&>th]:p-0! [&>th]:text-[10px]! [&>th]:font-bold!">
                                                    <th>LEVEL</th>
                                                    <th>SCHOOL </th>
                                                    <th>YEAR COVERED</th>
                                                    <th>PUBLIC/PRIVATE</th>
                                                    <th>HONOR RECEIVED</th>
                                                </tr>
                                                {student.educations?.map(
                                                    (item, i) => (
                                                        <tr
                                                            key={i}
                                                            className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:font-extrabold"
                                                        >
                                                            <td className="border uppercase">
                                                                {
                                                                    item.education_level
                                                                }
                                                            </td>
                                                            <td className="border uppercase">
                                                                {item.school_name ||
                                                                    'N/A'}
                                                            </td>
                                                            <td className="border uppercase">
                                                                {item.year_covered ||
                                                                    'N/A'}
                                                            </td>
                                                            <td className="border uppercase">
                                                                {item.school_type ||
                                                                    'N/A'}
                                                            </td>
                                                            <td className="border uppercase">
                                                                {item.honor_receieved ||
                                                                    'N/A'}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </table>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[20px_1fr] gap-3">
                                        <div className="flex justify-start font-bold">
                                            III.
                                        </div>
                                        <div>
                                            <h1 className="text-xs font-bold">
                                                HOME AND FAMILY BACKGROUND
                                            </h1>

                                            <div className="grid grid-cols-[1fr_0.5fr] items-start gap-3">
                                                <table className="w-full table-auto border-collapse border text-start">
                                                    <tr className="[&>th]:border! [&>th]:p-0! [&>th]:text-xs! [&>th]:font-bold!">
                                                        <th></th>
                                                        <th>FATHER</th>
                                                        <th>MOTHER</th>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Name
                                                        </td>
                                                        <td className="border">
                                                            {father?.full_name ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.full_name ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Age
                                                        </td>
                                                        <td className="border">
                                                            {father?.birthdate
                                                                ? `${dayjs().diff(dayjs(father.birthdate), 'year')} yrs old`
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.birthdate
                                                                ? `${dayjs().diff(dayjs(mother.birthdate), 'year')} yrs old`
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Contact Number
                                                        </td>
                                                        <td className="border">
                                                            {father?.phone ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.phone ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Birthplace
                                                        </td>
                                                        <td className="border">
                                                            {father?.birthplace?.slice(
                                                                0,
                                                                25,
                                                            ) || 'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.birthplace?.slice(
                                                                0,
                                                                25,
                                                            ) || 'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Nationality
                                                        </td>
                                                        <td className="border">
                                                            {father?.nationality ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.nationality ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Religion
                                                        </td>
                                                        <td className="border">
                                                            {father?.religion ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.religion ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Living or Deceased
                                                        </td>
                                                        <td className="border">
                                                            {father?.life_status ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.life_status ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            If deceased, cause
                                                            of death
                                                        </td>
                                                        <td className="border">
                                                            {father?.cause_of_death ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.cause_of_death ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Year of death
                                                        </td>
                                                        <td className="border">
                                                            {father?.year_of_death ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.year_of_death ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>
                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Educational
                                                            Attainment
                                                        </td>
                                                        <td className="border">
                                                            {father?.highest_educ_attainment ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.highest_educ_attainment ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>

                                                    <tr className="[&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:text-nowrap! [&>td:not(:first-child)]:font-bold!">
                                                        <td className="border">
                                                            Occupation
                                                        </td>
                                                        <td className="border">
                                                            {father?.occupation ||
                                                                'N/A'}
                                                        </td>
                                                        <td className="border">
                                                            {mother?.occupation ||
                                                                'N/A'}
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table className="table-auto border-collapse self-start border text-start">
                                                    <thead>
                                                        <tr className="[&>th]:border! [&>th]:p-0! [&>th]:align-top [&>th]:text-xs! [&>th]:leading-tight [&>th]:font-bold!">
                                                            <th>
                                                                Name of the
                                                                Siblings <br />
                                                                (Eldest to
                                                                youngest)
                                                            </th>
                                                            <th>Sex</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.from({
                                                            length: totalRows,
                                                        }).map((_, i) => {
                                                            const sibling =
                                                                siblingRows[i];

                                                            return (
                                                                <tr
                                                                    key={i}
                                                                    className="[&>td]:border [&>td]:p-0.5! [&>td]:px-1! [&>td]:align-top [&>td]:text-[10px]! [&>td]:leading-tight [&>td]:font-bold"
                                                                >
                                                                    <td className="text-center">
                                                                        {sibling?.full_name
                                                                            ? `${sibling?.full_name} (${dayjs().diff(dayjs(sibling.birthdate), 'year')} yrs)`
                                                                            : '\u00A0'}
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {sibling?.gender ||
                                                                            '\u00A0'}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="mt-2 space-y-2">
                                                <div>
                                                    <p className="text-xs">
                                                        Paren's Marital
                                                        Relationsip:
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-6 text-xs">
                                                        {maritalRelationships.map(
                                                            (item: string) => (
                                                                <label
                                                                    key={item}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        {student.parent_marital_relationship ===
                                                                            item && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={
                                                                            student.parent_marital_relationship ===
                                                                            item
                                                                                ? 'font-bold'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}

                                                        {student.parent_marital_relationship &&
                                                            !maritalRelationships.includes(
                                                                student.parent_marital_relationship,
                                                            ) && (
                                                                <label className="flex items-center gap-2">
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        <CheckIcon
                                                                            size={
                                                                                8
                                                                            }
                                                                            strokeWidth={
                                                                                5
                                                                            }
                                                                            className="shrink-0"
                                                                        />
                                                                    </span>

                                                                    <span>
                                                                        Others:{' '}
                                                                        <span className="border-b font-bold">
                                                                            {
                                                                                student.parent_marital_relationship
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-[1fr_1fr] gap-5 text-nowrap">
                                                    <div className="flex">
                                                        <p className="w-max text-xs">
                                                            Birth Order (1st
                                                            Child, 2nd Child,
                                                            etc.):
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            {student.birth_order ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="flex">
                                                        <p className="w-max text-xs">
                                                            Number of siblings
                                                            gainfully employed:
                                                        </p>
                                                        <p className="grow border-b text-center text-xs font-bold">
                                                            {student.siblings?.filter(
                                                                (item) =>
                                                                    item.is_employed ===
                                                                    true,
                                                            ).length || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs">
                                                        Who finances your
                                                        schooling?
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-6 text-xs">
                                                        {financers.map(
                                                            (item: string) => (
                                                                <label
                                                                    key={item}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        {student.financer ===
                                                                            item && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={
                                                                            student.financer ===
                                                                            item
                                                                                ? 'font-bold'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}

                                                        {student.financer &&
                                                            !financers.includes(
                                                                student.financer,
                                                            ) && (
                                                                <label className="flex items-center gap-2">
                                                                    <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                        <CheckIcon
                                                                            size={
                                                                                8
                                                                            }
                                                                            strokeWidth={
                                                                                5
                                                                            }
                                                                            className="shrink-0"
                                                                        />
                                                                    </span>

                                                                    <span>
                                                                        Others,
                                                                        please
                                                                        specify:{' '}
                                                                        <span className="border-b font-bold">
                                                                            {
                                                                                student.financer
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <p className="text-xs">
                                                        How much is your weekly
                                                        allowance?:
                                                    </p>
                                                    <p className="max-w-max grow border-b text-xs font-bold">
                                                        Php{' '}
                                                        {student.weekly_allowance
                                                            ? Number(
                                                                  student.weekly_allowance,
                                                              ).toLocaleString()
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs">
                                                        Household/Family Income:
                                                    </p>

                                                    <table className="table-auto border-collapse self-start border text-start">
                                                        <thead>
                                                            <tr className="[&>th]:border! [&>th]:p-0! [&>th]:align-top [&>th]:text-xs! [&>th]:leading-tight [&>th]:font-bold!">
                                                                <th>MONTHLY</th>
                                                                <th>
                                                                    ANNUAL
                                                                    EQUIVALENT
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {houseMonthlyIncomes.map(
                                                                (
                                                                    item: any,
                                                                    i: number,
                                                                ) => {
                                                                    const checked =
                                                                        student.household_income ===
                                                                        item.monthly;

                                                                    return (
                                                                        <tr
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="[&>td]:border [&>td]:p-0.5! [&>td]:px-1! [&>td]:align-top [&>td]:text-xs! [&>td]:leading-tight [&>td]:font-bold"
                                                                        >
                                                                            <td>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center border border-black text-xs">
                                                                                        {checked && (
                                                                                            <CheckIcon
                                                                                                size={
                                                                                                    8
                                                                                                }
                                                                                                strokeWidth={
                                                                                                    5
                                                                                                }
                                                                                                className="shrink-0"
                                                                                            />
                                                                                        )}
                                                                                    </span>

                                                                                    <span>
                                                                                        {
                                                                                            item.monthly
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </td>

                                                                            <td>
                                                                                {
                                                                                    item.annual
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                },
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*
                                Everything above this point is scaled to fit
                                on page 1. Everything from here on always
                                starts fresh on the next page, regardless of
                                how much (or little) space page 1 used.
                            */}
                            <div className="grid break-before-page grid-cols-[20px_1fr] gap-3">
                                <div></div>
                                <div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs">
                                                Nature of residence while
                                                attending school:
                                            </p>

                                            <div className="flex flex-wrap gap-x-6 text-xs">
                                                {natureResidence.map(
                                                    (item: string) => (
                                                        <label
                                                            key={item}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                {student.nature_of_residence ===
                                                                    item && (
                                                                    <CheckIcon
                                                                        size={8}
                                                                        strokeWidth={
                                                                            5
                                                                        }
                                                                        className="shrink-0"
                                                                    />
                                                                )}
                                                            </span>

                                                            <span
                                                                className={
                                                                    student.nature_of_residence ===
                                                                    item
                                                                        ? 'font-bold'
                                                                        : ''
                                                                }
                                                            >
                                                                {item}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}

                                                {student.nature_of_residence &&
                                                    !natureResidence.includes(
                                                        student.nature_of_residence,
                                                    ) && (
                                                        <label className="flex items-center gap-2">
                                                            <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                <CheckIcon
                                                                    size={8}
                                                                    strokeWidth={
                                                                        5
                                                                    }
                                                                    className="shrink-0"
                                                                />
                                                            </span>

                                                            <span>
                                                                Others, please
                                                                specify:{' '}
                                                                <span className="border-b font-bold">
                                                                    {
                                                                        student.nature_of_residence
                                                                    }
                                                                </span>
                                                            </span>
                                                        </label>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] gap-3">
                                <div className="flex justify-start font-bold">
                                    IV.
                                </div>
                                <div>
                                    <div>
                                        <h1 className="text-xs font-bold">
                                            EQUITY TARGET GROUP AFFILIATION
                                        </h1>
                                        <p className="text-xs font-bold text-wrap break-words">
                                            {' '}
                                            DO YOU BELONG TO THE FOLLOWING
                                            GROUP? If YES, please CHECK (☑) the
                                            box(es) corresponding to the
                                            group(s) you belong to and upload
                                            the required supporting document or
                                            proof (e.g., Identification Card,
                                            Certificate of Membership, Barangay
                                            Certification, Tax Exemption
                                            Certificate, or another applicable
                                            government-issued
                                            certification/issuance).
                                        </p>
                                    </div>

                                    <table className="w-full table-auto border-collapse self-start border text-start">
                                        <thead>
                                            <tr className="[&>th]:border! [&>th]:p-0! [&>th]:align-top [&>th]:text-xs! [&>th]:leading-tight [&>th]:font-bold!">
                                                <th>GROUP</th>
                                                <th>PROOF</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {equityGroups.map(
                                                (item: string, i: number) => {
                                                    const match =
                                                        student.equity_groups?.find(
                                                            (g) =>
                                                                g.equity_group ===
                                                                    item ||
                                                                g.equity_group.startsWith(
                                                                    `${item} - `,
                                                                ),
                                                        );
                                                    const checked = !!match;
                                                    const hasProof =
                                                        !!match?.proof;

                                                    return (
                                                        <tr
                                                            key={i}
                                                            className="[&>td]:border [&>td]:p-0.5! [&>td]:px-1! [&>td]:align-top [&>td]:text-xs! [&>td]:leading-tight [&>td]:font-bold"
                                                        >
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center border border-black text-xs">
                                                                        {checked && (
                                                                            <CheckIcon
                                                                                size={
                                                                                    8
                                                                                }
                                                                                strokeWidth={
                                                                                    5
                                                                                }
                                                                                className="shrink-0"
                                                                            />
                                                                        )}
                                                                    </span>

                                                                    <span>
                                                                        {item}
                                                                        {match &&
                                                                            match.equity_group !==
                                                                                item && (
                                                                                <>
                                                                                    {
                                                                                        ' - '
                                                                                    }
                                                                                    {match.equity_group.replace(
                                                                                        `${item} - `,
                                                                                        '',
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="text-center align-middle!">
                                                                {hasProof && (
                                                                    <CheckIcon className="mx-auto size-3" />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] gap-3">
                                <div className="flex justify-start font-bold">
                                    V.
                                </div>
                                <div>
                                    <h1 className="text-xs font-bold">
                                        PSYCHOLOGICAL TEST RESULT
                                    </h1>

                                    <table className="w-full table-fixed border-collapse border text-start">
                                        <tr className="[&>th]:border! [&>th]:p-0! [&>th]:text-center! [&>th]:text-[10px]! [&>th]:font-bold! [&>th]:break-words">
                                            <th className="w-[15%]">
                                                DATE TAKEN
                                            </th>
                                            <th className="w-[25%]">
                                                NAME OF TEST{' '}
                                            </th>
                                            <th className="w-[20%]">RESULT</th>
                                            <th className="w-[40%]">
                                                INTERPRETATION
                                            </th>
                                        </tr>
                                        {Array.from({
                                            length: Math.max(
                                                5,
                                                student.psych_tests?.length ??
                                                    0,
                                            ),
                                        }).map((_, i) => {
                                            const item =
                                                student.psych_tests?.[i];

                                            return (
                                                <tr
                                                    key={i}
                                                    className="[&>td]:border [&>td]:p-0.5! [&>td]:px-1! [&>td]:text-[10px]! [&>td]:font-extrabold [&>td]:text-wrap [&>td]:break-words"
                                                >
                                                    <td>
                                                        {item?.date_taken ||
                                                            '\u00A0'}
                                                    </td>
                                                    <td>
                                                        {item?.test_name ||
                                                            '\u00A0'}
                                                    </td>
                                                    <td>
                                                        {item?.test_result ||
                                                            '\u00A0'}
                                                    </td>
                                                    <td>
                                                        {item?.interpretation ||
                                                            '\u00A0'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] gap-3">
                                <div className="flex justify-start font-bold">
                                    VI.
                                </div>

                                <div>
                                    <h1 className="text-xs font-bold">
                                        CONCERNS
                                    </h1>

                                    <ol className="mt-3 list-outside list-[upper-alpha] space-y-3 pl-5 text-xs">
                                        {concerns.map(
                                            (item: any, i: number) => {
                                                const match =
                                                    student.concerns?.[i];
                                                const [baseAnswer, subAnswer] =
                                                    match?.answer
                                                        ? match.answer
                                                              .split(/,\s?/)
                                                              .map((s) =>
                                                                  s.trim(),
                                                              )
                                                        : [
                                                              undefined,
                                                              undefined,
                                                          ];

                                                return (
                                                    <li key={i}>
                                                        <div className="flex flex-wrap items-baseline gap-x-3">
                                                            <span>
                                                                {item.question}
                                                            </span>

                                                            <span className="inline-flex items-center gap-3 text-nowrap">
                                                                {[
                                                                    'Yes',
                                                                    'No',
                                                                ].map(
                                                                    (
                                                                        option,
                                                                    ) => (
                                                                        <label
                                                                            key={
                                                                                option
                                                                            }
                                                                            className="inline-flex items-center gap-1"
                                                                        >
                                                                            <span className="flex h-2.5 w-2.5 items-center justify-center border border-black text-xs">
                                                                                {baseAnswer ===
                                                                                    option && (
                                                                                    <CheckIcon
                                                                                        size={
                                                                                            8
                                                                                        }
                                                                                        strokeWidth={
                                                                                            5
                                                                                        }
                                                                                        className="shrink-0"
                                                                                    />
                                                                                )}
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    baseAnswer ===
                                                                                    option
                                                                                        ? 'font-bold'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>

                                                        {item.sub_question?.map(
                                                            (
                                                                sub: any,
                                                                j: number,
                                                            ) => (
                                                                <div
                                                                    key={j}
                                                                    className="mt-1 ps-4"
                                                                >
                                                                    <span>
                                                                        {
                                                                            sub.question
                                                                        }
                                                                    </span>{' '}
                                                                    <span className="min-w-[3in] border-b border-black font-bold">
                                                                        {subAnswer ||
                                                                            '\u00A0'}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </li>
                                                );
                                            },
                                        )}
                                    </ol>
                                </div>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] gap-3">
                                <div className="font-bold">VII.</div>

                                <div className="flex flex-col items-center gap-5">
                                    <div className="w-full">
                                        <h1 className="mb-3 text-xs font-bold">
                                            REMARKS (FOR GUIDANCE COUNSELORS
                                            ONLY)
                                        </h1>

                                        {student.remarks ? (
                                            <p className="font-bold underline underline-offset-4">
                                                {student.remarks}
                                            </p>
                                        ) : (
                                            <div className="w-full space-y-3">
                                                <p className="h-4 w-full border-b border-black" />
                                                <p className="h-4 w-full border-b border-black" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-center text-xs leading-relaxed">
                                            I hereby certify that the
                                            information provided above is true
                                            and correct to the best of my
                                            knowledge. I authorize the
                                            University Guidance Office and duly
                                            authorized personnel to collect,
                                            process, use, and maintain my
                                            information for legitimate
                                            educational, guidance, counseling,
                                            and other related University
                                            purposes, in accordance with the
                                            University Data Privacy Policy and
                                            applicable data privacy laws.
                                        </p>

                                        <p className="text-center text-xs leading-relaxed">
                                            By signing below, I confirm that I
                                            have read, understood, and agreed to
                                            the statements stated above.
                                        </p>
                                    </div>

                                    <div className="mt-5 flex flex-col items-center gap-5">
                                        <div className="relative w-80 text-center">
                                            <div className="border-b border-black pb-1 text-sm font-bold uppercase">
                                                {student.full_name}

                                                {!signatureError &&
                                                    student.e_signature && (
                                                        <img
                                                            src={
                                                                getSignature(
                                                                    student.e_signature as string,
                                                                ).url
                                                            }
                                                            alt="Signature"
                                                            className="absolute top-[-20px] left-1/2 h-10 w-auto -translate-x-1/2 mix-blend-multiply"
                                                            onError={() =>
                                                                setSignatureError(
                                                                    true,
                                                                )
                                                            }
                                                        />
                                                    )}
                                            </div>

                                            <p className="mt-1 text-xs font-bold">
                                                SIGNATURE OVER PRINTED NAME
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold">
                                                DATE:
                                            </span>

                                            <span className="min-w-40 border-b border-black text-center text-sm font-bold">
                                                {dayjs().format('MMMM D, YYYY')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>,
        document.body,
    );
}
