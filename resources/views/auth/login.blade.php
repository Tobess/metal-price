@extends('layouts.app')

@section('container')
    <div class="app app-header-fixed  ">
        <div class="container w-xxl w-auto-xs">
            <a href class="navbar-brand block m-t text-2x">
                <span class="hidden-folded m-l-xs inline">{{ trans('app.name') }}</span>
            </a>
            <div class="m-b-lg">
                <form name="form" class="form-validation" method="POST">
                    {{ csrf_field() }}
                    <div class="list-group list-group-sm">
                        <div class="list-group-item">
                            <input id="mobile" name="mobile" type="mobile" placeholder="手机"
                                   class="form-control no-border" value="{{ old('mobile') }}" required autofocus>
                        </div>
                        <div class="list-group-item">
                            <input type="password" name="password" placeholder="密码" class="form-control no-border" required>
                        </div>
                    </div>

                    @if (count($errors) > 0)
                        <div class="alert alert-danger ">
                            <div class="block m-b-xs"><strong>对不起，出错啦!</strong></div>
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <button type="submit" class="btn btn-lg btn-primary btn-block">登录</button>
                    {{--<div class="text-center m-t m-b"><a href="{{ app_route('password/reset') }}">忘记密码?</a></div>--}}
                    {{--<div class="text-center m-t m-b">没有账号? <a ui-sref="access.signup" href="{{ app_route('register') }}" class="text-primary _600">注册</a></div>--}}
                </form>
            </div>
            <div class="text-center m-t m-b">
                <small class="text-muted">贵金属行情 &copy; 2020 Copyright.</small>
            </div>
        </div>
    </div>
@endsection
