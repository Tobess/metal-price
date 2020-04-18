+function ($) {
    $(function () {
        $(document)
            .on('click', '[ui-tab]>ul.nav.nav-tabs>li', function (e) {
                e.preventDefault();

                var $tabs = $("[ui-tab]>ul.nav.nav.nav-tabs>li");

                var $thisEle = $(this),
                    $thisIdx = $tabs.index($thisEle);
                $tabs.removeClass('active');
                $thisEle.addClass('active');

                var $tabBoxes = $("[ui-tab] div.tab-content div.tab-pane");
                $tabBoxes.removeClass('active');
                $($tabBoxes.get($thisIdx)).addClass('active');
            });

    });
}(jQuery);