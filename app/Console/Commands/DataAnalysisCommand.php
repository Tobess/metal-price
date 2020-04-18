<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;

class DataAnalysisCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:analysis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '分析共享珠宝运营数据。';

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
        $fifteenDay = now()->subDays(15)->startOfDay()->toDateTimeString();// 15天
        // TODO type 1-APP下载量 2-门店量 3-注册客户 13-未评分 14-评分高 15-评分低 4-转化率 5-连带率 6-复租率 7-逾期率 8-坏账率 9-赔偿率 11-返厂维修比率 12无法维修比率
        $billCount = \DB::table('orders')
            ->where('created_at', '>=', $fifteenDay)
            ->select('customer_id', 'created_at', 'is_overdue')
            ->orderBy('created_at', 'desc')
            ->get();

        $billDeal = [];
        foreach ($billCount as $v) {
            $ymd = date('Y-m-d', strtotime($v->created_at));

            $billDeal[$ymd][] = $v->customer_id;
        }
        $fifteenDay = now()->subDays(15)->startOfDay()->toDateTimeString();// 15天

        $shopLists = $this->shopNumber($fifteenDay);
        $userLists = $this->registerUsers($billCount, $fifteenDay);
        $lastYear = date('Y-m', strtotime(now()->subYear()->startOfDay()->toDateTimeString()) - (24 * 60 * 60)) . "-01 00:00:00"; // 12个月


        $badFItems = \DB::table('orders_items as oi')
            ->leftJoin('orders_items_check as c', 'oi.id', '=', 'c.item_id')
            ->where('oi.created_at', '>=', $fifteenDay)
            ->select('c.check_type', 'created_at')
            ->orderBy('oi.created_at', 'desc')
            ->get();

        $jointLists = $this->joint($billCount, $badFItems); // 连带
        $twoLists = $this->twoBuy($billDeal); // 复租
        $goodsLists = $this->goods($fifteenDay);

        // 按月
        $yearLists = \DB::table('orders_items as oi')
            ->leftJoin('orders_items_check as c', 'oi.id', '=', 'c.item_id')
            ->where('oi.created_at', '>=', $lastYear)
            ->select('c.check_type', 'created_at')
            ->orderBy('oi.created_at', 'desc')
            ->get();

        $billCountY = \DB::table('orders')
            ->where('created_at', '>=', $lastYear)
            ->select('customer_id', 'created_at', 'is_overdue')
            ->orderBy('created_at', 'desc')
            ->get();
        $dingLists = $this->dingShun($yearLists); // 定损
        $overdueLists = $this->overdue($billCountY); // 逾期
        $thisAllData = array_merge($shopLists, $userLists, $jointLists, $twoLists, $dingLists, $overdueLists, $goodsLists);
        \mongodb('big')->truncate(); // 只有一份数据,所以需要先清除,在添加
        \mongodb('big')->insert(array_values($thisAllData));
        // 统计
        $this->countData();
    }

    // 门店
    private function shopNumber($start)
    {
        $rows = db_plat()->table('clients_legal_shops')
            ->where('rent_on', 1)
            ->where('created_at', '>=', $start)
            ->select('created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        $values = [];
        foreach ($rows as $row) {
            $ymd = date('Y-m-d', strtotime($row->created_at));
            $values[$ymd] = [
                'type' => 2,
                'data' => strtotime($ymd),
                'ratio' => $values[$ymd]['ratio'] ?? 0,
            ];
            $values[$ymd]['ratio'] += 1;
        }

        return array_values($values);

    }

    // 注册客户，评分
    private function registerUsers($data, $start)
    {
        $users = \DB::table('rent_users')
            ->where('created_at', '>=', $start)
            ->select('created_at', 'authorized', 'auth_raw', 'user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        $values = [];
        $ping = [];
        for ($i = 1; $i <= 3; $i++) {
            $ping[$i] = [
                'type' => 10,
                'data' => $i,
                'ratio' => 0,
            ];
        }

        $register = [];
        $pingG = [];
        $pingD = [];
        $pingW = [];
        foreach ($users as $row) {
            // 3-注册客户
            $ymd = date('Y-m-d', strtotime($row->created_at));
            $ts = strtotime($ymd);
            $values[$ymd] = [
                'type' => 3,
                'data' => $ts,
                'ratio' => $values[$ymd]['ratio'] ?? 0,
            ];
            $values[$ymd]['ratio'] += 1;
            $register[$ymd][] = $row->user_id;
            // 13-未评分 14-低于300 15-高于300
            if ($row->authorized == 0) {
                $pingW[$ymd] = [
                    'type' => 13,
                    'data' => $ts,
                    'ratio' => $pingW[$ymd]['ratio'] ?? 0,
                ];
                $pingW[$ymd]['ratio'] += 1;

            } else {
                // 评分高于300
                if (isset(json_decode($row->auth_raw, true)['score']) && json_decode($row->auth_raw, true)['score'] >= 300) {
                    $pingG[$ymd] = [
                        'type' => 15,
                        'data' => $ts,
                        'ratio' => $pingG[$ymd]['ratio'] ?? 0,
                    ];
                    $pingG[$ymd]['ratio'] += 1;

                } else { // 评分低于300

                    $pingD[$ymd] = [
                        'type' => 14,
                        'data' => $ts,
                        'ratio' => $pingD[$ymd]['ratio'] ?? 0,
                    ];
                    $pingD[$ymd]['ratio'] += 1;
                }
            }
        }
        foreach ($data AS $v) {
            $ymd = date('Y-m-d', strtotime($v->created_at));
            $billDeal[$ymd][] = $v->customer_id;
        }
        // 转化
        $registers = [];
        foreach ($register as $k => $v) {
            $deal = isset($billDeal[$k]) ? array_unique($billDeal[$k]) : []; // 检查该日成交的商户,并去重
            $mDeal = (count($deal) + count($v)) - count(array_unique(array_merge($deal, $v))); // 计算当日注册客户中有几人进行了消费
            $registers[$k] = [
                'type' => 4,
                'data' => strtotime($k),
                'ratio' => round($mDeal / count($v) * 100, 2),
            ];
        }

        return array_merge(array_values($pingG), array_values($pingD), array_values($pingW), array_values($registers));
    }

    // 连带
    private function joint($data, $billItemsCount)
    {
        $lists = [];
        foreach ($data as $v) {
            // 5-连带率
            $ymd = date('Y-m-d', strtotime($v->created_at));
            $lists[$ymd] = [
                'type' => 5,
                'data' => strtotime($ymd),
                'ratio' => $lists[$ymd]['ratio'] ?? 0,
            ];
            $lists[$ymd]['ratio'] += 1;
        }

        // 商品详情
        $billItems = [];
        foreach ($billItemsCount as $v) {
            $ymd = date('Y-m-d', strtotime($v->created_at));
            $billItems[$ymd] = $billItems[$ymd] ?? 0;

            $billItems[$ymd] += 1;
        }

        // 数据处理  // 5-连带率
        $LD = [];
        foreach ($lists as $k => $v) {
            $LD[] = [
                'type' => $v['type'],
                'data' => $v['data'],
                'ratio' => round($billItems[$k] ?? 0 / $v['ratio'] * 100, 2)
            ];
        }
        return array_values($LD);
    }

    // 复租率
    private function twoBuy($billDeal)
    {
        $twoBuy = [];
        foreach ($billDeal as $k => $v) {
            $u_id = implode(',', array_unique($v));
            $rows = \DB::table('orders')
                ->where('created_at', '<=', $k . ' 23:59:59')
                ->whereRaw("find_in_set(customer_id,'{$u_id}')")
                ->groupBy('customer_id')
                ->having('times', '>=', 2)
                ->selectRaw('count(customer_id) as times')
                ->get();
            $twoBuy[$k] = [
                'type' => 6,
                'data' => strtotime($k),
                'ratio' => round(count($rows) / count(array_unique($v)) * 100, 2),
            ];
        }

        return array_values($twoBuy);
    }

    // 11-返厂维修比率 12无法维修比率 9-赔偿率
    private function dingShun($badFItems)
    {
        $listGoods = [];
        foreach ($badFItems as $v) {
            $ym = date('Y-m', strtotime($v->created_at));
            $listGoods[$ym] = $listGoods[$ym] ?? 0;
            $listGoods[$ym] += 1;
            if ($v->check_type == 1) { // 无法维修
                $badLists[$ym] = [
                    'type' => 12,
                    'data' => strtotime($ym),
                    'ratio' => $badLists[$ym]['ratio'] ?? 0,
                ];
                $badLists[$ym]['ratio'] += 1;
            }
            if ($v->check_type == 2) { // 返厂维修
                $retLists[$ym] = [
                    'type' => 11,
                    'data' => strtotime($ym),
                    'ratio' => $retLists[$ym]['ratio'] ?? 0,
                ];
                $retLists[$ym]['ratio'] += 1;
            }
            // 定损赔付
            if ($v->check_type == 1 || $v->check_type == 2) {
                $damageLists[$ym] = [
                    'type' => 9,
                    'data' => strtotime($ym),
                    'ratio' => $damageLists[$ym]['ratio'] ?? 0,
                ];
                $damageLists[$ym]['ratio'] += 1;
            }
        }
        // 数组最终处理
        $thisAllData = [];
        if (isset($badLists)) {
            $thisBad = [];
            foreach ($badLists as $k => $v) {
                $thisBad[] = [
                    'type' => $v['type'],
                    'data' => $v['data'],
                    'ratio' => round($v['ratio'] / $listGoods[$k] * 100, 2)
                ];
            }
            $thisAllData = array_merge($thisAllData, array_values($thisBad));
        }
        if (isset($badLists)) {
            $thisBad = [];
            foreach ($retLists as $k => $v) {
                $thisBad[] = [
                    'type' => $v['type'],
                    'data' => $v['data'],
                    'ratio' => round($v['ratio'] / $listGoods[$k] * 100, 2)
                ];
            }
            $thisAllData = array_merge($thisAllData, array_values($thisBad));
        }
        if (isset($badLists)) {
            $thisBad = [];
            foreach ($damageLists as $k => $v) {
                $thisBad[] = [
                    'type' => $v['type'],
                    'data' => $v['data'],
                    'ratio' => round($v['ratio'] / $listGoods[$k] * 100, 2)
                ];
            }
            $thisAllData = array_merge($thisAllData, array_values($thisBad));
        }

        return $thisAllData;
    }

    // 逾期
    private function overdue($billCount)
    {
        // 7-逾期率
        $monthOrder = [];
        $thisOverdue = [];
        foreach ($billCount as $v) {
            $ym = date('Y-m', strtotime($v->created_at));
            if ($v->is_overdue == 1) { // 返厂维修
                $overdue[$ym] = [
                    'type' => 7,
                    'data' => strtotime($ym),
                    'ratio' => $overdue[$ym]['ratio'] ?? 0,
                ];
                $overdue[$ym]['ratio'] += 1;
            }
            $monthOrder[$ym] = $monthOrder[$ym] ?? 0;
            $monthOrder[$ym] += 1;
        }
        if (isset($overdue)) {
            $thisOverdue = [];
            foreach ($overdue as $k => $v) {
                $thisOverdue[] = [
                    'type' => $v['type'],
                    'data' => $v['data'],
                    'ratio' => round($v['ratio'] / $monthOrder[$k] * 100, 2)
                ];
            }
        }

        return array_values($thisOverdue);
    }

    // 每日成交商品数
    private function goods($fifteenDay)
    {

        $goods = \DB::table('orders_items')
            ->where('style_id', '>', 0)
            ->where('created_at', '>=', $fifteenDay)
            ->select('created_at', 'style_id')
            ->orderBy('created_at', 'desc')
            ->get();

        $goodsLists = [];
        foreach ($goods as $v) {
            $ymd = date('Y-m-d', strtotime($v->created_at));

            $goodsLists[$ymd . '|' . $v->style_id] = [
                'type' => $v->style_id . '-16',
                'data' => strtotime($ymd),
                'ratio' => $goodsLists[$ymd . '|' . $v->style_id]['ratio'] ?? 0,
            ];
            $goodsLists[$ymd . '|' . $v->style_id]['ratio'] += 1;
        }

        return array_values($goodsLists);
    }

    // 统计
    private function countData()
    {
        // TODO type 1-APP下载量 2-门店量 3-注册客户 10-评分 4-转化率 5-连带率 6-复租率 7-逾期率 8-坏账率 9-赔偿率 11-返厂维修比率 12无法维修比率 13-单据 14-商品 15-标价

        $userCount = \DB::table('rent_users')->count('user_id');
        $allCount[] = [
            'type' => 3,
            'ratio' => $userCount,
        ];

        $shopCount = db_plat()->table('clients_legal_shops')
            ->where('rent_on', 1)
            ->count('sid');
        $allCount[] = [
            'type' => 2,
            'ratio' => $shopCount,
        ];

        $conversionCount = round(\DB::table('orders')->groupBy('customer_id')->count('customer_id') / $userCount * 100, 2); // 转化
        $allCount[] = [
            'type' => 4,
            'ratio' => $conversionCount,
        ];

        $billCount = \DB::table('orders')->count('id');
        $allCount[] = [
            'type' => 13,
            'ratio' => $billCount,
        ];

        $goodsCount = \DB::table('orders_items')->count('id');
        $allCount[] = [
            'type' => 14,
            'ratio' => $goodsCount,
        ];

        $goodsSaleCount = \DB::table('orders_items')->sum('sale'); // 标价
        $allCount[] = [
            'type' => 15,
            'ratio' => $goodsSaleCount,
        ];
        $jointCount = round($goodsCount / $billCount * 100, 2); // 连带
        $allCount[] = [
            'type' => 5,
            'ratio' => $jointCount,
        ];

        $twoBuy = \DB::table('orders')->groupBy('customer_id')->having('times', '>=', 2)
            ->selectRaw('count(customer_id) as times')
            ->get();
        $doubleCount = round(count($twoBuy) / $userCount * 100, 2); // 复租
        $allCount[] = [
            'type' => 6,
            'ratio' => $doubleCount,
        ];

        $indemnifyCount = round(\DB::table('orders_items_check')
                ->where('check_type', '<>', 0)->count('item_id') / $goodsCount * 100, 2); // 赔偿
        $allCount[] = [
            'type' => 9,
            'ratio' => $indemnifyCount,
        ];

        $backCount = round(\DB::table('orders_items_check')->where('check_type', 2)->count('item_id') / $goodsCount * 100, 2); // 返厂
        $allCount[] = [
            'type' => 11,
            'ratio' => $backCount,
        ];

        $badCount = round(\DB::table('orders_items_check')->where('check_type', 1)->count('item_id') / $goodsCount * 100, 2); // 无法维修
        $allCount[] = [
            'type' => 12,
            'ratio' => $badCount,
        ];

        $overdueCount = round(\DB::table('orders')->where('is_overdue', 1)->count('id') / $billCount * 100, 2); // 逾期率
        $allCount[] = [
            'type' => 7,
            'ratio' => $overdueCount,
        ];

        \mongodb('rent_count')->truncate();
        \mongodb('rent_count')->insert($allCount);
    }

}
