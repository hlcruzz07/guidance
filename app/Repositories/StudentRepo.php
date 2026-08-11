<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Support\Arr;

class StudentRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected Student $model)
    {
        //
    }

    public function find(int $id): Student
    {
        return $this->model->findOrFail($id);
    }

    public function updateOrCreate(array $data): Student
    {
        $studentData = Arr::only($data, $this->model->getFillable());

        return $this->model->updateOrCreate(
            ['id_number' => $studentData['id_number']],
            $studentData
        );
    }

    public function setRemarks(int $id, string $remarks): Student
    {
        $student = $this->model->findOrFail($id);

        $student->update([
            'remarks' => $remarks,
            'remarked_at' => now(),
            'remark_by' => auth()->id(),
        ]);

        return $student;
    }
}
