(function($) {
    var $wn = $(window);
    ('use strict');
    $(window).on('load', function() {
        function getFormattedDate(date) {
            var todayTime = new Date(date);
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            return day + '.' + month + '.' + year;
        }
console.log("dadsadas");
        $.ajax({
            url: 'https://offering.solutions/blog/search.json',
            success: function(result) {
                var obj = JSON.parse(result);
                var firstThree = obj.slice(0, 3);
                firstThree.forEach(function(element) {
                    var html =
                        "<div class='col-pd-3 single-post'>" +
                        "<div class='row post-header filter'>" +
                        "<img src='images/blog-preview.jpg' alt=''>" +
                        '</div>' +
                        "<div class='row post-body'>" +
                        "<p class='date'>" +
                        getFormattedDate(element.date) +
                        '</p>' +
                        "<h3><a href='" +
                        element.url +
                        "'>" +
                        element.title +
                        '</a></h3>' +
                        "<div class='seperator'></div>" +
                        "<a href='" +
                        element.url +
                        "'>Read More <i class='fa fa-long-arrow-right' aria-hidden='true'></i></a>" +
                        '</div>' +
                        '</div>';

                    $('#blogPosts').append(html);
                }, this);
            }
        });
    });
})(jQuery);
