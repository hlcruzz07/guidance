<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ================================================================
            // I. Personal Information
            // Order below mirrors the on-page order in Index.tsx (top -> bottom)
            // so that handleErrors()'s "scroll to first error" behavior lands
            // on the field the student actually sees first.
            // ================================================================

            // Identity fields (feed the disabled "Full name" / "Course & Section"
            // displays at the very top of the form)
            'id_number' => ['required', 'string', 'max:50'],
            'e_signature' => ['required'],
            'campus' => ['required', 'string', 'max:100'],
            'fname' => ['required', 'string', 'max:100'],
            'mname' => ['nullable', 'string', 'max:100'],
            'lname' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'course' => ['required', 'string', 'max:100'],
            'year_level' => ['required', 'string', 'max:10'],
            'section' => ['required', 'string', 'max:50'],

            // Student Type
            'type' => ['required', 'string', 'max:50'],

            // Sexual Orientation
            'sexual_orientation' => ['required', 'string', 'max:50'],

            // Email
            'email' => ['required', 'email', 'max:150'],

            // Mobile Number
            'phone' => ['required', 'digits:10', 'starts_with:9'],

            // Height / Weight
            'height' => ['nullable', 'numeric', 'max:999'],
            'weight' => ['nullable', 'numeric', 'max:999'],

            // Nationality
            'nationality' => ['required', 'string', 'max:100'],

            // Not directly rendered as its own visible input, but sits in this
            // section of the payload (gender/civil status/birth info)
            'gender' => ['required', 'string', 'max:10'],
            'civil_status' => ['required', 'string', 'max:50'],
            'date_of_birth' => ['required', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:30'],

            // Home Address (disabled display) / Current Address
            'home_address' => ['required', 'string', 'max:150'],
            'current_address' => ['required', 'string', 'max:150'],

            // Last School Attended
            'last_school_attended' => ['nullable', 'string', 'max:150'],

            // General Average / Strand-Course
            'general_average' => [
                'nullable',
                'regex:/^\d{2}(\/\d{2})+$/',
            ],
            'strand_course' => ['nullable', 'string', 'max:20'],

            // Religion
            'religion' => ['required', 'string', 'max:30'],

            // Scholarship — required only when the "Do you have an existing
            // scholarship?" checkbox is checked.
            //
            // NOTE: we can't infer "checked" from `scholarship` being an empty
            // string vs null, because Laravel's global
            // ConvertEmptyStringsToNull middleware turns '' into null *before*
            // this FormRequest ever runs — so a checked-but-empty submission
            // and an unchecked submission are indistinguishable by value alone.
            // The frontend now sends an explicit `has_scholarship` boolean
            // alongside it, which required_if checks instead.
            'has_scholarship' => ['nullable', 'boolean'],
            'scholarship' => [
                'nullable',
                'string',
                'max:100',
                'required_if:has_scholarship,true',
            ],

            // ---- In Case of Emergency Information ----
            'contact_person' => ['required', 'string', 'max:100'],
            'contact_person_address' => ['required', 'string', 'max:100'],
            'contact_person_mobile_um' => ['required', 'string', 'max:10'],
            'contact_person_relationship' => ['required', 'string', 'max:50'],

            // ---- II. Educational Background ----
            // school_name / honor_received capped: this table is table-auto
            // with narrow columns in the print layout, so long values here
            // push column widths around and can break row alignment.
            'educations' => ['nullable', 'array'],
            'educations.*.education_level' => [
                'required',
                'string',
                'in:College,Vocational,Senior High School,Junior High School,Elementary',
            ],
            'educations.*.school_name' => ['required', 'string', 'max:80'],
            'educations.*.year_covered' => [
                'nullable',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'educations.*.school_type' => ['required', 'string', 'in:Public,Private'],
            'educations.*.honor_received' => ['nullable', 'string', 'max:80'],

            // ---- III. Home & Family Background ----
            // Guardian fields feed the Father/Mother print table, which uses
            // `text-nowrap!` — long values there overflow the page width
            // instead of wrapping, so these are capped tighter than the
            // student's own equivalent fields.
            'guardians' => ['nullable', 'array'],
            'guardians.*.fname' => ['nullable', 'string', 'max:50'],
            'guardians.*.mname' => ['nullable', 'string', 'max:50'],
            'guardians.*.lname' => ['nullable', 'string', 'max:50'],
            'guardians.*.suffix' => ['nullable', 'string', 'max:10'],
            'guardians.*.relationship' => ['nullable', 'string', 'max:50'],
            'guardians.*.birthdate' => ['nullable', 'date'],
            'guardians.*.birthplace' => ['nullable', 'string', 'max:25'],
            'guardians.*.religion' => ['nullable', 'string', 'max:40'],
            'guardians.*.nationality' => ['nullable', 'string', 'max:40'],
            'guardians.*.highest_educ_attainment' => ['nullable', 'string', 'max:30'],
            'guardians.*.life_status' => ['nullable', 'string', 'in:Living,Deceased'],
            'guardians.*.cause_of_death' => ['nullable', 'string', 'max:30'],
            'guardians.*.year_of_death' => ['nullable', 'digits:4'],
            'guardians.*.occupation' => ['nullable', 'string', 'max:30'],
            'guardians.*.phone' => ['nullable', 'digits:10', 'starts_with:9'],

            'parent_marital_relationship' => ['required', 'string', 'max:100'],
            'birth_order' => ['required', 'string', 'max:50'],
            'financer' => ['required', 'string', 'max:100'],
            'weekly_allowance' => ['required', 'numeric'],
            'household_income' => ['required', 'string', 'max:100'],
            'nature_of_residence' => ['required', 'string', 'max:100'],

            // ---- Siblings ----
            // fname/lname now carry asterisks in the UI; suffix was removed from SiblingEntry.
            // Capped: the siblings print table has a narrow "Name" column
            // that combines fname + mname + lname into a single cell.
            'siblings' => ['nullable', 'array'],
            'siblings.*.fname' => ['required', 'string', 'max:50'],
            'siblings.*.mname' => ['nullable', 'string', 'max:50'],
            'siblings.*.lname' => ['required', 'string', 'max:50'],
            'siblings.*.birthdate' => ['required', 'date'],
            'siblings.*.gender' => ['required', 'string', 'in:Male,Female'],
            'siblings.*.is_employed' => ['nullable', 'boolean'],

            // ---- IV. Equity Target Group Affiliation ----
            // Proof is now required whenever a group entry exists.
            'equity_groups' => ['nullable', 'array'],
            'equity_groups.*.equity_group' => ['required', 'string', 'max:150'],
            'equity_groups.*.proof' => [
                'required',
                'file',
                'max:5120',
                function ($attribute, $value, $fail) {
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) {
                        $fail('The proof file must be a JPG, JPEG, or PNG.');
                        return;
                    }

                    $imageInfo = @getimagesize($value->getRealPath());
                    if ($imageInfo === false) {
                        $fail('The proof file must be a valid image.');
                        return;
                    }

                    $allowedMimes = ['image/jpeg', 'image/png'];
                    if (!in_array($imageInfo['mime'], $allowedMimes, true)) {
                        $fail('The proof file must be a JPG, JPEG, or PNG.');
                    }
                },
            ],

            // ---- V. Psychological Test Records ----
            // Capped to fit the table-fixed layout's hard column widths
            // (RESULT 20%, INTERPRETATION 40%) — without a limit, a long
            // answer here would make a single row absurdly tall on print.
            'psych_tests' => ['nullable', 'array'],
            'psych_tests.*.date_taken' => ['required', 'date'],
            'psych_tests.*.test_name' => ['required', 'string', 'max:60'],
            'psych_tests.*.test_result' => ['required', 'string', 'max:100'],
            'psych_tests.*.interpretation' => ['required', 'string', 'max:150'],
            'concerns' => ['required', 'array'],
            'concerns.*.question' => ['required', 'string'],
            'concerns.*.answer' => [
                'required',
                'string',
                'regex:/^(Yes|No)(,\s?.+)?$/',
            ],

        ];
    }

    public function messages(): array
    {
        return [
            // ================================================================
            // I. Personal Information
            // ================================================================
            'id_number.required' => 'Student ID number is missing.',
            'id_number.string' => 'Student ID number must be valid text.',
            'id_number.max' => 'Student ID number must not exceed 50 characters.',

            'e_signature.required' => 'Please provide your e-signature before submitting.',

            'campus.required' => 'Campus information is missing.',
            'campus.string' => 'Campus information must be valid text.',
            'campus.max' => 'Campus information must not exceed 100 characters.',

            'fname.required' => 'Please enter your first name.',
            'fname.string' => 'First name must be valid text.',
            'fname.max' => 'First name must not exceed 100 characters.',

            'mname.string' => 'Middle name must be valid text.',
            'mname.max' => 'Middle name must not exceed 100 characters.',

            'lname.required' => 'Please enter your last name.',
            'lname.string' => 'Last name must be valid text.',
            'lname.max' => 'Last name must not exceed 100 characters.',

            'suffix.string' => 'Suffix must be valid text.',
            'suffix.max' => 'Suffix must not exceed 10 characters.',

            'course.required' => 'Course information is missing.',
            'course.string' => 'Course information must be valid text.',
            'course.max' => 'Course information must not exceed 100 characters.',

            'year_level.required' => 'Year level information is missing.',
            'year_level.string' => 'Year level must be valid text.',
            'year_level.max' => 'Year level must not exceed 10 characters.',

            'section.required' => 'Section information is missing.',
            'section.string' => 'Section must be valid text.',
            'section.max' => 'Section must not exceed 50 characters.',

            'type.required' => 'Please select your student type.',
            'type.string' => 'Student type must be valid text.',
            'type.max' => 'Student type must not exceed 50 characters.',

            'sexual_orientation.required' => 'Please select your sexual orientation.',
            'sexual_orientation.string' => 'Sexual orientation must be valid text.',
            'sexual_orientation.max' => 'Sexual orientation must not exceed 50 characters.',

            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address must not exceed 150 characters.',

            'phone.starts_with' => 'Mobile number must start 9.',
            'phone.required' => 'Please enter your mobile number.',
            'phone.digits' => 'Please enter a valid 10-digit mobile number.',

            'height.numeric' => 'Height must be a number.',
            'height.max' => 'Height must not exceed 999.',

            'weight.numeric' => 'Weight must be a number.',
            'weight.max' => 'Weight must not exceed 999.',

            'nationality.required' => 'Please select your nationality.',
            'nationality.string' => 'Nationality must be valid text.',
            'nationality.max' => 'Nationality must not exceed 100 characters.',

            'gender.required' => 'Please select your gender.',
            'gender.string' => 'Gender must be valid text.',
            'gender.max' => 'Gender must not exceed 10 characters.',

            'civil_status.required' => 'Please select your civil status.',
            'civil_status.string' => 'Civil status must be valid text.',
            'civil_status.max' => 'Civil status must not exceed 50 characters.',

            'date_of_birth.required' => 'Please enter your date of birth.',
            'date_of_birth.date' => 'Please enter a valid date of birth.',

            'place_of_birth.required' => 'Please enter your place of birth.',
            'place_of_birth.string' => 'Place of birth must be valid text.',
            'place_of_birth.max' => 'Place of birth must not exceed 150 characters.',

            'home_address.required' => 'Home address information is missing.',
            'home_address.string' => 'Home address must be valid text.',
            'home_address.max' => 'Home address must not exceed 150 characters.',

            'current_address.required' => 'Please enter your current address.',
            'current_address.string' => 'Current address must be valid text.',
            'current_address.max' => 'Current address must not exceed 150 characters.',

            'last_school_attended.string' => 'Last school attended must be valid text.',
            'last_school_attended.max' => 'Last school attended must not exceed 150 characters.',

            'general_average.regex' => 'The general average must be in the format 90/99/89.',

            'strand_course.string' => 'Strand / course must be valid text.',
            'strand_course.max' => 'Strand / course must not exceed 20 characters.',

            'religion.required' => 'Please select your religion.',
            'religion.string' => 'Religion must be valid text.',
            'religion.max' => 'Religion must not exceed 30 characters.',

            'has_scholarship.boolean' => 'Scholarship status is invalid.',

            'scholarship.string' => 'Scholarship must be valid text.',
            'scholarship.max' => 'Scholarship must not exceed 100 characters.',
            'scholarship.required_if' => 'Please specify your scholarship.',

            // ================================================================
            // In Case of Emergency Information
            // ================================================================
            'contact_person.required' => 'Please enter the contact person\'s name.',
            'contact_person.string' => 'Contact person name must be valid text.',
            'contact_person.max' => 'Contact person name must not exceed 100 characters.',

            'contact_person_address.required' => 'Please enter the contact person\'s address.',
            'contact_person_address.string' => 'Contact person address must be valid text.',
            'contact_person_address.max' => 'Contact person address must not exceed 100 characters.',

            'contact_person_mobile_um.required' => 'Please enter the contact person\'s mobile number.',
            'contact_person_mobile_um.string' => 'Contact person mobile number must be valid text.',
            'contact_person_mobile_um.max' => 'Contact person mobile number must not exceed 10 characters.',

            'contact_person_relationship.required' => 'Please select the contact person\'s relationship to you.',
            'contact_person_relationship.string' => 'Contact person relationship must be valid text.',
            'contact_person_relationship.max' => 'Contact person relationship must not exceed 50 characters.',

            // ================================================================
            // II. Educational Background
            // ================================================================
            'educations.array' => 'Educational background information is invalid.',

            'educations.*.education_level.required' => 'Please select an education level.',
            'educations.*.education_level.string' => 'Education level must be valid text.',
            'educations.*.education_level.in' => 'Please select a valid education level.',

            'educations.*.school_name.required' => 'Please enter the school name.',
            'educations.*.school_name.string' => 'School name must be valid text.',
            'educations.*.school_name.max' => 'School name must not exceed 80 characters.',

            'educations.*.year_covered.regex' => 'Year covered must be YYYY-YYYY.',

            'educations.*.school_type.required' => 'Please select whether the school is public or private.',
            'educations.*.school_type.string' => 'School type must be valid text.',
            'educations.*.school_type.in' => 'Please select either Public or Private.',

            'educations.*.honor_received.string' => 'Honor received must be valid text.',
            'educations.*.honor_received.max' => 'Honor received must not exceed 80 characters.',

            // ================================================================
            // III. Home & Family Background
            // ================================================================
            'guardians.array' => 'Home & family background information is invalid.',

            'guardians.*.fname.string' => 'Guardian\'s first name must be valid text.',
            'guardians.*.fname.max' => 'Guardian\'s first name must not exceed 50 characters.',

            'guardians.*.mname.string' => 'Guardian\'s middle name must be valid text.',
            'guardians.*.mname.max' => 'Guardian\'s middle name must not exceed 50 characters.',

            'guardians.*.lname.string' => 'Guardian\'s last name must be valid text.',
            'guardians.*.lname.max' => 'Guardian\'s last name must not exceed 50 characters.',

            'guardians.*.suffix.string' => 'Guardian\'s suffix must be valid text.',
            'guardians.*.suffix.max' => 'Guardian\'s suffix must not exceed 10 characters.',

            'guardians.*.relationship.string' => 'Guardian\'s relationship must be valid text.',
            'guardians.*.relationship.max' => 'Guardian\'s relationship must not exceed 50 characters.',

            'guardians.*.birthdate.date' => 'Please enter a valid birthdate for the guardian.',

            'guardians.*.birthplace.string' => 'Guardian\'s birthplace must be valid text.',
            'guardians.*.birthplace.max' => 'Guardian\'s birthplace must not exceed 25 characters.',

            'guardians.*.religion.string' => 'Guardian\'s religion must be valid text.',
            'guardians.*.religion.max' => 'Guardian\'s religion must not exceed 40 characters.',

            'guardians.*.nationality.string' => 'Guardian\'s nationality must be valid text.',
            'guardians.*.nationality.max' => 'Guardian\'s nationality must not exceed 40 characters.',

            'guardians.*.highest_educ_attainment.string' => 'Guardian\'s highest educational attainment must be valid text.',
            'guardians.*.highest_educ_attainment.max' => 'Guardian\'s highest educational attainment must not exceed 30 characters.',

            'guardians.*.life_status.string' => 'Guardian\'s life status must be valid text.',
            'guardians.*.life_status.in' => 'Please select either Living or Deceased.',

            'guardians.*.cause_of_death.string' => 'Cause of death must be valid text.',
            'guardians.*.cause_of_death.max' => 'Cause of death must not exceed 30 characters.',

            'guardians.*.year_of_death.digits' => 'Please enter a valid 4-digit year of death.',

            'guardians.*.occupation.string' => 'Guardian\'s occupation must be valid text.',
            'guardians.*.occupation.max' => 'Guardian\'s occupation must not exceed 30 characters.',

            'guardians.*.phone.starts_with' => 'Mobile number must start 9.',
            'guardians.*.phone.digits' => 'Please enter a valid 10-digit phone number for the guardian.',

            'parent_marital_relationship.required' => 'Please select your parents\' marital relationship.',
            'parent_marital_relationship.string' => 'Parent marital relationship must be valid text.',
            'parent_marital_relationship.max' => 'Parent marital relationship must not exceed 100 characters.',

            'birth_order.required' => 'Please enter your birth order.',
            'birth_order.string' => 'Birth order must be valid text.',
            'birth_order.max' => 'Birth order must not exceed 50 characters.',

            'financer.required' => 'Please select who finances your education.',
            'financer.string' => 'Financer must be valid text.',
            'financer.max' => 'Financer must not exceed 100 characters.',

            'weekly_allowance.required' => 'Please enter your weekly allowance.',
            'weekly_allowance.numeric' => 'Weekly allowance must be a number.',

            'household_income.required' => 'Please select your household monthly income.',
            'household_income.string' => 'Household income must be valid text.',
            'household_income.max' => 'Household income must not exceed 100 characters.',

            'nature_of_residence.required' => 'Please select your nature of residence.',
            'nature_of_residence.string' => 'Nature of residence must be valid text.',
            'nature_of_residence.max' => 'Nature of residence must not exceed 100 characters.',

            // ================================================================
            // Siblings
            // ================================================================
            'siblings.array' => 'Siblings information is invalid.',

            'siblings.*.fname.required' => 'Please enter the sibling\'s first name.',
            'siblings.*.fname.string' => 'Sibling\'s first name must be valid text.',
            'siblings.*.fname.max' => 'Sibling\'s first name must not exceed 50 characters.',

            'siblings.*.mname.string' => 'Sibling\'s middle name must be valid text.',
            'siblings.*.mname.max' => 'Sibling\'s middle name must not exceed 50 characters.',

            'siblings.*.lname.required' => 'Please enter the sibling\'s last name.',
            'siblings.*.lname.string' => 'Sibling\'s last name must be valid text.',
            'siblings.*.lname.max' => 'Sibling\'s last name must not exceed 50 characters.',

            'siblings.*.birthdate.required' => 'Sibling\'s birthdate is required.',
            'siblings.*.birthdate.date' => 'Please enter a valid birthdate for the sibling.',

            'siblings.*.gender.required' => 'Please select the sibling\'s gender.',
            'siblings.*.gender.string' => 'Sibling\'s gender must be valid text.',
            'siblings.*.gender.in' => 'Please select either Male or Female.',

            'siblings.*.is_employed.boolean' => 'Sibling\'s employment status is invalid.',

            // ================================================================
            // IV. Equity Target Group Affiliation
            // ================================================================
            'equity_groups.array' => 'Equity group information is invalid.',

            'equity_groups.*.equity_group.required' => 'Equity group information is missing for one of your selected entries.',
            'equity_groups.*.equity_group.string' => 'Equity group must be valid text.',
            'equity_groups.*.equity_group.max' => 'Equity group must not exceed 150 characters.',

            'equity_groups.*.proof.required' => 'Please upload a supporting document or proof for the equity group(s) you selected.',
            'equity_groups.*.proof.file' => 'The uploaded proof must be a valid file.',
            'equity_groups.*.proof.mimes' => 'The proof file must be a JPG,JPEG, or PNG.',
            'equity_groups.*.proof.max' => 'The proof file must not be larger than 5MB.',

            // ================================================================
            // V. Psychological Test Records
            // ================================================================
            'psych_tests.array' => 'Psychological test records are invalid.',

            'psych_tests.*.date_taken.required' => 'Please enter the date the test was taken.',
            'psych_tests.*.date_taken.date' => 'Please enter a valid date.',

            'psych_tests.*.test_name.required' => 'Please enter the name of the test.',
            'psych_tests.*.test_name.string' => 'Test name must be valid text.',
            'psych_tests.*.test_name.max' => 'Test name must not exceed 60 characters.',

            'psych_tests.*.test_result.required' => 'Please enter the test result.',
            'psych_tests.*.test_result.string' => 'Test result must be valid text.',
            'psych_tests.*.test_result.max' => 'Test result must not exceed 100 characters.',

            'psych_tests.*.interpretation.required' => 'Please enter the interpretation of the test result.',
            'psych_tests.*.interpretation.string' => 'Interpretation must be valid text.',
            'psych_tests.*.interpretation.max' => 'Interpretation must not exceed 150 characters.',

            // ================================================================
            // VI. Concerns
            // ================================================================
            'concerns.required' => 'Please answer all the concerns questions.',
            'concerns.array' => 'Concerns information is invalid.',

            'concerns.*.question.required' => 'A concern question is missing.',
            'concerns.*.question.string' => 'Concern question must be valid text.',

            'concerns.*.answer.required' => 'Please answer this question.',
            'concerns.*.answer.string' => 'Answer must be valid text.',
            'concerns.*.answer.regex' => 'Please answer Yes or No, and provide the additional details if applicable.',
        ];
    }

    public function attributes(): array
    {
        return [
            'id_number' => 'student ID number',
            'sexual_orientation' => 'sexual orientation',
            'contact_person' => 'contact person name',
            'contact_person_address' => 'contact person address',
            'contact_person_mobile_um' => 'contact person mobile number',
            'contact_person_relationship' => 'contact person relationship',
            'current_address' => 'current address',
            'scholarship' => 'scholarship',
            'year_level' => 'year level',
        ];
    }
}
