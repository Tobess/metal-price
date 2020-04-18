<?php

namespace App\Console\Commands;

use App\Helper\Msg;
use App\Jobs\OrderCompleteSettleJob;
use Illuminate\Console\Command;

class OrderAllegeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'order:allege';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '查询已经被平台申诉审核人员处理过申诉订单并执行订单账务赔付。';

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
        // 查询已审核但未赔付结算的申诉订单
        $orders = \DB::table('orders as o')
            ->leftJoin('orders_items_allege as a', 'a.item_id', '=', 'o.id')
            ->where('o.charged', true)
            ->where('o.status', '<>', 1)
            ->where('o.has_allege', 1)// 申诉单据
            ->where('o.alleged_status', 1)// 申诉已审核
            ->select('o.id', 'a.resp_type', 'o.code', 'o.u_id', 'o.cid', 'o.customer_id')
            ->get();
        if ($orders && !empty($orders)) {
            $num = 0;
            foreach ($orders as $order) {
                $id = $order->id;
                if (\DB::table('orders')
                    ->where('charged', true)
                    ->where('status', '<>', 1)
                    ->where('has_allege', 1)
                    ->where('alleged_status', 1)
                    ->where('id', $id)
                    ->update([
                        'status' => 1,
                        'complete_force' => true,
                        'updated_at' => now()->toDateTimeString()
                    ])) {
                    $num++;
                    dispatch(new OrderCompleteSettleJob($id));

                    if ($order->resp_type == 1) {
                        // B9 Msg::T_RENT_ALLEGED_RES_CUSTOMER 平台判定消费者责任
                        $bType = Msg::T_RENT_ALLEGED_RES_CUSTOMER;
                    } else {
                        // B10 Msg::T_RENT_ALLEGED_RES_MERCHANT 平台判定商家责任
                        $bType = Msg::T_RENT_ALLEGED_RES_MERCHANT;
                        // B14 Msg::T_M_RENT_ALLEGED_RES_MERCHANT 定损单据申述判定商家责任
                        Msg::create()
                            ->business(Msg::T_M_RENT_ALLEGED_RES_MERCHANT, $order->code)
                            ->merchant($order->cid)
                            ->to($order->u_id)
                            ->data(['order_id' => $id])
                            ->push();
                    }
                    // B9|B10
                    Msg::create()
                        ->business($bType)
                        ->to($order->customer_id)
                        ->data(['order_id' => $id])
                        ->sms();
                }
            }

            $this->info('搜索到了' . count($orders) . '条待结算申诉订单，' . $num . '条已经成功加入结算队列中。');
        }
    }
}
