<?php

namespace App\Console\Commands;

use App\Jobs\MapShopSyncJob;
use Illuminate\Console\Command;

class MapShopSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'map-shop:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '地图门店数据同步。';

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
        dispatch(new MapShopSyncJob());
        $this->info('地图门店同步任务已经加入队列中。');
    }
}
