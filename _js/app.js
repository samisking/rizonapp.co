// ^ Back to top
// -------------

var root  = /firefox|trident/i.test(navigator.userAgent) ? document.documentElement : document.body,
    links = document.querySelectorAll("a.js--scroll-to"),
    i     = links.length;

var easeInOutCubic = function(t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t*t + b
  return c/2*((t-=2)*t*t + 2) + b
}

while (i--) {
  links.item(i).addEventListener("click", function(e) {
    var startTime;
    var startPos = root.scrollTop;
    var elScrollTo = document.getElementById(/[^#]+$/.exec(this.href)[0]);
    var endPos = elScrollTo.getBoundingClientRect().top;
    var maxScroll = root.scrollHeight - window.innerHeight;
    var scrollEndValue = startPos + endPos < maxScroll ? endPos : maxScroll - startPos;
    var duration = 500;

    var scroll = function(timestamp) {
      startTime = startTime || timestamp;
      var elapsed = timestamp - startTime;
      var progress = easeInOutCubic(elapsed, startPos, scrollEndValue, duration);
      root.scrollTop = progress;
      elapsed < duration && requestAnimationFrame(scroll);
    }

    requestAnimationFrame(scroll);
    e.preventDefault();

    if (elScrollTo.nodeName == 'INPUT') {
      elScrollTo.focus();
    }

  });
}
