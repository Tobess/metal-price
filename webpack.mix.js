let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
    .scripts([
        'resources/assets/js/core/jquery.min.js',
        'resources/assets/js/core/bootstrap.js',
        'resources/assets/js/plugins/ui-load.js',
        'resources/assets/js/plugins/ui-jp.config.js',
        'resources/assets/js/plugins/ui-jp.js',
        'resources/assets/js/plugins/ui-nav.js',
        'resources/assets/js/plugins/ui-toggle.js',
        'resources/assets/js/plugins/ui-screenfull.js',
        'resources/assets/js/plugins/ui-scroll-to.js',
        'resources/assets/js/plugins/ui-device.js',
        'resources/assets/js/plugins/ui-include.js',
        'resources/assets/js/plugins/ui-color.js',
        'resources/assets/js/plugins/ui-tab.js',
        'resources/assets/js/plugins/ui-editor.js',
        'resources/assets/js/plugins/ui-area.js',
        'resources/assets/js/plugins/ui-radio.js',
        'resources/assets/js/plugins/jquery.extend.ajax.js'
    ], 'public/js/app.js')
    .sass('resources/assets/sass/app.scss', 'public/css/app.css')
    .copy('resources/assets/js/libs', 'public/libs')
    .copy('resources/assets/images', 'public/images')
    .copy('resources/assets/css/goods-edit.css', 'public/css');
