window.onscroll = function() {
  var scrollingBar = document.getElementById('scrollingbar');

  if (!!scrollingBar) {
    setScrollbarValue(scrollingBar);
  }
};

function setScrollbarValue(scrollingBar) {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  scrollingBar.style.width = scrolled + '%';
}
