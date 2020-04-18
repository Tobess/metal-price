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
            $table->string('key', 30)->unique();
            $table->string('name');
            $table->unsignedTinyInteger('type')->default(0);
            $table->string('buy')->decimal(18,2)->default(0);
            $table->string('send')->decimal(18,2)->default(0);
            $table->string('buy_delta')->decimal(18,2)->default(0);
            $table->string('send_delta')->decimal(18,2)->default(0);
            $table->string('top')->decimal(18,2)->default(0);
            $table->string('foot')->decimal(18,2)->default(0);
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
