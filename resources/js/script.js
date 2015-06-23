$(document).ready(function () {

  $('input.search').on('keyup', function (e) {
    if (e.keyCode == 13) {
      go();
    }
  });

  $('button.search').click(function () {
    go();
  });
});


function go() {
  var searchterm = $('.search').val().trim().replace(/\'s Rooster/gi, '');
  if (!!searchterm) {
    document.location.pathname = '/rooster/' + searchterm;
  }
  else {
    document.location.pathname = '/';
  }
}
