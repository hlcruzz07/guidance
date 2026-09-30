export interface Student {
    id?: number;
    id_number: string;
    e_signature: string | File | null;
    campus: string;
    fname: string;
    mname: string | null;
    lname: string;
    suffix: string | null;
    full_name?: string;
    course_year_section?: string;
    email: string;
    phone: string | null;

    type: string;
    course: string;
    year_level: string | null;
    section: string;
    has_scholarship?: boolean;

    gender: string;
    civil_status: string;
    sexual_orientation: string | null;

    height: string | null;
    weight: string | null;

    religion: string;
    date_of_birth: string;
    place_of_birth: string;
    nationality: string | null;
    last_school_attended: string | null;
    current_address: string;
    home_address: string;
    general_average: string | null;
    strand_course: string | null;
    scholarship: string | null;
    contact_person: string;
    contact_person_address: string;
    contact_person_mobile_um: string;
    contact_person_relationship: string;
    parent_marital_relationship: string | null;
    birth_order: string | null;
    financer: string | null;

    weekly_allowance: string | null;
    household_income: string | null;

    nature_of_residence: string | null;
    remarks?: string | null;
    remark_by?: number;

    remarked_at?: string | null;
    created_at?: string;
    updated_at?: string;

    // Relationships
    guardians?: Guardian[];
    educations?: Education[];
    siblings?: Sibling[];
    psych_tests?: PsychTest[];
    equity_groups?: EquityGroup[];
    concerns?: Concern[];
    counselor?: any;
}

export interface Guardian {
    id?: number;
    student_id?: number;
    fname: string;
    mname: string | null;
    lname: string;
    suffix: string | null;
    relationship: string;
    birthdate: string | null;
    birthplace: string | null;
    full_name?: string;
    religion: string;
    nationality: string;
    phone: string;
    highest_educ_attainment: string;
    life_status: string;
    cause_of_death: string | null;
    year_of_death: string | null;
    occupation: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Education {
    id?: number;
    student_id?: number;
    education_level: string;
    school_name: string;
    school_type: string;
    year_covered: string;
    honor_receieved: string | null;

    created_at?: string;
    updated_at?: string;
}

export interface Sibling {
    id?: number;
    student_id?: number;
    fname: string;
    mname: string | null;
    lname: string;
    gender: string | null;
    is_employed: boolean;
    birthdate: string;
    full_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PsychTest {
    id?: number;
    student_id?: number;
    date_taken: string;
    test_name: string;
    test_result: string;
    interpretation: string;
    created_at?: string;
    updated_at?: string;
}

export interface StudentRecord {
    student_id: string;
    e_signature: any;
    campus: string;
    student_lastname: string;
    student_middlename: string | null;
    student_firstname: string;
    email: string;
    contact_number: string;
    gender: string;
    birthdate: string;
    birthplace: string;
    student_address: string;
    zip_code: string;
    civilstatus: string;
    religion: string;
    person_notify_name: string | null;
    person_notify_address: string | null;
    person_notify_cellphone: number | null;
    yearlevel: number;
    program_code: string;
    section_code: string;
    osis?: OsisStudent | null;
}

// EquityGroup mirrors app/Models/EquityGroup.php:
// fillable: student_id, equity_group, proof, id_number.
export interface EquityGroup {
    id?: number;
    student_id?: number;
    equity_group: string;
    id_number?: string | null;
    // On submit from the form this is either a single File or an existing Drive file ID string.
    proof: string[] | string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Concern {
    id?: number;
    student_id?: number;
    question: string;
    answer: string;
    created_at?: string;
    updated_at?: string;
}

// ---- OSIS socio-economic data (from OsisStudentLookup::findByEmail) ----

export interface SocioEconomicProof {
    id: number;
    socio_economic_profile_id: number;
    proof: string;
    created_at?: string;
    updated_at?: string;
}

export interface SocioEconomicProfile {
    id: number;
    student_id: number;
    socio_economic_category_id: number;
    id_number: string;
    status: number;
    proofs: SocioEconomicProof[];
    created_at?: string;
    updated_at?: string;
}

export interface SocioEconomicCategory {
    id: number;
    code: string;
    name: string;
    desc: string | null;
    // 1 = this category requires an ID Number field alongside proof upload
    with_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface OsisStudent {
    id: number;
    fname: string;
    mname: string | null;
    lname: string;
    suffix: string | null;
    birthdate: string;
    birthplace: string | null;
    gender: string;
    sexual_orientation: string | null;
    civil_status: string;
    email: string;
    contact_number: string | null;
    campus: string;
    college: string | null;
    program_applied: string | null;
    major: string | null;
    course: string | null;
    year_section: string | null;
    entry_status: string | null;
    date_admitted: string | null;
    status: number;
    academic_year: string | null;
    semester: string | null;
    f_fname: string | null;
    f_mname: string | null;
    f_lname: string | null;
    f_occupation: string | null;
    f_highest_education: string | null;
    m_fname: string | null;
    m_mname: string | null;
    m_lname: string | null;
    m_occupation: string | null;
    m_highest_education: string | null;
    s_fname: string | null;
    s_mname: string | null;
    s_lname: string | null;
    s_occupation: string | null;
    s_highest_education: string | null;
    shs_name: string | null;
    shs_address: string | null;
    shs_year: string | null;
    shs_type: string | null;
    c_name: string | null;
    c_address: string | null;
    c_year: string | null;
    c_type: string | null;
    created_at?: string;
    updated_at?: string;
    synced_at?: string | null;
    socio_economic_profiles: SocioEconomicProfile[];
    socio_economic_categories: SocioEconomicCategory[];
}

export type PaginateStudents = {
    data: Student[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
};

export type StudentFilters = {
    search?: string | null;
    type?: string;
    course?: string;
    campus?: string;
    section?: string;
    year_level?: string;
    gender?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    show?: number;
    date_from?: string | null;
    date_to?: string | null;
};

export const defaultStudentFilters: StudentFilters = {
    search: null,
    type: '',
    course: '',
    campus: '',
    section: '',
    year_level: '',
    gender: '',
    sort: 'id',
    order: 'desc',
    show: 10,
    date_from: null,
    date_to: null,
};
