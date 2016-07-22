// This file is loaded only in the lobby view.
$(document).ready(function() {
    setInterval(function() {
        statisticsSend();
    }, 4000);
    setInterval(function () {
        requestGamesList();
    }, 4000);
    statisticsSend();
    requestGamesList();
});

/**
 * Updates the games listbox with new games from the server.
 * @param newList
 */
function updateGamesList(newList) {
    var list = $("#games");
    var selectedOption = $("#games").val();
    list.empty();
    $.each(newList, function (key,value) {
        if (value.status == 1) {
            //noinspection JSUnresolvedVariable
            var gameRepresentation = "Hra " + value.id + " (" + value.firstPlayer + ", čeká na hráče)";
            var newElement = $("<option></option>")
                .attr("value", value.id).text(gameRepresentation);

            if (value.id == selectedOption) {
                newElement.attr("selected", "selected");
            }
            list.append(newElement);
        }
    });
}
/**
 * Sends an AJAX request to obtain new games list from the server and updates the listbox with those games.
 */
var requestGamesList = function () {
    $.ajax({
        type: "GET",
        dataType: "json",
        data: {
            "ajaxAction" : "listGames"
        },
        success: function (msg) {
            updateGamesList(msg);
        }
    });
};
/**
 * Redirects the client to the ingame screen in order to play locally against an AI.
 */
var requestPlayAI = function () {
    window.location.href = "?game=AI&deck=" + $("#deck").val();
};
/**
 * Sends an AJAX request to join an existing game. If successful, redirects the player to the ingame screen.
 */
var requestJoinGame = function () {
    var selectedOption = $("#games").val();
    if (!selectedOption) {
        $("#buttonJoinGame").val("Nejprve musíte vybrat hru. Zkusit znovu?");
        return;
    }
    $("#buttonJoinGame").val("Připojuji se ke hře...");
    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            "ajaxAction" : "joinGame",
            "deck": $("#deck").val(),
            "id": selectedOption
        },
        success: function(msg) {
            console.log("Game joined.");
            console.log(msg);
            if (msg.success) {
                window.location.href = "?game=" + selectedOption;
            } else {
                $("#buttonJoinGame").val("Ke hře se nepodařilo připojit (databáze offline?). Zkusit znovu?");
            }
        },
        error: function (msg) {
            $("#buttonJoinGame").val("Ke hře se nepodařilo připojit. Zkusit znovu?");
        }
    });
};
/**
 * Sends an AJAX request to create a new game and redirects the player to the waiting screen until another player joins.
 */
var requestCreateGame = function () {
    $("#buttonCreateGame").val("Zakládám hru...");
    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            "ajaxAction" : "createGame",
            "deck": $("#deck").val()
        },
        success: function(msg) {
            console.log(msg);
            if (msg) {
                window.location.href = "?waitForGame=" + msg.id;
            } else {
                $("#buttonCreateGame").val("Hru se nepodařilo vytvořit. Pokusit se znovu?");
            }
        },
        error: function (msg) {
            console.log(msg);
            $("#buttonCreateGame").val("Hru se nepodařilo vytvořit. Pokusit se znovu?");
        }
    });
};
/**
 * Sends an AJAX request to destroy the session and moves the player back to the login screen.
 */
var requestLogout = function() {
    $.ajax({
        type: "POST",
        data: {
            "ajaxAction" : "logout"
        },
        success: function(msg) {
            console.log(msg);
            if (msg == "success") {
                console.log("Logged out (as client sees).");
                window.location.href = "?";
            }
        }
    })
};
/**
 * Sends an AJAX request to get some information about the player and the number of logged-in users and displays the results
 * on the screen.
 */
var statisticsSend = function() {
    $.ajax({
        type: "GET",
        url: "?ajaxAction=getStatistics",
        dataType : "json",
        success: function(msg) {
            console.log(msg);
            // Parse statistics
            //noinspection JSUnresolvedVariable
            $("#gameCount").text(msg.gamesPlayed);
            //noinspection JSUnresolvedVariable
            $("#gameVictories").text(msg.gamesWon);
            //noinspection JSUnresolvedVariable
            $("#numOnline").text(msg.onlineCount);
        }
    })
};