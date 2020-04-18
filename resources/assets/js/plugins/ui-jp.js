+function ($) {
    $(function () {
        $("[ui-jq]").each(function () {
            var self = $(this);
            var plugin = self.attr('ui-jq');
            if (plugin && jp_config.hasOwnProperty(plugin)) {
                var options = eval('[' + self.attr('ui-options') + ']');

                if ($.isPlainObject(options[0])) {
                    options[0] = $.extend({}, options[0]);
                }

                uiLoad.load(jp_config[plugin]).then(function () {
                    self[plugin].apply(self, options);
                });
            }
        });

        $(document).on('ui-jq', function (event, plugin, config) {
            if (plugin && jp_config.hasOwnProperty(plugin)) {
                var self = $(event.target);
                var options = [];

                if ($.isPlainObject(config)) {
                    options[0] = $.extend({}, config);
                }

                uiLoad.load(jp_config[plugin]).then(function () {
                    self[plugin].apply(self, options);
                });
            }
        });
    });
}(jQuery);