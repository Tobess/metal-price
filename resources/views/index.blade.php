<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no">
    <title>贵金属报价</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
        }

        html, body {
            height: auto;
            min-height: 100vh;
        }

        .grace-nowrap {
            display: flex;
            flex-wrap: nowrap;
        }


        .content {
            background-color: #ffb14a;
            width: 100%;
            height: 100%;
            min-height: 100vh;
            padding-bottom: 30px;
        }

        .content .header {
            width: 100%;
            height: 120px;
            background-size: 100% 100%;
        }

        .content .header .title {
            text-align: center;
            line-height: 120px;
            font-size: 30px;
            color: #FFFFFF;
            width: 100%;
        }

        .content form {
            margin: 0 15px;
            background-color: #FFFFFF;
            border-radius: 10px;
            padding: 15px 0;
        }

        .content form .form-group {
            margin: 0;
            margin-bottom: 5px;
        }

        .content form .control-label {
            line-height: 34px;
            padding-right: 0;
        }

        .content form .form-control {
            line-height: 34px;
            border: 0;
            background-color: #f0f0f0;
            box-shadow: none
        }

        .content form .form-group > div {
            padding-left: 0;
        }

        .content form .form-flex-box .item {
            float: left;
            width: 20%;
            text-align: center;
        }

        .content form .form-flex-box .item p {
            margin: 0;
        }

        .content form .form-flex-box .item p:first-child {
            color: #999999;
            font-size: 12px;
        }

        .content form .form-flex-box .item p:last-child {
            color: #101010;
            font-size: 15px;
        }

        .content form .line {
            width: 100%;
            height: 10px;
            background: #F0F0F0;
            margin-bottom: 10px;
        }

        .content form .yd-title {
            text-align: center;
            width: 100%;
            font-size: 18px;
            color: #101010;
        }

        .content form button {
            width: 100%;
            background-color: #FFB14A;
            color: #FFFFFF;
        }

        .bg-color-1 {
            background-color: #b29566;
        }


        /* 顶部导航 */
        .navbar {
            height: 45px;
            line-height: 45px;
            background-color: #b29566;
            background-image: none;
            box-shadow: none;
            border: 0;
            margin: 0;
        }

        .container {
            display: flex;
            flex-wrap: nowrap;
            height: 45px;
            line-height: 45px;
        }

        .container div {
            width: 100%;
        }

        .container .left span {
            color: #FFFFFF;
            font-size: 18px;
        }

        .container .title {
            text-align: center;
            font-size: 18px;
            color: #FFFFFF;
        }

        .container .right {
            text-align: right;
            color: #31e900;
            font-size: 12px;
        }


        .form-title {
            display: flex;
            justify-content: space-between;
            margin: 0 15px;
            height: 40px;
            line-height: 40px;
        }

        .form-title span:first-child {
            color: #101010;
            font-size: 14px;
            position: relative;
            padding-left: 15px;
        }

        .form-title span:first-child:after {
            content: "";
            background: #B29566;
            width: 5px;
            height: 15px;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            border-radius: 5px;
        }

        .form-title span:last-child {
            color: #999999;
            font-size: 12px;
        }

        .box-banner {
            margin: 10px 15px;
            padding: 15px 0;
            display: flex;
            flex-wrap: nowrap;
            overflow: hidden;
            background: #FFF;
            border: 1px solid #B29566;
            border-radius: 10px;
        }

        .box-banner .items {
            width: 100%;
            justify-content: center;
            line-height: 1.5em;
            text-align: center;
        }

        .box-banner .items:first-child {
            border-right: 1px solid #F1F2F3;
            margin-right: 10px;
            width: 300px;
        }

        .box-banner .items div {
            justify-content: center;
            text-align: left;
        }

        .box-banner .items .name {
            background-color: #B29566;
            height: 40px;
            font-size: 20px;
            line-height: 40px;
            margin: 4px 10px;
            color: #FFFFFF;
            text-align: center;
            border-radius: 5px;
        }

        .box-banner .line1 {
            font-size: 12px;
            line-height: 18px;
            overflow: hidden;
            color: #B29566;
        }

        .box-banner .line2 {
            font-size: 20px;
            color: #B29566;
            line-height: 30px;
            font-weight: bold;
        }


        .tips {
            font-size: 12px;
            color: #999999;
            float: left;
        }

        .login {
            font-size: 12px;
            color: #B29566;
            float: right;
        }

        .close-bg {
            position: absolute;
            height: 100%;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            top: 0;
            left: 0;
            border-radius: 10px;
        }


        /* 弹出框 */
        .toast-wrap {
            opacity: 0;
            position: fixed;
            bottom: 50%;
            color: #fff;
            width: 100%;
            text-align: center;
        }

        .toast-msg {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            width: 120px;
            margin: auto;
            font-size: 12px;
        }

        .toast-msg img {
            width: 30px;
            height: 30px;
        }

        .toast-msg p {
            margin-bottom: 0;
            line-height: 30px;
            height: 30px;
        }

        .toastAnimate {
            animation: toastKF 3s;
        }

        @keyframes toastKF {
            0% {
                opacity: 0;
            }
            25% {
                opacity: 1;
                z-index: 9999
            }
            50% {
                opacity: 1;
                z-index: 9999
            }
            75% {
                opacity: 1;
                z-index: 9999
            }
            100% {
                opacity: 0;
                z-index: 0
            }
        }
    </style>
</head>
<body>
<div class="content bg-color-1">
    <nav class="navbar navbar-default navbar-static-top">
        <div class="container">
            <div class="left"></div>
            <div class="title">贵金属报价</div>
            <div class="right" id="sfkp" name="sfkp">
                <font color="green">&nbsp;&nbsp;&nbsp;开盘中</font>
            </div>
        </div>
    </nav>
    <form class="form-horizontal" style="padding-bottom: 50px; position: relative;">
        <div class="form-title">
            <span>贵金属报价</span>
            <span id="serverTime" name="serverTime"></span>
        </div>
        <div id="dataHead">
        </div>
        <div style="margin: 0 15px;">
            <span class="tips">温馨提示：以上价格仅供参考！</span>
        </div>

        <!-- 判断是否闭盘，如果闭盘就显示 -->
        <div class="close-bg" id="sfkpdiv" name="sfkpdiv" style="display:none;"></div>
    </form>

    <!-- 弹框组件 -->
    <div class="toast-wrap">
        <div class="toast-msg">
            <img src="">
            <p class="title"></p>
        </div>
    </div>
</div>

<script src="https://cdn.bootcss.com/jquery/1.9.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script type="text/javascript">
    var index = 0;

    $(function(){
        $.ajaxSetup({headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}});

        initPage();
        setInterval("reload()",5000);
        setInterval("setTime()",1000);
    });

    function reload(){

        $.post('/getPriceData',{},function(result){
            if(result.statue=="Y"){
                $("#sfkp").html("<font color='green' >&nbsp&nbsp&nbsp开盘中</font>");
                $("#sfkpdiv").attr("style","display:none;");//隐藏div
            }else{
                $("#sfkp").html("<font color='red' >&nbsp&nbsp&nbsp关盘中</font>");
                $("#sfkpdiv").attr("style","display:block;");//显示div
            }
            $("#serverTime").html(result.time);

            for(i=0;i<result.datalist.length;i++){

                var obj = result.datalist[i];
                var objkey=obj.key.replace('+','\\+');

                var oldbuy=$("#buy"+objkey).html();
                var oldsend=$("#send"+objkey).html();

                if(parseFloat(oldbuy)>parseFloat(obj.buy)){
                    $("#buy"+objkey).css('color','red');
                }else if(parseFloat(oldbuy)<parseFloat(obj.buy)){
                    $("#buy"+objkey).css('color','green');
                }else{
                    $("#buy"+objkey).css('color','rgb(147, 94, 23)');

                }
                if(parseFloat(oldsend)>parseFloat(obj.send)){
                    $("#send"+objkey).css('color','red');
                }else if(parseFloat(oldsend)<parseFloat(obj.send)){
                    $("#send"+objkey).css('color','green');
                }else{
                    $("#send"+objkey).css('color','rgb(147, 94, 23)');

                }
                $("#name"+objkey).html(obj.name);
                $("#buy"+objkey).html(obj.buy);
                $("#send"+objkey).html(obj.send);
                $("#top"+objkey).html(obj.top);
                $("#foot"+objkey).html(obj.foot);
            }

        },'json');

    }


    function initPage(){
        $.post('/getPriceData',{},function(result){
            if(result.statue=="Y"){
                $("#sfkp").html("<font color='green'>开盘中</font>");
                $("#sfkpdiv").attr("style","display:none;");//隐藏div
            }else{
                $("#sfkp").html("<font color='red'>关盘中</font>");
                $("#sfkpdiv").attr("style","display:block;");//显示div
            }
            createTr(result.datalist);
        },'json');
        setTime();
    }
    //动态创建行
    function createTr(data){
        for(i=0;i<data.length;i++){
            var obj = data[i];
            $("#dataHead").append("  <div class='box-banner'><div class='items'><div class='name'><span id='name"+obj.key+"'>"+obj.name+"</span></div></div><div class='items'><div class='line1'>回购</div><div class='line2' id='buy"+obj.key+"'>"+obj.buy+"</div></div><div class='items'><div class='line1'>销售</div><div class='line2' id='send"+obj.key+"'>"+obj.send+"</div></div></div>");
        }
        index = data.length;
    }
    function setTime(){
        var servertime=$("#serverTime").text();
        var servertimearr=servertime.split(":");
        var h=parseInt(servertimearr[0]);
        var m=parseInt(servertimearr[1]);
        var s=parseInt(servertimearr[2]);
        var hs="";
        var ms="";
        var ss="";
        if(s+1>=60){//加一秒后
            if(m+1>=60){
                s=0;
                m=0;
                if(h+1>=24){
                    h=0;
                }else{
                    h=h+1
                }
            }else{
                s=0;
                m=m+1;
            }
        }else{
            s=s+1;
        }

        //强制保留2位数字
        if(h<10){
            hs='0'+h;
        }else{
            hs=''+h;
        }
        if(m<10){
            ms='0'+m;
        }else{
            ms=''+m;
        }
        if(s<10){
            ss='0'+s;
        }else{
            ss=''+s;
        }
        $("#serverTime").html(hs+':'+ms+':'+ss);
    }

</script>
</body>
</html>