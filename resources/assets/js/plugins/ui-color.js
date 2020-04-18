+function ($) {
    $(function () {
        $("[ui-color]").each(function () {
            var self = $(this);
            var options = eval('[' + self.attr('ui-color') + ']');
			var cls = 'warning lter'

			self.addClass('text-' + cls.replace(' ', '-'));
        });
    });
}(jQuery);