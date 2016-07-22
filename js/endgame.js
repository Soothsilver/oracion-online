/**
 * Causes the game to end.
 *
 * @param {string} kind How did the game end for the client? In victory, defeat, draw or desync? Use the ENDGAME_* constants.
 * @param {string} reason Additional information to be displayed to the user.
 */
Session.prototype.endTheGame = function (kind, reason) {
    this.gameover = true;
    if (kind == ENDGAME_VICTORY) {
        if (!this.local) {
            $.ajax({
                type: "POST",
                dataType: "json",
                data: {
                    "ajaxAction": "achieveVictory"
                },
                success: function (msg) {
                    // Do nothing.
                }
            });
        }
    }

    if (!this.local) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: {
                "ajaxAction": "terminateGame",
                "gameId": this.gameId
            },
            success: function (msg) {
                // Do nothing.
            }
        });
    }
    $("#endgame-reason").text(reason);
    $("#endgame-panel").show();

};
/**
 * Updates the numbers in the left-side statistics panel. Also tests whether the game should end because of the rules and if so,
 * ends the game.
 */
var updateStatistics = function () {
    $("#yourDeaths").text(session.you.deaths);
    $("#enemyDeaths").text(session.enemy.deaths);
    if (session.you.deaths >= session.you.deathsToLose) {
        if (session.enemy.deaths >= session.enemy.deathsToLose) {
            session.endTheGame(ENDGAME_DRAW, "Hra skončila remízou, protože poslední bytost obou hráčů byla vyřazena ve stejném boji.");
        } else {
            session.endTheGame(ENDGAME_DEFEAT, "Prohrál jsi, protože již bylo vyřazeno příliš mnoho tvých bytostí.");
        }
    } else {
        if (session.enemy.deaths >= session.enemy.deathsToLose) {
            session.endTheGame(ENDGAME_VICTORY, "Vyhrál jsi, protože jsi vyřadil dostatečné množství soupeřových bytostí.");
        }
    }
};

/**
 * The game ended with victory for this client.
 * @type {string}
 */
const ENDGAME_VICTORY = "victory";
/**
 * The game ended in defeat for this client.
 * @type {string}
 */
const ENDGAME_DEFEAT = "defeat";
/**
 * The game ended in a tie.
 * @type {string}
 */
const ENDGAME_DRAW = "draw";
/**
 * The game ended because of a synchronization error, probably because the server was momentarily (or permanently) offline.
 * @type {string}
 */
const ENDGAME_DESYNC = "desync";