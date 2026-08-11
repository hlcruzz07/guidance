<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\StudentType;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('id_number')->unique();
            $table->string('e_signature')->nullable();
            $table->string('campus');
            $table->string('fname');
            $table->string('mname')->nullable();
            $table->string('lname');
            $table->string('suffix')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->enum('type', [StudentType::FRESHMEN, StudentType::TRANSFEREE, StudentType::SHIFTEE, StudentType::RETURNEE])->default(StudentType::FRESHMEN);
            $table->string('course');
            $table->string('year_level');
            $table->string('section');
            $table->string('gender');
            $table->string('civil_status');
            $table->string('sexual_orientation')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            $table->string('religion');
            $table->date('date_of_birth');
            $table->string('place_of_birth');
            $table->string('nationality')->nullable();
            $table->string('last_school_attended')->nullable();
            $table->string('general_average')->nullable();
            $table->string('strand_course')->nullable();
            $table->string('scholarship')->nullable();
            $table->string('parent_marital_relationship')->nullable();
            $table->string('birth_order')->nullable();
            $table->string('financer')->nullable();
            $table->string('weekly_allowance')->nullable();
            $table->string('household_income')->nullable();
            $table->string('nature_of_residence')->nullable();
            $table->string('home_address');
            $table->string('current_address');
            $table->string('contact_person');
            $table->string('contact_person_address');
            $table->string('contact_person_mobile_um');
            $table->string('contact_person_relationship');
            $table->text('remarks')->nullable();
            $table->timestamp('remarked_at')->nullable();
            $table->unsignedBigInteger('remark_by')->nullable();
            $table->foreign('remark_by')
                ->references('id')
                ->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
