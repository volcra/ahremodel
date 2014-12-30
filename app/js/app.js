(function ($) {
    'use strict';

    $(function () {
        $(document).foundation();

        if (!Modernizr.touch) {
            new WOW().init();
        }

        $('.year').html(new Date().getFullYear());
    });
})(jQuery);
