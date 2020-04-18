<?php

use Illuminate\Foundation\Inspiring;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->describe('Display an inspiring quote');

// 获得贵金属实时行情
Artisan::command('sync:gold', function () {
    $this->comment('正在同步...');
    // S1 获得接口调用TOKEN
    $token = cache()->get('data_sync_token');
    if (!$token) {
        $html = file_get_contents('http://www.ysx9999.cn/');
        preg_match_all('/\{\'_token\':(.+)\}/isU', $html, $matches);
        if (isset($matches[1][0]) && $matches[1][0]) {
            $token = $matches[1][0];
            cache()->put('data_sync_token', $token, now()->addMinutes(10));
        }
    }
    $this->comment('Token is ' . $token);
    // S2 获得接口1数据
    if ($token) {
        $priceJson = file_get_contents('http://www.ysx9999.cn/api/getpricendata?r=' . str_random() . '&_token=' . $token);
        $this->comment($priceJson);
        $prices = json_decode($priceJson);
        if (count($prices) === 27) {
            // ,,,,,,,,,s_au9999,s_au_td,s_s_td,s_pd9995,w_uk_au,w_uk_pt,w_us_au,w_us_pd,w_us_pt,w_us_sg,w_dollar_yuan
            $setConfigs = [
                // 商品
                'g_au' => [1,2,3,4],
                'g_s' => [5,6,7,8],
                'g_pd' => [9,10,11,12],
                'g_pt' => [13,14,15,16],
                'g_hk_au' => [17,18,19,20],
                // 开盘标示 21
                // 旧料
                'b_au' => [25],
                'b_18k' => [24],
                'b_pt950' => [22],
                'b_pd990' => [23]
            ];
            foreach ($setConfigs as $key => $set) {
                $value = [
                    'buy' => array_get($prices, $set[0] ?? -1, 0) * 1,
                    'send' => array_get($prices, $set[1] ?? -1, 0) * 1,
                    'top' => array_get($prices, $set[2] ?? -1, 0) * 1,
                    'foot' => array_get($prices, $set[3] ?? -1, 0) * 1
                ];
                DB::table('data')->where('key', $key)->update($value);
            }
            cache()->put('market_opened', $prices[21], now()->endOfDay());
        }
    }
    // S3 获得接口2数据
    if ($token) {
        $priceJson = file_get_contents('http://www.ysx9999.cn/api/getshdata?r=' . str_random() . '&_token=' . $token);
        $this->comment($priceJson);
        $prices = json_decode($priceJson);
        if (count($prices) === 46) {
            // ["--","369.28","370.6","372.99","368","368.86","368.99","371.28","368.25","3653","3654","3679","3637","176","177.15","177","174.95","1681.8","1682.5","1719.9","1677.8","7.071","7.071","7.082","7.064","1691","1699.5","1738.8","1691.2","789.5","795.7","813.2","784.5","2088","2125","2152.2","2100","15.205","15.375","15.8","15.195","2160.9","2164.9","2205.3","2153.8","--"]
            // ,,,,,,,,,s_au9999,s_au_td,s_s_td,s_pd9995,w_uk_au,w_uk_pt,w_us_au,w_us_pd,w_us_pt,w_us_sg,w_dollar_yuan
            $setConfigs = explode(',', 's_au9999,s_au_td,s_s_td,s_pd9995,w_uk_au,w_uk_pt,w_us_au,w_us_pd,w_us_pt,w_us_sg,w_dollar_yuan');
            foreach ($setConfigs as $idx => $key) {
                $offset = $idx * 4;
                $value = [
                    'buy' => array_get($prices, $offset + 1, 0) * 1,
                    'send' => array_get($prices, $offset + 2, 0) * 1,
                    'top' => array_get($prices, $offset + 3, 0) * 1,
                    'foot' => array_get($prices, $offset + 4, 0) * 1
                ];
                DB::table('data')->where('key', $key)->update($value);
            }
        }
    }

    cache()->put('data_sync_at', now()->toDateTimeString(), now()->endOfDay());
})->describe('同步贵金属行情');
