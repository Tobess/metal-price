<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Authentication Routes...
Route::get('login', 'Auth\LoginController@showLoginForm')->name('login');
Route::post('login', 'Auth\LoginController@login');
Route::any('logout', 'Auth\LoginController@logout')->name('logout');

Route::get('/', 'ConsoleController@getGoldPrice');
Route::post('getPriceData', 'ConsoleController@getGoldPriceData');

// 管理平台
Route::middleware('auth')->prefix('console')->group(function () {
    Route::get('/', 'ConsoleController@getIndex');
    Route::post('config', 'ConsoleController@postPriceConfig');
});