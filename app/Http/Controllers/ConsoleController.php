<?php

namespace App\Http\Controllers;

use Composer\Cache;
use http\Env\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsoleController extends Controller
{
    public function getIndex()
    {

        return view('dashboard')
            ->with('gPrices', $this->getPricesByType(0, false))
            ->with('bPrices', $this->getPricesByType(1, false))
            ->with('sPrices', $this->getPricesByType(2, false))
            ->with('wPrices', $this->getPricesByType(3, false))
            ->with('syncAt', \cache()->get('data_sync_at'))
            ->with('opened', \cache()->get('market_opened'));
    }

    public function postPriceConfig()
    {
        $id = \request()->get('id');
        $buy = \request()->get('buy_delta') * 1;
        $send = \request()->get('send_delta') * 1;
        DB::table('data')->where('id', $id)->update(['buy_delta' => $buy, 'send_delta' => DB::raw("if(type=1, 0, '{$send}')")]);

        return \redirect()->back();
    }

    private function getPricesByType($type, $plus = true)
    {
        $fields = !$plus ?
            ['id', 'key', 'name', 'type', 'buy', 'send', 'buy_delta', 'send_delta', 'top', 'foot'] :
            ['id', 'key', 'name', 'type', DB::raw('(buy+buy_delta) as buy'), DB::raw('(send+send_delta) as send')];
        return DB::table('data')
            ->where('type', $type)
            ->select($fields)
            ->get();
    }

    public function getGoldPrice()
    {
        return view('index');
    }

    public function getGoldPriceData()
    {
//        $prices = [
//            ["buy" => "368.40", "foot" => "369.20", "key" => "gold", "name" => "黄金", "send" => "369.50", "top" => "369.40"],
//            ["buy" => "179.10", "foot" => "181.50", "key" => "platinum", "name" => "铂金", "send" => "182.00", "top" => "181.50"],
//            ["buy" => "507.00", "foot" => "511.00", "key" => "palladiu", "name" => "钯金", "send" => "511.00", "top" => "511.00"],
//            ["buy" => "3.41", "foot" => "3.55", "key" => "silver", "name" => "白银", "send" => "3.55", "top" => "3.55"]
//        ];
        $prices = $this->getPricesByType(0);
        $values = [];
        foreach ($prices as $price) {
            if ($price->key != 'g_hk_au') {
                $price->name = str_replace('&nbsp;', '', $price->name);
                $values[] = $price;
            }
        }

        return \response()->json([
            'datalist' => $values,
            'time' => now()->toTimeString(),
            'statue' => \cache()->get('market_opened') ? 'Y' : 'N',
            'tip' => "success"
        ]);
    }
}
