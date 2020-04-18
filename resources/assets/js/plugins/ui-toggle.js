+function ($) {
    $(function () {
        $(document).on('click', '[ui-toggle]', function (e) {
            e.preventDefault();
            var $this = $(e.target);
            $this.attr('ui-toggle') || ($this = $this.closest('[ui-toggle]'));
            var $target = $($this.attr('target')) || $this;
            $target.toggleClass($this.attr('ui-toggle'));

            var $folderIcon = $this.children('i');
            if ($folderIcon.hasClass('fa-dedent')) {
                $folderIcon.removeClass('fa-dedent').addClass('fa-indent');
            } else {
                $folderIcon.removeClass('fa-indent').addClass('fa-dedent');
            }
        });
    });
}(jQuery);