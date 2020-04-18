+function ($) {
    $(function () {
        $(document)
            .on('click', '[hoe-radio]>.hoe-radio-wrap', function (e) {
                e.preventDefault();

                var $radios = $(this).closest('[hoe-radio]').find('.hoe-radio-wrap');

                var $thisEle = $(this);
                $radios.removeClass('checked');
                $radios.find(':radio').removeAttr('checked');
                $thisEle.addClass('checked');
                $thisEle.find(':radio').attr('checked', true);
                $thisEle.find(':radio').get(0).checked = true;
            });
        $('[hoe-radio]').each(function () {
            var selectedVal = $(this).attr('hoe-radio');
            if (selectedVal != undefined && selectedVal.length > 0) {
                var $radio = $(this).find('.hoe-radio-wrap input[value=' + selectedVal + ']:radio');
                $radio.closest('.hoe-radio-wrap').trigger('click');
            }
        });
    });
}(jQuery);