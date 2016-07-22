// This file is loaded only in the waiting-for-second-player view.

$(document).ready(function() {
  setInterval(function () {
    requestHasSomebodyJoined();
  }, 5000);
});


/**
 * Sends an AJAX polling request to see if a player joined the game. If yes, it redirects to the ingame screen and starts the game.
 */
var requestHasSomebodyJoined = function () {
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {
      "ajaxAction" : "hasSomebodyJoined",
      "id" : $("#buttonCancel").attr("data-id")
    },
    success: function(msg) {
      if (msg.success) {
        //noinspection JSUnresolvedVariable
          if (msg.joined) {
          console.log("Game joined");
          window.location.href = "?game=" + $("#buttonCancel").attr("data-id");
        } else {
          console.log("Game not joined yet.");
          console.log(msg);
        }
      } else {
        console.log("Game not joined yet - failure.");
      }
    }
  });
};
/**
 * Sends an AJAX request to cancel the game. If successful, returns the client to the lobby.
 */
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
        if (msg.success) {
          console.log("Game cancelled.");
          console.log(msg);
          window.location.href = "?";
        } else {
          $("#buttonCancel").text("Hru se nepodařilo zrušit (" + msg.reason + "). Zkusit znovu?");
        }
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