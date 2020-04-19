<!-- nav -->
<nav ui-nav class="navi clearfix">
    <ul class="nav" ui-nav>
        <li class="hidden-folded padder m-t m-b-sm text-muted text-xs">
            <span>行情</span>
        </li>
        <li {{ starts_with(request()->getRequestUri(), '/console') ? 'class=active' : '' }}>
            <a href="/console/">
                <i class="glyphicon glyphicon-stats icon" ui-color></i>
                <span>实时行情</span>
            </a>
        </li>
        {{--@foreach(app_menus() as $idx => $top)--}}
            {{--@if(isset($top->children) && count($top->children) > 0)--}}
                {{--@if(!isset($top->isFirst) || !$top->isFirst)--}}
                    {{--<li class="line dk"></li>--}}
                {{--@endif--}}
                {{--@if($top->name)--}}
                    {{--<li class="hidden-folded padder m-t m-b-sm text-muted text-xs">--}}
                        {{--<span>{{ $top->name }}</span>--}}
                    {{--</li>--}}
                {{--@endif--}}
                {{--@foreach($top->children as $item)--}}
                    {{--<li {{ starts_with(request()->getRequestUri(), $item->url) ? 'class=active' : '' }}>--}}
                        {{--<a href="{{ $item->url or '#' }}">--}}
                            {{--@if(isset($item->children) && count($item->children) > 0)--}}
                                {{--<span class="pull-right text-muted">--}}
                                        {{--<i class="fa fa-fw fa-angle-right text"></i>--}}
                                        {{--<i class="fa fa-fw fa-angle-down text-active"></i>--}}
                                    {{--</span>--}}
                                {{--<b class="badge bg-info pull-right">{{ count($item->children) }}</b>--}}
                            {{--@endif--}}

                            {{--@if($item->icon)--}}
                                {{--<i class="{{ $item->icon }}" ui-color></i>--}}
                            {{--@endif--}}
                            {{--<span>{{ $item->name }}</span>--}}
                        {{--</a>--}}

                        {{--@if(isset($item->children) && count($item->children) > 0)--}}
                            {{--<ul class="nav nav-sub dk">--}}
                                {{--@foreach($item->children as $sub)--}}
                                    {{--<li class="nav-sub-header" {{ starts_with(request()->getRequestUri(), $sub->url) ? 'class=active' : '' }}>--}}
                                        {{--<a href="{{ $sub->url or '#' }}">--}}
                                            {{--<span>{{ $sub->name }}</span>--}}
                                        {{--</a>--}}
                                    {{--</li>--}}
                                {{--@endforeach--}}
                            {{--</ul>--}}
                        {{--@endif--}}
                    {{--</li>--}}
                {{--@endforeach--}}
            {{--@else--}}
                {{--@if($top->name)--}}
                    {{--<li {{ starts_with(request()->getRequestUri(), $top->url) ? 'class=active' : '' }}>--}}
                        {{--<a href="{{ $top->url }}">--}}
                            {{--@if($top->icon)--}}
                                {{--<i class="{{ $top->icon }}" ui-color></i>--}}
                            {{--@endif--}}
                            {{--<span title="{{ $top->name }}">{{ $top->name }}{{ request()->getRequestUri() }}</span>--}}
                        {{--</a>--}}
                    {{--</li>--}}
                {{--@endif--}}
            {{--@endif--}}
        {{--@endforeach--}}
    </ul>
</nav>
<!-- nav -->
<!-- / list -->