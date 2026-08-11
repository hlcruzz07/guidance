<?php

namespace Database\Seeders;

use App\Models\EntityDropdown;
use Illuminate\Database\Seeder;

class EntityDropdownSeeder extends Seeder
{
    public function run(): void
    {
        $dropdowns = [

            'Student Type' => [
                'Freshmen',
                'Shiftee',
                'Transferee',
                'Returnee',
            ],

            'Equity Groups' => [
                'Person With Disability (PWD)',
                'Indigenous People (IP)',
                '4Ps Beneficiary',
                'Solo Parent Student',
                'Child of a Solo Parent (Living with Mother or Father)',
                'Orphan',
                'First Generation (first in the family to go to college)',
                'Child of rebel returnee',
                'Child from families of subsistence farmers or fisherfolks',
                'Residing in geographically isolated and disadvantaged areas (GIDA)',
                'Family Income is below 10,000 per month',
            ],

            'Suffix' => [
                'Jr',
                'Sr',
                'II',
                'III',
                'IV',
                'V',
                'None',
            ],

            'Financer' => [
                'Parents',
                'Spouse',
                'Sibling(s)',
                'Relative',
                'Others',
            ],

            'Sexual Orientation' => [
                'Heterosexual/Straight',
                'Lesbian',
                'Gay',
                'Bisexual',
                'Transgender',
                'Rather not say',
                'Others',
            ],

            'Household Monthly Income' => [
                [
                    'monthly' => 'Less than Php 13,873 - 36,400',
                    'annual' => 'Php 166,476 - 436,800',
                ],
                [
                    'monthly' => 'Php 36,401 - 63,700',
                    'annual' => 'Php 436,812 - 764,400',
                ],
                [
                    'monthly' => 'Php 63,701 - 109,200',
                    'annual' => 'Php 764,412 - 1,310,400',
                ],
                [
                    'monthly' => 'Php 109,201 - 182,000',
                    'annual' => 'Php 1,310,412 - 2,184,000',
                ],
                [
                    'monthly' => 'Above Php 182,001',
                    'annual' => 'Above Php 2,184,012',
                ],
            ],

            'Parents Marital Status' => [
                'Married And Living Together',
                'Single Parent',
                'Annulled',
                'Married But Separated',
                'Not Married But Living Together',
                'Others',
            ],

            'Nature Of Residence' => [
                'Family Home',
                'Rented Apartment',
                'Boarding House',
                'Dorm',
                "Relative's House",
                'Rented Room',
                'House of Married Sibling',
                'Others',
            ],

            'Concerns' => [
                [
                    'question' => 'If you experience personal, academic, or other concerns, would you be willing to discuss them with your Guidance Counselor?',
                    'answer_type' => 'boolean',

                ],
                [
                    'question' => 'Are you currently experiencing any personal, academic, family, financial, health, or other concern(s) that you would like the Guidance Office to know about?',
                    'answer_type' => 'boolean',
                ],
                [
                    'question' => 'Have you consulted a Medical Doctor/Psychologist/Psychiatrist? If yes, what specific concerns did you consult them for?',
                    'answer_type' => 'boolean',
                    'sub_question' => [
                        [
                            'question' => 'If yes, what specific concerns did you consult for them for?',
                            'answer_type' => 'text',
                        ],
                    ],
                ],
            ],

            'Religion' => [
                'Roman Catholic',
                'Baptist',
                'Methodist',
                'Pentecostal',
                'Evangelical',
                'Seventh-day Adventist',
                'Lutheran',
                'Presbyterian',
                'UCCP',
                'Iglesia Ni Cristo',
                'Sunni Islam',
                'Shia Islam',
                'Aglipayan Church',
                "Jehovah's Witnesses",
                'Mormons',
                'Judaism',
                'Mahayana Buddhism',
                'Theravada Buddhism',
                'Vaishnavism (Hinduism)',
                'Shaivism (Hinduism)',
                'Lumad Spirituality',
                'Anito / Ancestor Worship',
                'Shamanistic Practices',
                'Agnostic',
                'Atheist',
                'Humanist',
                'Secular',
            ],

            'Contact Person Relationships' => [
                'Father',
                'Mother',
                'Parent',
                'Legal Guardian',
                'Spouse',
                'Sibling',
                'Grandparent',
                'Aunt',
                'Uncle',
                'Relative',
                'Friend',

            ],
            'Highest Educational Attainment' => [
                'No Formal Education',
                'Elementary Graduate',
                'High School Graduate',
                'Vocational',
                'College Level',
                'College Graduate',
                'Post Graduate',
            ],
        ];

        foreach ($dropdowns as $name => $values) {
            EntityDropdown::create([
                'name' => $name,
                'dropdowns' => $values,
            ]);
        }
    }
}
