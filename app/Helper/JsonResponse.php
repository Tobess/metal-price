<?php
/**
 * Created by PhpStorm.
 * User: Tobess
 * Date: 9/28/2017
 * Time: 5:45 PM
 */

namespace App\Helper;


trait JsonResponse
{
    /**
     * Json Response
     *
     * @param null $state
     * @param null $msg
     * @param null $data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public static function response($state = null, $msg = null, $data = null)
    {
        if (is_bool($state)) $ret['state'] = $state;
        if (is_string($msg)) $ret['msg'] = $msg;
        if (!is_null($data)) $ret['data'] = $data;

        return response()->json($ret ?? null, 200, [], JSON_BIGINT_AS_STRING);
    }

    /**
     * Return resources json response
     *
     * @param mixed $data return data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public static function retDat($data)
    {
        return self::response(null, null, $data);
    }

    /**
     * Return success json response
     *
     * @param mixed $data return data
     * @param null $msg message
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public static function retSuc($data = null, $msg = null)
    {
        return self::response(true, $msg, $data);
    }

    /**
     * Return error json response
     *
     * @param string $msg Error message
     * @param null $data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public static function retErr($msg, $data = null)
    {
        return self::response(false, $msg, $data);
    }

}