/**
 * Informs the server via an AJAX call that this client is still connected to the application and still in the lobby.
 */
var heartbeatSend = function() {
    $.ajax({
        type: "POST",
        data : {
            "ajaxAction" : "heartbeat"
        },
        dataType : "json",
        success: function (msg) {
            // Do nothing. We just want to inform the server that we're still connected.
        }
    })
};

$(document).ready(function () {
    setInterval(function() {
        heartbeatSend();
    }, 1000);
});