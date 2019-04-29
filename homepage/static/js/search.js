(function($) {
  ('use strict');
  var allblogs = [];

  $('#blogsearch').keyup(function(e) {
    if (e.key === 'Escape') {
      // escape key maps to keycode `27`
      $('#blogPosts').html('');
      return;
    }

    var currentValue = $(this)
      .val()
      .toLowerCase();

    if (!currentValue) {
      $('#blogPosts').html('');
      return;
    }

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
    var result = openingHtml + resultListItems.join('') + closingHtml;

    $('#blogPosts').html(result);
  });

  $(window).on('load', function() {
    $.ajax({
      url: '/index.json',
      success: function(result) {
        if (Array.isArray(result)) {
          allblogs = result;
        } else {
          allblogs = JSON.parse(result);
        }
      }
    });
  });
})(jQuery);
