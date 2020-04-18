<?php

namespace App\Console\Commands;

use App\Jobs\AccountSettleJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class TransactionTrackerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trans:tracker';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '账务跟踪并结算。';

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
        // 获得结算时间为两分钟前的未结算订单。
        $tArr = \DB::table('accounts_transactions')
            ->where('settle', false)
            ->where('settle_time', '<=', Carbon::now()->subMinutes(2))
            ->pluck('trans_id');
        foreach ($tArr as $id) {
            dispatch((new AccountSettleJob($id)));
        }
        $this->info('搜索到了' . count($tArr) . '条未结算账务' . count($tArr) . '条已经成功加入结算队列中。');
    }
}
