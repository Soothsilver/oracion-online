$(document).ready(function() {
   setInterval(function() {
       heartbeatSend();
   }, 1000);
    setInterval(function() {
        statisticsSend();
    }, 10000);
    heartbeatSend();
    statisticsSend();
    $("#inQueueForm").hide();
});
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
var requestEnterQueue = function() {
  $("#enterQueueForm").hide();
  $("#inQueueForm").show();
  $.ajax({
        type: "POST",
        data : {
            "ajaxAction" : "changeQueueState",
            "targetState" : "true"
        }
  });
};
var requestCancelQueue = function() {
    $("#enterQueueForm").show();
    $("#inQueueForm").hide();
    $.ajax({
       type: "POST",
       data : {
           "ajaxAction" : "changeQueueState",
           "targetState" : "false"
       }
    });
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