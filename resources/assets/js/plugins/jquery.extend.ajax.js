/**
 * Jquery ajax extend.
 */
+function ($) {
    /**
     * API AJAX REQUEST
     * @param url
     * @param params
     * @param callback
     * @param loadingFn
     */
    $.APIAjaxByPost = function (url, params, callback, loadingFn) {
        __AJAX('POST', url, params, callback, loadingFn)
    };

    $.APIAjaxByGet = function (url, params, callback, loadingFn) {
        __AJAX('GET', url, params, callback, loadingFn)
    };

    $.APIAjaxByPut = function (url, params, callback, loadingFn) {
        __AJAX('PUT', url, params, callback, loadingFn)
    };

    $.APIAjaxByDelete = function (url, params, callback, loadingFn) {
        __AJAX('DELETE', url, params, callback, loadingFn)
    };

    function __AJAX(method, url, params, callback, loadingFn) {
        $.ajax({
            type: method,
            dataType: 'json',
            url: url,
            data: params ? params : {},
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function (XMLHttpRequest) {
                typeof loadingFn === "function" && loadingFn(true);
            },
            success: function (data, textStatus) {
                if (typeof callback === "function") {
                    data && data.response ? callback(data.response) : callback(data);
                }
            },
            complete: function (XMLHttpRequest, textStatus) {
                typeof loadingFn === "function" && loadingFn(false);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var msg = XMLHttpRequest.status == 401 ? '您无权调用该功能.' : (errorThrown + '(' + XMLHttpRequest.status + ')');
                console && console.log(msg);
                if (XMLHttpRequest.status == 401) {
                    //window.location.href = "http://money.fromai.cn";
                } else {
                    typeof callback === "function" && callback();
                }
            }
        });
    }
}(jQuery);