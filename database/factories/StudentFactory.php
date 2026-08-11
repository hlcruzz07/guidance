<?php

namespace Database\Factories;

use App\Enums\StudentType;
use App\Models\Education;
use App\Models\Guardian;
use App\Models\Sibling;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    public function definition(): array
    {
        $yearLevel = $this->faker->numberBetween(1, 4);
        $campuses = ['Talisay', 'Alijis', 'Binalbagan', 'Fortune Towne'];
        $courses = ['BSIT', 'BSCS', 'BSED', 'BSBA', 'BSN', 'BSEE', 'BSCE', 'BSME', 'BSPSYCH', 'BSOA'];
        $strands = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL'];
        $religions = ['Roman Catholic', 'Baptist', 'Methodist', 'Pentecostal', 'Evangelical', 'Seventh-day Adventist', 'Lutheran', 'Presbyterian', 'United Church Of Christ In the Philippines (UCCP)', 'Iglesia Ni Cristo', 'Sunni Islam', 'Shia Islam', 'Aglipayan Church (Philippine Independent Church)', "Jehovah's Witnesses", 'Church Of Jesus Christ Of Latter-day Saints (Mormons)', 'Judaism', 'Mahayana Buddhism', 'Theravada Buddhism', 'Vaishnavism (Hinduism)', 'Shaivism (Hinduism)', 'Lumad Spirituality', 'Cordillera Indigenous Religions', 'Anito / Ancestor Worship', 'Shamanistic Practices', 'Agnostic', 'Atheist', 'Humanist', 'Secular'];
        $genders = ['Male', 'Female'];
        $civilStatuses = ['Single', 'Married', 'Widowed', 'Separated'];
        $orientations = ['Heterosexual/Straight', 'Lesbian', 'Gay', 'Bisexual', 'Transgender', 'Rather not say', 'Others'];
        $residences = ['Family Home', 'Rented Apartment', 'Boarding House', 'Dorm', "Relative's House", 'Rented Room', 'House of Married Sibling', 'Others'];
        $financers = ['Parents', 'Spouse', 'Sibling(s)', 'Relative', 'Others'];
        $allowances = ['Below 500', '500-999', '1000-1999', '2000-2999', '3000 and above'];
        $incomes = ['Less than Php 13,873 - 36,400', 'Php 36,401 - 63,700', 'Php 63,701 - 109,200', 'Php 109,201 - 182,000', 'Above Php 182,001'];
        $maritalStatuses = ['Married And Living Together', 'Single Parent', 'Annulled', 'Married But Separated', 'Not Married But Living Together', 'Others'];
        $relationships = ['Father', 'Mother', 'Parent', 'Legal Guardian', 'Spouse', 'Sibling', 'Grandparent', 'Aunt', 'Uncle', 'Relative', 'Friend'];
        $types = [StudentType::FRESHMEN, StudentType::TRANSFEREE, StudentType::SHIFTEE, StudentType::RETURNEE];
        $remarkBy = $this->faker->optional()->numberBetween(User::min('id'), User::max('id'));

        return [
            'id_number' => $this->faker->unique()->numerify('20##-#####'),
            'e_signature' => $this->faker->uuid(),
            'campus' => $this->faker->randomElement($campuses),
            'fname' => $this->faker->firstName(),
            'mname' => $this->faker->optional(0.8)->lastName(),
            'lname' => $this->faker->lastName(),
            'suffix' => $this->faker->optional(0.05)->randomElement(['Jr', 'Sr', 'II', 'III', 'IV', 'V']),
            'email' => $this->faker->unique()->regexify('[a-z0-9]{10,14}').'@'.$this->faker->safeEmailDomain(),
            'phone' => '9'.$this->faker->numerify('#########'),
            'type' => $this->faker->randomElement($types),
            'course' => $this->faker->randomElement($courses),
            'year_level' => (string) $yearLevel,
            'section' => $this->faker->randomElement(['A', 'B', 'C', 'D']),
            'gender' => $this->faker->randomElement($genders),
            'civil_status' => $this->faker->randomElement($civilStatuses),
            'sexual_orientation' => $this->faker->optional(0.7)->randomElement($orientations),
            'height' => (string) $this->faker->randomFloat(2, 1.40, 1.90),
            'weight' => (string) $this->faker->randomFloat(2, 40, 100),
            'religion' => $this->faker->randomElement($religions),
            'date_of_birth' => $this->faker->dateTimeBetween('-30 years', '-16 years')->format('Y-m-d'),
            'place_of_birth' => $this->faker->city().', '.$this->faker->country(),
            'nationality' => $this->faker->optional(0.9)->randomElement(['Filipino', 'American', 'Japanese', 'Korean', 'Chinese']),
            'last_school_attended' => $this->faker->optional(0.9)->company().' '.$this->faker->randomElement(['High School', 'College', 'Academy']),
            'general_average' => $this->faker->optional(0.8)->randomFloat(2, 75, 99),
            'strand_course' => $this->faker->optional(0.7)->randomElement($strands),
            'scholarship' => $this->faker->optional(0.3)->randomElement(['CHED', 'DOST', 'Local Government', 'Institutional', 'Private']),
            'parent_marital_relationship' => $this->faker->optional(0.9)->randomElement($maritalStatuses),
            'birth_order' => $this->faker->optional(0.9)->numerify('#'),
            'financer' => $this->faker->optional(0.9)->randomElement($financers),
            'weekly_allowance' => $this->faker->optional(0.9)->randomElement($allowances),
            'household_income' => $this->faker->optional(0.9)->randomElement($incomes),
            'nature_of_residence' => $this->faker->optional(0.9)->randomElement($residences),
            'home_address' => $this->faker->address(),
            'current_address' => $this->faker->address(),
            'contact_person' => $this->faker->name(),
            'contact_person_address' => $this->faker->address(),
            'contact_person_mobile_um' => '09'.$this->faker->numerify('#########'),
            'contact_person_relationship' => $this->faker->randomElement($relationships),
            'remark_by' => $remarkBy,
            'remarks' => $remarkBy
                ? $this->faker->text(250)
                : null,
            'remarked_at' => $remarkBy
                ? $this->faker->dateTimeBetween('-1 year', 'now')
                : null,
            'created_at' => $createdAt = $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween($createdAt, 'now'),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Student $student) {
            Guardian::factory()->father()->create(['student_id' => $student->id]);
            Guardian::factory()->mother()->create(['student_id' => $student->id]);

            foreach (['Elementary', 'Junior High School', 'Senior High School'] as $level) {
                Education::factory()->level($level)->create(['student_id' => $student->id]);
            }

            Sibling::factory()
                ->count($this->faker->numberBetween(0, 3))
                ->create(['student_id' => $student->id]);
        });
    }
}
