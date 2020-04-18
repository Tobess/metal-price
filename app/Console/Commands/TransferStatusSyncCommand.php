<?php

namespace App\Console\Commands;

use App\Jobs\TransferJob;
use Illuminate\Console\Command;

class TransferStatusSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transfer:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '同步转账状态结果！';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $transArr = \DB::table('accounts_withdraw')
            ->whereIn('status', ['pending', 'scheduled'])
            ->select('id', 'status', 'created_at', 'payment_at', 'trans_job')
            ->get();
        $count = 0;
        foreach ($transArr as $withdraw) {
            $job = new TransferJob($withdraw->id);
            if (\DB::table('accounts_withdraw')
                ->where('id', $withdraw->id)
                ->update(['trans_job' => $job->getJobId()])) {
                dispatch($job);
                $count++;
            }
        }
        $this->info("Fount {$count} bills.");
    }
}
