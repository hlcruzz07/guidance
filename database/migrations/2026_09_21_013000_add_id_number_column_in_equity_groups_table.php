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
        Schema::table('equity_groups', function (Blueprint $table) {
            $table->string('id_number')->nullable()->after('proof');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equity_groups', function (Blueprint $table) {
            $table->dropColumn('id_number');
        });
    }
};
