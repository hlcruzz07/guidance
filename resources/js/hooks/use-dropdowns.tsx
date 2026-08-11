import { usePage } from '@inertiajs/react';

export function useDropdowns() {
    const { dropdowns } = usePage<{ dropdowns: any[] }>().props;

    return {
        studentTypes:
            dropdowns.find((item) => item.name === 'Student Type')?.dropdowns ??
            [],
        sexualOrientations:
            dropdowns.find((item) => item.name === 'Sexual Orientation')
                ?.dropdowns ?? [],
        religions:
            dropdowns.find((item) => item.name === 'Religion')?.dropdowns ?? [],
        contactPersonRelationships:
            dropdowns.find(
                (item) => item.name === 'Contact Person Relationships',
            )?.dropdowns ?? [],
        maritalRelationships:
            dropdowns.find((item) => item.name === 'Parents Marital Status')
                ?.dropdowns ?? [],
        financers:
            dropdowns.find((item) => item.name === 'Financer')?.dropdowns ?? [],
        houseMonthlyIncomes:
            dropdowns.find((item) => item.name === 'Household Monthly Income')
                ?.dropdowns ?? [],
        natureResidence:
            dropdowns.find((item) => item.name === 'Nature Of Residence')
                ?.dropdowns ?? [],
        equityGroups:
            dropdowns.find((item) => item.name === 'Equity Groups')
                ?.dropdowns ?? [],
        concerns:
            dropdowns.find((item) => item.name === 'Concerns')?.dropdowns ?? [],
        highestEducationalAttainments:
            dropdowns.find(
                (item) => item.name === 'Highest Educational Attainment',
            )?.dropdowns ?? [],
    };
}
