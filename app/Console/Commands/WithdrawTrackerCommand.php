<?php

namespace App\Console\Commands;

use App\Jobs\TransferJob;
use App\Model\RentConfig;
use App\Model\Withdraw;
use Carbon\Carbon;
use Illuminate\Console\Command;

class WithdrawTrackerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'withdraw:tracker';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '查询今日待转账订单并加入提现队列中！';

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
        if (!RentConfig::configRaw('transfer.switch')) {
            $this->info('未开启自动转账！');
        } else {
            // 获得预计到账时间为今日的提现申请
            $now = now();
            $withdraws = \DB::table('accounts_withdraw')
                ->whereNotIn('status', ['paid', 'failed'])
                ->whereNull('trans_job')
                ->whereBetween('payment_at', [$now->startOfDay()->toDateTimeString(), $now->endOfDay()->toDateTimeString()])
                ->select('id', 'status', 'created_at', 'payment_at', 'trans_job')
                ->get();
            $count = 0;
            foreach ($withdraws as $withdraw) {
                if (!$withdraw->trans_job) {
                    $dtStr = strtotime(substr($withdraw->payment_at, 0, 10) . ' ' . substr($withdraw->created_at, 0, -8));
                    $executeAt = $dtStr ? Carbon::createFromTimestamp($dtStr) : Carbon::parse($withdraw->payment_at);
                    $job = new TransferJob($withdraw->id);
                    if (\DB::table('accounts_withdraw')
                        ->where('id', $withdraw->id)
                        ->update(['trans_job' => $job->getJobId()])) {
                        dispatch($job->delay($executeAt));
                        $count++;
                    }
                }
            }
            $this->info("Fount {$count} bills.");
        }
    }
}
