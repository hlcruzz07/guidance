<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->text('fname')->nullable();
            $table->text('mname')->nullable();
            $table->text('lname')->nullable();
            $table->text('suffix')->nullable();
            $table->text('relationship')->nullable();
            $table->text('birthdate')->nullable();
            $table->text('birthplace')->nullable();
            $table->text('religion')->nullable();
            $table->text('nationality')->nullable();
            $table->text('life_status')->nullable();
            $table->text('cause_of_death')->nullable();
            $table->text('year_of_death')->nullable();
            $table->text('occupation')->nullable();
            $table->text('highest_educ_attainment')->nullable();
            $table->text('phone')->nullable();
            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardians');
    }
};
