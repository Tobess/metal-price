<?php

namespace App\Console\Commands;

use App\Helper\Msg;
use App\Jobs\StartPromoteNotifyJob;
use App\Model\RentPolicy;
use Carbon\Carbon;
use Illuminate\Console\Command;

class NotifyTackerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notify:tracker';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '通知系统';

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
        try {
            // B1 Msg::T_RENT_EXPIRE 共享中单据到期前一天
            $b1Orders = \DB::table('orders')
                ->where('status', 0)
                ->where('expired_at', Carbon::tomorrow()->endOfDay())
                ->whereNull('backed_at')
                ->select('id', 'customer_id')
                ->get();
            foreach ($b1Orders as $order) {
                Msg::create()
                    ->business(Msg::T_RENT_EXPIRE)
                    ->to($order->customer_id)
                    ->sendTime(Carbon::create(null, null, null, 9))
                    ->data(['order_id' => $order->id])
                    ->sms();
            }
            $this->info('Found ' . count($b1Orders) . 'B1');

            // B2 Msg::T_RENT_OVERDUE 订单逾期
            $b2Orders = \DB::table('orders')
                ->where('status', '<>', 1)
                ->where('expired_at', '<', now())
                ->whereNull('backed_at')
                ->select('id', 'customer_id', 'expired_at')
                ->get();
            foreach ($b2Orders as $order) {
                // 逾期到达上限的订单自动结束订单并结算
                $expiredTime = Carbon::parse($order->expired_at);
                // 获得已逾期的天数
                $overdueDays = ceil($expiredTime->diffInHours(now()->endOfDay()) / 24);

                $items = \DB::table('orders_items')
                    ->where('order_id', $order->id)
                    ->select('cid', 'sid', 'rent', 'data_raw')
                    ->get();
                $sumOverdue = 0;
                foreach ($items as $item) {
                    $title = $item->data_raw->title ?? '';
                    // 根据品类、地域、等级获得逾期违约金比率
                    $overdueRentDayRatio = RentPolicy::overdueRentRatio($item->cid, $item->sid, $title);
                    $overdueAmount = $item->rent * $overdueRentDayRatio * $overdueDays;
                    $sumOverdue += $overdueAmount;
                }
                Msg::create()
                    ->business(Msg::T_RENT_OVERDUE, $overdueDays > 1 ? ($overdueDays . '天') : '', $sumOverdue)
                    ->to($order->customer_id)
                    ->sendTime(Carbon::create(null, null, null, 9))
                    ->data(['order_id' => $order->id])
                    ->sms();
            }
            $this->info('Found ' . count($b2Orders) . 'B2');

            // 推广消息到结束时间自动结束
            $count = \DB::table('rent_notify_promote')
                ->whereNotNull('expired_at')
                ->where('expired_at', '<=', now()->toDateTimeString())
                ->update(['status' => 4]);
            $this->info('Fount ' . $count . ' promote notify and change status to expired.');

            // 分析当日要发送且创建于今天前的推广消息
            $notifyArr = \DB::table('rent_notify_promote')
                ->where('type', [0, 1])
                ->where('status', 0)
                ->where('created_at', '<=', now()->startOfDay()->toDateTimeString())
                ->whereBetween('send_at', [now()->startOfDay()->toDateTimeString(), now()->endOfDay()->toDateTimeString()])
                ->select('id', 'send_at')
                ->get();
            foreach ($notifyArr as $notify) {
                dispatch((new StartPromoteNotifyJob($notify->id))->delay(Carbon::parse($notify->send_at)));
            }
            $this->info('Fount ' . count($notifyArr) . ' promote notify waiting to send.');
        } catch (\Exception $ex) {
            $this->info($ex->getMessage());
        }
    }
}
