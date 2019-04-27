(function($) {
  ('use strict');
  var allblogs = [];

  $('#blogsearch').keyup(function() {
    var currentValue = $(this)
      .val()
      .toLowerCase();

    var openingHtml = '<ul>';
    var closingHtml = '</ul>';
    resultListItems = [];

    allblogs.forEach(element => {
      if (element.title.toLowerCase().includes(currentValue)) {
        var html =
          '<li>' +
          "<a href='" +
          element.url +
          "'>" +
          element.title +
          '</a></li>';

        resultListItems.push(html);
      }
    });
    console.log(resultListItems.join(''));
    var result = openingHtml + resultListItems.join('') + closingHtml;

    $('#blogPosts').html(result);
  });

  $(window).on('load', function() {
    $.ajax({
      url: '/index.json',
      success: function(result) {
        allblogs = result;
        console.log(result);
      }
    });
  });
})(jQuery);
