(function ($) {
	"use strict";

    uiLoad.load(jp_config.screenfull);
	$(document).on('click', '[ui-fullscreen], [data-ui-fullscreen]', function (e) {
		e.preventDefault();
		if (screenfull.enabled) {
		  screenfull.toggle();
		}
	});
})(jQuery);
