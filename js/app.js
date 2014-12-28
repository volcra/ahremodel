(function ($) {
    "use strict";

    $(function () {
        // foundation
        $(document).foundation();
        // WOW
        new WOW().init();
        $('.year').html(new Date().getFullYear());
        /*
         var animate = function () {
         requestAnimationFrame(animate);
         // modified to support foundation plugins
         $('.wow.animated').each(function () {
         var box = $(this);
         if (box.hasClass('animated') && box.css('visibility') === 'visible') {
         setTimeout(function () {
         box.removeClass('animated').removeClass(box.data('animation')).removeAttr('style');
         }, 1000);
         }
         });
         };

         requestAnimationFrame(animate);
         */
    });
})(jQuery);