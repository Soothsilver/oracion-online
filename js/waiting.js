$(document).ready(function() {
 
});

var requestReturnToLobby = function () {
  $("#buttonCancel").text("Ruším hru...");
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {
      "ajaxAction" : "cancelGameAsCreator",
      "id" : $("#buttonCancel").attr("data-id")
    },
    success: function(msg) {
      if (msg) {
        console.log("Game cancelled.");
        console.log(msg);
        window.location.href = "?";
      } else {
        console.log("Game not cancelled.");
        $("#buttonCancel").text("Hru se nepodařilo zrušit. Zkusit znovu?");
      }
    },
    error: function (msg) {
      console.log("Game not cancelled.");
      $("#buttonCancel").text("Hru se nepodařilo zrušit. Zkusit znovu?");
    }
  });
};