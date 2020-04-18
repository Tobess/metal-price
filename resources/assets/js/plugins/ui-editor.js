(function ($) {
    "use strict";

    function initEditor(eleId) {
        var CKEDITOR = CKEDITOR || window.CKEDITOR;
        var wysiwygareaAvailable = isWysiwygareaAvailable();

        var editorElement = CKEDITOR.document.getById(eleId);

        // Depending on the wysiwygare plugin availability initialize classic or inline editor.
        if (wysiwygareaAvailable) {
            CKEDITOR.replace(eleId);
        } else {
            editorElement.setAttribute('contenteditable', 'true');
            CKEDITOR.inline(eleId);

            // TODO we can consider displaying some info box that
            // without wysiwygarea the classic editor may not work.
        }
    };

    function isWysiwygareaAvailable() {
        // If in development mode, then the wysiwygarea must be available.
        // Split REV into two strings so builder does not replace it :D.
        if (CKEDITOR.revision == ( '%RE' + 'V%' )) {
            return true;
        }

        return !!CKEDITOR.plugins.get('wysiwygarea');
    }

    $(function () {
        var $editors = $("[ui-editor]");
        if ($editors.length > 0) {
            uiLoad.load(jp_config.ckeditor).then(function () {
                var CKEDITOR = CKEDITOR || window.CKEDITOR;
                if (CKEDITOR.env.ie && CKEDITOR.env.version < 9) {
                    CKEDITOR.tools.enableHtml5Elements(document);
                }

                CKEDITOR.config.language = 'zh-cn';
                //CKEDITOR.config.uiColor = '#AADC6E';

                // The trick to keep the editor in the sample quite small
                // unless user specified own height.
                CKEDITOR.config.extraPlugins = 'autogrow';
                CKEDITOR.config.autoGrow_minHeight = 200;
                //CKEDITOR.config.autoGrow_maxHeight = 600;
                CKEDITOR.config.width = 'auto';

                $editors.each(function () {
                    initEditor($(this).attr('id'));
                });
            });

            $editors.on('editor', function () {
                initEditor($(this).attr('id'));
            })
        }
    });


})(jQuery);
