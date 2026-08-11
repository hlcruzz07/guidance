<?php

namespace Database\Factories;

use App\Models\EntityDropdown;
use App\Models\EquityGroup;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquityGroup>
 */
class EquityGroupFactory extends Factory
{
    public function definition(): array
    {
        $groups = EntityDropdown::query()
            ->where('name', 'Equity Groups')
            ->value('dropdowns') ?? [];

        return [
            'student_id' => Student::factory(),
            'equity_group' => $this->faker->randomElement($groups),
            // Simulates a stored file path, similar to what your upload flow saves.
            'proof' => $this->faker->imageUrl(640, 480, 'people', true),
        ];
    }

    public function soloParentChild(string $livingWith = 'Mother'): static
    {
        return $this->state(fn () => [
            'equity_group' => "Child of a Solo Parent (Living with Mother or Father) - {$livingWith}",
        ]);
    }
}
