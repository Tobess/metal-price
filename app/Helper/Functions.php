<?php

if (!function_exists('faker')) {
    /**
     * 获得模拟数据实例
     *
     * @return \Faker\Generator
     */
    function faker()
    {
        return \Faker\Factory::create('zh_CN');
    }
}

if (!function_exists('valid_mobile')) {
    /**
     * 是否是有效的手机号
     *
     * @return boolean
     */
    function valid_mobile($mobile)
    {
        return preg_match("/^1[3456789]\d{9}$/", $mobile);
    }
}