$(document).ready(function () {

  $('#search').on('keyup', function (e) {
    if (e.keyCode == 13) {
      go();
    }
  });

  $('button').click(function () {
    go();
  });
});


function go() {
  var searchterm = $('#search').val().trim();
  if (!!searchterm) {
    document.location.pathname = '/rooster/' + searchterm;
  }
}
