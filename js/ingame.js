$(document).ready(function() {
    loadCardlist(function () {
        session = new Session($("#id").val());
        // Cheat codes.
        $(document).bind('keydown', 'ctrl+shift+s', function () {
           for (var i = 0; i < session.enemy.cards.length; i++) {
               session.enemy.cards[i].flip(true);
           }
        });
        $(document).bind('keydown', 'ctrl+shift+f', function () {
            if (slowCardMovementTime < 500) {
                slowCardMovementTime = 500;
            } else {
                slowCardMovementTime = 100;
            }
        });
        if (session.gameId == "0") {
            // This is a local game against an AI.
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

// The following three functions are events triggered when the player presses a button.

var fightButton = function () {
   session.confirmNoFurtherActions(session.you);
};
var keepButton = function () {
    session.keepTheAncient(session.you);
};
var discardButton = function () {
    session.discardTheAncient(session.you);
};

/**
 * This RNG is used for animation and such that don't need to be synchronized across both clients.
 * @type {MersenneTwister}
 */
var visualTwister = new MersenneTwister();

/**
 * This global variable contains the current duel session.
 * @type Session */
var session;

/**
 * Adds a line of text to the ingame log.
 * @param text
 */
var log = function (text) {
    $("#log").html(text + "<br>" + $("#log").html());
};
/**
 * Replaces the text in the middle left bar that tells the player what they should do.
 * @param text
 */
var setMiddleBar = function (text) {
    $("#middlebar").html(text);
};

// The following functions handles polling the server for updates from the opponent.

/**
 * This is called when a new move arrives from the server or from the AI.
 * @param {Move} move
 */
var incomingMove = function (move) {
    session.incomingMove(move);
    if (move.id > session.lastMoveId) {
        session.lastMoveId  = move.id;
    }
};
/**
 * Creates a Javascript move from the AJAX json.
 */
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