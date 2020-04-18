<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('data', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 30)->unique();
            $table->string('title');
            $table->unsignedTinyInteger('type')->default(0);
            $table->string('in_price')->decimal(18,2)->default(0);
            $table->string('out_price')->decimal(18,2)->default(0);
            $table->string('in_price_delta')->decimal(18,2)->default(0);
            $table->string('out_price_delta')->decimal(18,2)->default(0);
            $table->string('top_price')->decimal(18,2)->default(0);
            $table->string('bot_price')->decimal(18,2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('data');
    }
}
