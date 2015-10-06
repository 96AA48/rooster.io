//Nothing to see here folks
$(document).ready(function () {
  var day = (new Date()).getDay() - 1;
  $('#wrapper').scrollLeft($(document).width() * day);
});
