$(document).ready(function() {
    loadCardlist(function () {
        session = new Session($("#id").val());
        $(document).bind('keydown', 'ctrl+shift+s', function () {
           for (var i = 0; i < session.enemy.cards.length; i++) {
               session.enemy.cards[i].flip(true);
           }
        });
        if (session.gameId == "0") {
            incomingMove(new Move(0, true, MOVE_LOAD_DECK, $("#deck").val()));
            incomingMove(new Move(0, false, MOVE_LOAD_DECK, $("#deck").val()));
            incomingMove(new Move(0, true, MOVE_RANDOM_SEED, Math.floor(Math.random() * (2000000))));
            session.local = true;
            session.enemyIsAi = true;
        } else {
            setInterval(function () {
                requestUpdate();
            }, 500);
        }
    });
});

var fightButton = function () {
   session.confirmNoFurtherActions(session.you);
};
var keepButton = function () {
    session.keepTheAncient(session.you);
};
var discardButton = function () {
    session.discardTheAncient(session.you);
};

var visualTwister = new MersenneTwister();

/** @type Session */
var session;

var log = function (text) {
    $("#log").html(text + "<br>" + $("#log").html());
};

var setMiddleBar = function (text) {
    $("#middlebar").html(text);
};
var incomingMove = function (move) {
    log("<b>Incoming: </b>" + move.type + ": " + JSON.stringify(move.argument));
    session.incomingMove(move);
    if (move.id > session.lastMoveId) {
        session.lastMoveId  = move.id;
    }
};
var moveFromPhpArray = function (phpMove) {
    return new Move(phpMove.id, phpMove.yours, phpMove.moveType, phpMove.moveArgument);
};
var handleUpdates = function (moves) {
  for (var index = 0; index < moves.length; index++) {
      incomingMove(moveFromPhpArray(moves[index]));
  }
};
var updateRequested = false;
var requestUpdate = function () {
    if (!updateRequested && !session.gameover) {
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                "ajaxAction": "getMoves",
                "gameId": session.gameId,
                "lastMoveId": session.lastMoveId
            },
            success: function (msg) {
                console.log(msg);
                handleUpdates(msg);
                updateRequested = false;
            },
            error: function (msg) {
                console.log("Error.");
                console.log(msg.responseText);
                updateRequested = false;
            },
            timeout: 8000
        });
    }
};