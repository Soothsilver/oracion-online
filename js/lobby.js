$(document).ready(function() {
    /*
   setInterval(function() {
       heartbeatSend();
   }, 1000);
    */
    setInterval(function() {
        statisticsSend();
    }, 10000);
    setInterval(function () {
        requestGamesList();
    }, 5000);
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
        var gameRepresentation = "Hra " + value.id + " (" + value.firstPlayer + " vs. " + value.secondPlayer + ", status " + value.status + ")";

       var newElement = $("<option></option>")
           .attr("value", value.id).text(gameRepresentation);

        if (value.id == selectedOption) {
            newElement.attr("selected", "selected");
        }
        list.append(newElement);
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
        alert("Nejprve musíte vybrat hru.");
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
                $("#buttonJoinGame").val("Ke hře se nepodařilo připojit (" + msg.reason + "). Zkusit znovu?");
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
            console.log("Game created.");
            console.log(msg);
            if (msg) {
                window.location.href = "?waitForGame=" + msg.id;
            } else {
                $("#buttonCreateGame").val("Hru se nepodařilo vytvořit. Pokusit se znovu?");
            }
        },
        error: function (msg) {
            console.log("Game not created.");
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
var heartbeatSend = function() {
    $.ajax({
        type: "POST",
        data : {
            "ajaxAction" : "heartbeat"
        },
        dataType : "json",
        success: function (msg) {
            console.log(msg);
            if (!msg) {
                logoutTimeouted();
            } else {
                if (msg.queued) {
                    $("#enterQueueForm").hide();
                    $("#inQueueForm").show();
                } else {
                    $("#enterQueueForm").show();
                    $("#inQueueForm").hide();
                }
            }
        }
    })
};