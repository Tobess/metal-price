<?php

namespace App\Console\Commands;

use App\Jobs\OrderCompleteSettleJob;
use App\Jobs\OrderSettleJob;
use App\Model\LevelRule;
use App\Model\RentConfig;
use Carbon\Carbon;
use Illuminate\Console\Command;

class OrderTrackerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'order:tracker';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'The rent order tracker, analyse abnormal and end order.';

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
            $now = now();
            // 未结算的订单
            $unSettleCharges = \DB::table('orders_charge')
                ->whereIn('charge_type', [0, 1])
                ->whereNotNull('charged_at')
                ->where('settle', false)
                ->pluck('id');
            foreach ($unSettleCharges as $chargeId) {
                dispatch(new OrderSettleJob($chargeId));
            }
            $this->info('Found ' . count($unSettleCharges) . ' un-settle orders.');

            // 租赁中订单到期未还自动转为异常订单
            $abnormalCount = \DB::table('orders')
                ->where('charged', true)
                ->where('status', 0)
                ->where('has_allege', 0)
                ->where('expired_at', '<=', $now)
                ->whereNull('backed_at')
                ->update([
                    'status' => 2,
                    'updated_at' => $now
                ]);
            $this->info('Found ' . $abnormalCount . ' abnormal orders.');

            // 自动结束订单
            $orders = \DB::table('orders')
                ->where('charged', true)
                ->where('has_allege', 0)
                ->where(function ($sub) use ($now) {
                    $sub
                        // 订单异常且未还货
                        ->where(function ($sub) use ($now) {
                            $sub->where('status', 2)
                                ->where('expired_at', '<', $now)
                                ->whereNull('backed_at');
                        })
                        // 已还货且订单未完成
                        ->orWhere(function ($sub) use ($now) {
                            $sub->where('status', 0)
                                ->whereNotNull('backed_at');
                        });
                })
                ->select('id', 'status', 'expired_at', 'cid', 'sid', 'complete_dissent_at', 'backed_at')
                ->get();
            $this->info('Found ' . count($orders) . ' orders need to complete.');

            foreach ($orders as $order) {
                if (!$order->backed_at) {
                    // 逾期到达上限的订单自动结束订单并结算
                    $expiredTime = Carbon::parse($order->expired_at);
                    // 获得已逾期的天数
                    $overdueDays = ceil($expiredTime->diffInHours(now()->endOfDay()) / 24);
                    // 逾期天数
                    $overdueLimitDays = intval(array_get(RentConfig::getConfig('rent.unusual') ?: [], 'limit_days'));
                    if ($overdueDays > $overdueLimitDays) {
                        if (\DB::table('orders')
                            ->where('id', $order->id)
                            ->where('charged', true)
                            ->where('expired_at', '<', $now)
                            ->update([
                                'status' => 1,
                                'complete_type' => 1,
                                'complete_force' => true,
                                'sold_at' => $now,
                                'updated_at' => $now,
                                'is_claim' => true,
                                'claim_created_at' => $now
                            ])) {
                            dispatch(new OrderCompleteSettleJob($order->id));
                        }
                    }
                } else {
                    // 消费者还货后未确认赔付且已过异议上限时间的自动结束并结算
                    $dissentAt = $order->complete_dissent_at;
                    if ($dissentAt && Carbon::parse($dissentAt)->isPast()) {
                        if (\DB::table('orders')
                            ->where('id', $order->id)
                            ->where('charged', true)
                            ->update([
                                'status' => 1,
                                'complete_force' => true,
                                'updated_at' => $now
                            ])) {
                            dispatch(new OrderCompleteSettleJob($order->id));
                        }
                    }
                }
            }

            // 支付完成但未结算发起结算
            $oArr = \DB::table('orders')
                ->where('complete_settled', false)
                ->where('status', 1)
                ->pluck('id');
            foreach ($oArr as $id) {
                dispatch(new OrderCompleteSettleJob($id));
            }
        } catch (\Exception $ex) {
            $this->info('OrderTrackerCommandErr: ' . $ex->getMessage());
        }
    }
}
