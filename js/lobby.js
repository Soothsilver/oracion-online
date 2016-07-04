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
    $("#inQueueForm").hide();
});
var requestGamesList = function () {
    $.ajax({
        type: "GET",
        dataType: "json",
        data: {
            "ajaxAction" : "listGames"
        },
        success: function (msg) {
            console.log("Games list: " + msg);
        }
    });
};
var requestCreateGame = function () {
    $("#buttonCreateGame").val("Zakládám hru...");
    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            "ajaxAction" : "createGame"
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
            console.log(msg);
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