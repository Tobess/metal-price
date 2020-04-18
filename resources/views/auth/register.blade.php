@extends('layouts.app')

@section('container')
    <div class="container w-xxl w-auto-xs" ng-controller="SignupFormController" ng-init="app.settings.container = false;">
        <a href class="navbar-brand block m-t">{{ trans('app.name') }}</a>
        <div class="m-b-lg">
            <form name="form" class="form-validation" method="post">
                {{ csrf_field() }}
                <div class="text-danger wrapper text-center" ng-show="authError">

                </div>
                <div class="list-group list-group-sm">
                    <div class="list-group-item">
                        <input id="name" type="text" placeholder="姓名" class="form-control no-border" name="name" value="{{ old('name') }}" required autofocus>
                    </div>
                    <div class="list-group-item">
                        <input id="email" type="email" placeholder="电邮" class="form-control no-border" name="email" value="{{ old('email') }}" required>                    </div>
                    <div class="list-group-item">
                        <input id="password" type="password" placeholder="密码" class="form-control no-border" name="password" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-lg btn-primary btn-block">注册</button>
                <div class="line line-dashed"></div>
                <p class="text-center"><small>已有账号?</small></p>
                <p class="text-center">
                    <a href="{{ app_route('login') }}" class="text-primary">登陆</a>
                </p>
            </form>
        </div>
        <div class="text-center m-t m-b">
            <small class="text-muted">贵金属行情 &copy; 2020 Copyright.</small>
        </div>
    </div>
@endsection
