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

const ENDGAME_VICTORY = "victory";
const ENDGAME_DEFEAT = "defeat";
const ENDGAME_DRAW = "draw";
const ENDGAME_DESYNC = "desync";