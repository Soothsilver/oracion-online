$(document).ready(function() {



    setInterval(function() {
        statisticsSend();
    }, 4000);
    setInterval(function () {
        requestGamesList();
    }, 4000);
    /*
    heartbeatSend();
    */
    statisticsSend();
    requestGamesList();
    $("#inQueueForm").hide();
});
var gamesList = null;
function updateGamesList(newList) {
    var list = $("#games");
    var selectedOption = $("#games").val();
    list.empty();
    $.each(newList, function (key,value) {
        if (value.status == 1) {
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
var requestPlayAI = function () {
    window.location.href = "?game=AI&deck=" + $("#deck").val();
};
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
var statisticsSend = function() {
    $.ajax({
        type: "GET",
        url: "?ajaxAction=getStatistics",
        dataType : "json",
        success: function(msg) {
            console.log(msg);
            // Parse statistics
            $("#gameCount").text(msg.gamesPlayed);
            $("#gameVictories").text(msg.gamesWon);
            $("#numOnline").text(msg.onlineCount);
        }
    })
};
function logoutTimeouted() {
   // window.location.reload();
}
