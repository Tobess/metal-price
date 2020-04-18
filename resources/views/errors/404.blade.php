@extends('layouts.app')

@section('container')
    <div class="app app-header-fixed ">
        <div class="container w-xxl w-auto-xs">
            <div class="text-center m-b-lg">
                <h1 class="text-shadow text-white">404</h1>
            </div>
            <div class="list-group bg-info auto m-b-sm m-b-lg">
                <a href="{{ back()->getTargetUrl() }}" class="list-group-item">
                    <i class="fa fa-chevron-right text-muted"></i>
                    <i class="fa fa-fw fa-mail-forward m-r-xs"></i> 返回应用
                </a>
                <a href="/" class="list-group-item">
                    <i class="fa fa-chevron-right text-muted"></i>
                    <i class="fa fa-fw fa-home m-r-xs"></i> 首页
                </a>
            </div>
            <div class="text-center">
                <p>
                    <small class="text-muted">FROMAI.COM Copyright.<br>© 2018</small>
                </p>
            </div>
        </div>
    </div>
@endsection