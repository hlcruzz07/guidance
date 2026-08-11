<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

#[Signature('dropdowns:refresh')]
#[Description('Truncate entity_dropdowns table, clear cache, and reseed EntityDropdownSeeder')]
class RefreshEntityDropdowns extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Truncating entity_dropdowns table...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('entity_dropdowns')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->info('Clearing cache...');

        Artisan::call('cache:clear');
        $this->line(Artisan::output());

        $this->info('Running EntityDropdownSeeder...');

        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\EntityDropdownSeeder',
            '--force' => true,
        ]);

        $this->line(Artisan::output());

        $this->info('✅ Entity dropdowns have been refreshed successfully.');

        return self::SUCCESS;
    }
}
