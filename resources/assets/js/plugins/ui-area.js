(function ($) {
	"use strict";
	$(function () {
		if ($('[ui-area]').length > 0) {
		    var $areaEle = $('[ui-area]');
			var sourceUrl = $areaEle.attr('ui-area') || '/api/data/areas';
			var useHintOption = 'Yes' == $areaEle.attr('area-hint');
			if (sourceUrl && sourceUrl.length > 0) {
				// 初始化加载省份选择项目
                $(window).load(function () {
                	var $this = $('[ui-area] [area-province]'),
						selected = $this.attr('area-province') || '0';
                    $.get(sourceUrl, {'parent':0}, function (result) {
						if (result && result.data && result.data.length > 0) {
							var $html = useHintOption ? ['<option value="0">--请选择省份--</option>'] : [];
							$(result.data).each(function (k, v) {
                                $html.push('<option value="' + v.id + '"' + (v.id.toString() == selected ? 'selected' : '') + '>' + v.name + '</option>');
                            });

							$this.html($html.join(''));
                            $this.trigger('change');
						}
                    });
                });
                // 更新城市选择列表
                $('[ui-area] [area-province]').change(function () {
                    var $this = $(this),
						selProvince = $this.val() || '0';
                    var $cityEle = $('[ui-area] [area-city]'),
						selCity = $cityEle.val() || '0';

                    $this.attr('area-province', selProvince);

                    var $html = useHintOption ? ['<option value="0">--请选择城市--</option>'] : [];

                    if (selProvince > 0) {
                        $.get(sourceUrl, {'parent': selProvince}, function (result) {
                            if (result && result.data && result.data.length > 0) {
                                $(result.data).each(function (k, v) {
                                    $html.push('<option value="' + v.id + '"' + (v.id.toString() == selCity ? 'selected' : '') + '>' + v.name + '</option>');
                                });

                                $cityEle.html($html.join(''));
                                $cityEle.trigger('change');
                            }
                        });
                    } else {
                        $cityEle.html($html.join(''));
                        $cityEle.trigger('change');
					}
                });
                // 更新地区选择列表
                $('[ui-area] [area-city]').change(function () {
                    var $this = $(this),
                        selCity = $this.val() || '0';
                    var $distEle = $('[ui-area] [area-district]'),
                        selDist = $distEle.val() || '0';

                    $this.attr('area-city', selCity);

                    var $html = useHintOption ? ['<option value="0">--请选择地区--</option>'] : [];

                    if (selCity > 0) {
                        $.get(sourceUrl, {'parent': selCity}, function (result) {
                            if (result && result.data && result.data.length > 0) {
                                $(result.data).each(function (k, v) {
                                    $html.push('<option value="' + v.id + '"' + (v.id.toString() == selDist ? 'selected' : '') + '>' + v.name + '</option>');
                                });

                                $distEle.html($html.join(''));
                                $distEle.trigger('change');
                            }
                        });
                    } else {
                        $distEle.html($html.join(''));
                    }
                });
                // 更新地区选择列表
                $('[ui-area] [area-district]').change(function () {
                    var $this = $(this),
                        selDist = $this.val() || '0';

                    $this.attr('area-district', selDist);
                });
            }
        }
    })
})(jQuery);
