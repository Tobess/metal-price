@extends('layouts.content')

@section('head')
    <link rel="stylesheet" href="/libs/clockpicker/bootstrap-clockpicker.min.css" type="text/css"/>
    <link rel="stylesheet" href="/libs/bootstrap-datetimepicker/bootstrap-datetimepicker.css" type="text/css"/>
    <style>
        .logo img{
            width: 100%;
            height: 100%;
        }

        .footer a{ display:inline-block; }

        .footer a.current{ background:#3c763d; color:#fff;}
        .footer a span{ display:block;}

        .foot_ul li{ float:left; width:50%; overflow:hidden; border-right:1px solid #ccc;color:#333; font-size:16px; text-align:center;}
        .foot_ul li{ list-style-type:none;}
        .foot_ul li a{ color:#333; z-index:9999999999; opacity:1; width:100%; height:40px; line-height:35px;}
        .foot_ul li.current{background:#3c763d;}
        .foot_ul li.current a{  color:#fff;}

        .div1{
            width:100%;
            height:30px;
            margin-bottom: 5px;
            /*background-color: rgb(245, 245, 245);*/
        }

        .div1_1{
            float:left;
            width:30%;
            display:inline;
            height:100%;
            text-align:left;
            color:#000000;
            padding-top: 5px;
            font-size: 18px;
        }

        .div1_1 a{
            color: red;
        }

        .div1_2{
            float:left;
            width:40%;
            display:inline;
            padding-top: 10px;
            text-align: center;
            height:100%;
            color: #000;
        }

        .div1_3{
            float:right;;
            width:30%;
            display:inline;
            text-align:right;
            height:100%;
            color: #000;
            padding-top: 5px;

        }

        .jinjia_tab{ width:100%; text-align:center; overflow:hidden;}
        .jinjia_tab th{ background:#3c763d; color:#fff; font-size:22px; text-align:center; height:40px; line-height:40px;}
        .jinjia_tab .jinjia_tab_tr{ background:rgb(205, 238, 246);}
        /*background:rgb(202, 239, 222);*/
        .jinjia_tab tr td{ height:50px;color:#333; font-size:18px; overflow:hidden; border-right:1px solid #ccc;}
        .jinjia_tab_span1{ display:inline-block; width:100%; height:25px; border-bottom:1px solid #ccc; line-height:25px;}

        .jinjia_tab .f_lvse,.jinjia_tab .f_hongse{ font-size:22px;}
        .jinjia_tab .td_xiao .f_lvse,.jinjia_tab .td_xiao .f_hongse{font-size:14px; }
        .jinjia_tab .f_lvse,.jinjia_tab .f_moren{ font-size:22px;}
        .jinjia_tab tr td {
            cursor: pointer;
        }

        .bor_no{ border:0 !important;}
        .jinjia_span_r img{ width:100%;}

        .jinjia_tab_zg span{ font-size:16px !important;}

        .jinjia_name{background: rgb(203, 204, 205);border-bottom:1px solid rgb(186, 186, 186);font-weight: bold;}
        .headerTitle{
            width: 100%;
            height: 30px;
            background-color: #3c763d;
            line-height: 30px;
            color:  white;
            font-size: 18px;
            text-align: center;
            margin: 0;
        }

        .bor_top{
            border-top:1px solid #ccc;
        }

        .bor_left{
            border-left: 1px solid #ccc;
        }

        .bor_right{
            border-right: 1px solid #ccc;
        }

        .bor_bottom{
            border-bottom: 1px solid #ccc;
        }
    </style>
@endsection

@section('content')
    <!-- content -->
    <div class="wrapper">
        <div class="panel panel-default">
            <div class="wrapper-sm" style="max-width: 960px">
                <div class="div1">
                    <div class="div1_1">
                        <a href="?time={{ time() }}" target="_self">&nbsp;&nbsp;刷新&nbsp;&nbsp;</a>
                    </div>
                <div class="div1_2" id="currentTime">{{ $syncAt or now()->toDateTimeString() }}</div>
                <div class="div1_3">
                    <font size="4"><span id="stop_flag">{{ $opened ? '开盘' : '闭盘' }}</span>&nbsp;&nbsp;</font></div><font size="4">
                </font></div>
                <font size="4">

                    <table cellpadding="0" cellspacing="0" class="jinjia_tab bor_top bor_left bor_right"
                           width="100%">

                        <tbody>
                        <tr>
                            <th width="19%">商&nbsp;&nbsp;&nbsp;品</th>
                            <th width="18%">回&nbsp;&nbsp;&nbsp;购</th>
                            <th width="18%">销&nbsp;&nbsp;&nbsp;售</th>
                            <th width="20%">高&nbsp;&nbsp;/&nbsp;&nbsp;低</th>

                        </tr>
                        @foreach($gPrices as $idx => $item)
                        <tr class="{{ $idx%2 > 0 ? 'jinjia_tab_tr' : '' }}" onclick="showConfigForm('{{ $item->id }}', '{{ $item->name }}')">
                            <td class="jinjia_name" style="font-size: 25px;">{{ $item->name }}</td>
                            <td>
                                <span id="arrow1">
                                    <font color="blue"></font>
                                </span>&nbsp;
                                <span class="f_hongse" id="1">
                                    <font color="blue">
                                        <b>{{ $item->buy }}</b>
                                    </font>
                                </span>
                                @if($item->buy_delta<>0)
                                    <span class="text-muted">{{ $item->buy_delta>0 ? '+' : '-'  }}{{ abs($item->buy_delta) }}</span>
                                @endif
                            </td>
                            <td><span id="arrow2"><font color="blue"></font></span>&nbsp;<span class="f_hongse"
                                                                                               id="2"><font
                                            color="blue"><b>{{ $item->send }}</b></font></span>
                                @if($item->send_delta<>0)
                                    <span class="text-muted">{{ $item->send_delta>0 ? '+' : '-'  }}{{ abs($item->send_delta) }}</span>
                                @endif
                            </td>
                            <td class="jinjia_tab_zg bor_right">
                                    <span class="f_hongse jinjia_tab_span1" id="3"><font
                                                color="blue"><b>{{ $item->top }}</b></font></span>
                                <span class="f_hongse  jinjia_tab_span1 bor_no" id="4"><font
                                            color="blue"><b>{{ $item->foot }}</b></font></span>
                            </td>
                        </tr>
                        @endforeach
                        </tbody>
                    </table>

                    <p class="headerTitle bor_left bor_right">旧&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;料&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;回&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;收</p>
                    <table cellpadding="0" cellspacing="0" class="jinjia_tab bor_left bor_right" width="100%">

                        <tbody>
                        @for($i = 0,$j = 0; $i < count($bPrices); $i += 2,$j++)
                        <tr class="{{ $j%2 == 0 ? 'jinjia_tab_tr' : '' }}">
                            <td width="19%" class="jinjia_name" style="font-size: 25px;">{{ $bPrices[$i]->name }}</td>
                            <td width="18%" onclick="showConfigForm('{{ $bPrices[$i]->id }}', '{{ $bPrices[$i]->name }}')"><span id="arrow25"><font color="blue"></font></span>&nbsp;<span
                                        class="f_hongse" id="25"><font color="blue"><b>{{ $bPrices[$i]->buy }}</b></font></span>
                                @if(isset($bPrices[$i]) && $bPrices[$i]->buy_delta<>0)
                                    <span class="text-muted">{{ $bPrices[$i]->buy_delta>0 ? '+' : '-'  }}{{ abs($bPrices[$i]->buy_delta) }}</span>
                                @endif                            </td>
                            <td width="18%" class=""><span class="f_hongse jinjia_name2 " style="font-size: 25px;"
                                                           id="goldTDSP1">{{ isset($bPrices[$i+1]) ? $bPrices[$i+1]->name : '' }}</span></td>
                            <td width="20%" onclick="showConfigForm('{{ $bPrices[$i]->id }}', '{{ $bPrices[$i]->name }}')"><span id="arrow24"><font color="blue"></font></span>&nbsp;<span
                                        class="f_hongse" id="24"><font color="blue"><b>{{ isset($bPrices[$i+1]) ? $bPrices[$i+1]->buy : '' }}</b></font></span>
                                @if(isset($bPrices[$i+1]) && $bPrices[$i+1]->buy_delta<>0)
                                <span class="text-muted">{{ $bPrices[$i+1]->buy_delta>0 ? '+' : '-'  }}{{ abs($bPrices[$i+1]->buy_delta) }}</span>
                                @endif
                            </td>

                        </tr>
                        @endfor
                        </tbody>
                    </table>

                    <p class="headerTitle bor_left bor_right">上&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;海&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;行&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;情</p>
                    <table cellpadding="0" cellspacing="0" class="jinjia_tab bor_left bor_right" width="100%">

                        <tbody>
                        @foreach($sPrices as $idx => $item)
                        <tr class="{{ $idx%2 > 0 ? 'jinjia_tab_tr' : '' }}" onclick="showConfigForm('{{ $item->id }}', '{{ $item->name }}')">
                            <td width="19%" class="jinjia_name" style="font-size: 25px;">{{ $item->name }}</td>
                            <td width="18%"><span id="arrowsh1"><font color="blue"></font></span>&nbsp;<span
                                        class="f_hongse" id="sh1"><font color="blue"><b>{{ $item->buy }}</b></font></span>
                                @if($item->buy_delta<>0)
                                <span class="text-muted">{{ $item->buy_delta>0 ? '+' : '-'  }}{{ abs($item->buy_delta) }}</span>
                                @endif
                            </td>
                            <td width="18%"><span id="arrowsh2"><font color="blue"></font></span>&nbsp;<span
                                        class="f_hongse" id="sh2"><font color="blue"><b>{{ $item->send }}</b></font></span>
                                @if($item->send_delta<>0)
                                    <span class="text-muted">{{ $item->send_delta>0 ? '+' : '-'  }}{{ abs($item->send_delta) }}</span>
                                @endif
                            </td>
                            <td width="20%" class="jinjia_tab_zg bor_right">
                                <span class="f_hongse jinjia_tab_span1" id="sh3"><font
                                                color="blue"><b>{{ $item->top }}</b></font></span>
                                <span class="f_hongse  jinjia_tab_span1 bor_no" id="sh4"><font
                                            color="blue"><b>{{ $item->foot }}</b></font></span>
                            </td>

                        </tr>
                        @endforeach
                        </tbody>
                    </table>

                    <p class="headerTitle bor_left bor_right">国&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;际&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;行&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;情</p>

                    <table cellpadding="0" cellspacing="0" class="jinjia_tab bor_left bor_right bor_bottom"
                           width="100%">
                        <tbody>
                        @foreach($wPrices as $idx => $item)
                            <tr class="{{ $idx%2 > 0 ? 'jinjia_tab_tr' : '' }}" onclick="showConfigForm('{{ $item->id }}', '{{ $item->name }}')">
                                <td width="19%" class="jinjia_name" style="font-size: 25px;">{{ $item->name }}</td>
                                <td width="18%"><span id="arrowsh1"><font color="blue"></font></span>&nbsp;<span
                                            class="f_hongse" id="sh1"><font color="blue"><b>{{ $item->buy }}</b></font></span>
                                    @if($item->buy_delta<>0)
                                        <span class="text-muted">{{ $item->buy_delta>0 ? '+' : '-'  }}{{ abs($item->buy_delta) }}</span>
                                    @endif
                                </td>
                                <td width="18%"><span id="arrowsh2"><font color="blue"></font></span>&nbsp;<span
                                            class="f_hongse" id="sh2"><font color="blue"><b>{{ $item->send }}</b></font></span>
                                    @if($item->send_delta<>0)
                                        <span class="text-muted">{{ $item->send_delta>0 ? '+' : '-'  }}{{ abs($item->send_delta) }}</span>
                                    @endif
                                </td>
                                <td width="20%" class="jinjia_tab_zg bor_right">
                                    <span class="f_hongse jinjia_tab_span1" id="sh3"><font
                                                color="blue"><b>{{ $item->top }}</b></font></span>
                                    <span class="f_hongse  jinjia_tab_span1 bor_no" id="sh4"><font
                                                color="blue"><b>{{ $item->foot }}</b></font></span>
                                </td>

                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </font>
            </div>
        </div>
    </div>
    <!-- / content -->

    <div id="formModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myShopModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form method="POST" action="/console/config">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myShopModalLabel">销售/回购调价</h4>
                    </div>
                    <div class="modal-body">
                        <div class="wrapper">
                            <div class="panel bg-white">
                                <input type="hidden" name="id" />
                                {{ csrf_field() }}
                                <div class="form-group">
                                    <label>回购调价：</label>
                                    <input name="buy_delta" class="form-control"/>
                                </div>
                                <div class="form-group">
                                    <label>销售调价：</label>
                                    <input name="send_delta" class="form-control"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">取消</button>
                        <button name="submit" type="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script>
        $(function () {

        });
        function showConfigForm(id, name)
        {
            var $form = $("#formModal");
            $form.find('form').get(0).reset();
            $form.find('#myShopModalLabel').text('【'+name+'】销售/回购调价');
            $form.find('[name=id]').val(id);
            $form.modal('show');
        }
    </script>
@endsection