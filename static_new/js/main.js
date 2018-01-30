/**
 * Created by vlupoaie on 7/6/2016.
 */

$(window).scroll(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});

$(window).resize(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});
