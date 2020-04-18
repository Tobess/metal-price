<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')
        //          ->hourly();

        // 租赁订单跟踪任务每天00:00:01执行
        $schedule
            ->command('order:tracker')
            ->at('00:00:01');

        // 转账任务每天00:01:01执行
        $schedule
            ->command('withdraw:tracker')
            ->at('00:01:01');

        // 已审核过的申诉订单结算赔付任务每天00:02:01执行
        $schedule
            ->command('order:allege')
            ->everyMinute();

        // 转账状态同步任务
        $schedule
            ->command('transfer:sync')
            ->everyFifteenMinutes();

        // 分析共享珠宝运营数据
        $schedule
            ->command('data:analysis')
            ->at('00:00:10');

        // 通知系统分析需要通知的订单
        $schedule
            ->command('notify:tracker')
            ->at('00:00:20');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
