class QAction {
    constructor(whatToDo, waitForCalm) {
        this.whatToDo = whatToDo;
        this.waitForCalm = waitForCalm;
    }
}
var QWaitForCalm = function () {
  return new QAction(()=>{}, true); 
};
var QDrawCard = function (player, quick = false, wait = true) {
  return new QAction(() => {
      player.drawCard(quick);
  }, wait);
};
var QMiddleBar = function(text) {
    return new QAction(() => {
        setMiddleBar(text);
    }, true);
};
/**
 * @param {Creature} whom
 */
var kill = function (whom) {
    whom.controller.activeCreature = null;
    whom.controller.discardPile.discard(whom);
    whom.controller.deaths++;
    log(whom.controller.getName() + "ův " + whom.toLink() + " je poražen!");
};

/**
 * @param {Creature} whom
 */
var exhaust = function (whom) {
    if (whom.exhausted) {
        if (whom.controller.activeCreature == whom) {
            whom.controller.activeCreature = null;
        }
        log (whom.toLink() + " byl ve hře již příliš dlouho a musí být odhazen.");
        whom.controller.discardPile.discard(whom);
    } else if (whom.god) {
        if (whom.controller.activeCreature == whom) {
            whom.controller.activeCreature = null;
        }
        log (whom.toLink() + " je bůh a tedy vydrží ve hře jen jedno kolo.");
        whom.controller.discardPile.discard(whom);
    }
    whom.exhausted = true;
};
/*
 #yourScore {
 right: 350px;
 top: 380px;
 }
 #enemyScore {
 right: 350px;
 top: 120px;
 }

 */
var defaultScores = [
    {
        right: 350,
        top: 380,
    },
    {
        right: 350,
        top: 120,
    }
];
var createCompleteFunction = function(score) {
    return function () {
        score.css({visibility: "hidden"});
        console.log("complete");
        session.animationCompleted();
    };
};
var createOpacityDecreaseFunction = function(score) {
    return function () {
        score.animate({
            opacity: 0
        }, {
            duration: 400,
            complete: createCompleteFunction(score)
        });
    };
};
var spawnScoreAnimation = function(yours, enemys, result) {
    var yourScore = $("#yourScore");
    var enemyScore = $("#enemyScore");
    var font = 36;
    if (yours == -1) {
        yours = "není bytost";
        font = 8;
    }
    if (enemys == -1) {
        enemys = "není bytost";
        font = 8;
    }
    yourScore.text(yours).removeClass("scoreSuccess").removeClass("scoreFailure");
    enemyScore.text(enemys).removeClass("scoreSuccess").removeClass("scoreFailure");
    if (result == "win") {
        yourScore.addClass("scoreSuccess");
        enemyScore.addClass("scoreFailure");
    } else if (result == "loss") {
        yourScore.addClass("scoreFailure");
        enemyScore.addClass("scoreSuccess");
    } else if (result == "draw") {
        yourScore.addClass("scoreFailure");
        enemyScore.addClass("scoreFailure");
    }
    var size = 100;
    var fontIncrease = 14;
    var widthIncrease = 100;
    var scores = [ yourScore,  enemyScore ];
    for (var i = 0; i < 2; i++) {
        session.animationsInProgress++;
        var score = scores[i];
        score.css({
            right: defaultScores[i].right,
            top: defaultScores[i].top,
            width: size,
            height: size,
            borderRadius: size / 2,
            fontSize: font,
            opacity: 1
        });
        score.animate({
                right: defaultScores[i].right - widthIncrease / 2,
                top: defaultScores[i].top - widthIncrease /2,
                width: size + widthIncrease,
                height: size + widthIncrease,
                borderRadius: (size + widthIncrease) / 2,
                fontSize: font + fontIncrease
            },
            {
                duration: 1500,
                complete: createOpacityDecreaseFunction(score),
            });
        score.css({visibility: 'visible'});
    }
};
var QCombat = function () {
  return new QAction(()=>{
      session.you.activeCreature.recalculateModifiers();
      session.enemy.activeCreature.recalculateModifiers();
      var yourResult = session.you.activeCreature.roll();
      var enemyResult = session.enemy.activeCreature.roll();
      log("<b>Boj!</b> Tvoje útočná síla je <b>" + yourResult.description + "</b>. Soupeřova útočná síla je <b>" + enemyResult.description + "</b>.");
      var yourValue = yourResult.total;
      var enemyValue = enemyResult.total;
      session.phase = PHASE_COMBAT;

      var result = "";
      if (yourValue > enemyValue) result = "win";
      else if (yourValue == enemyValue) result = "draw";
      else if (yourValue < enemyValue) result = "loss";

      spawnScoreAnimation(yourValue, enemyValue, result);

      // Combat resolution:
      session.enqueuePrioritized(new QAction(()=> {

          setMiddleBar("Souboj se vyhodnocuje...");

          switch (result){
              case "win":
                  log("Vyhrál jsi! Soupeřova bytost je poražena.");
                  kill(session.enemy.activeCreature);
                  break;
              case "draw":
                  log("Remíza! Obě bytosti jsou poraženy.");
                  kill(session.you.activeCreature);
                  kill(session.enemy.activeCreature);
                  break;
              case "loss":
                  log("Prohrál jsi. Tvoje bytost je poražena.");
                  kill(session.you.activeCreature);
                  break;
          }
          updateStatistics();

          if (session.you.activeCreature != null) {
              exhaust(session.you.activeCreature);
          }
          if (session.enemy.activeCreature != null) {
              exhaust(session.enemy.activeCreature);
          }

          session.enqueue(QStartTurn());

          session.checkQueue();
     }, true));
  }, true);
};
var QStartTurn = function() {
    return new QAction(() => {
        log("<b>Začíná nové kolo!</b> Oba hráči si líznou kartu.");
        setMiddleBar("Začíná nové kolo....");
        session.phase = PHASE_BEGINNING;
        session.enqueue(QDrawCard(session.you, false, false));
        session.enqueue(QDrawCard(session.enemy, false, false));
        session.enqueue(new QAction(() => {
            if (session.you.activeCreature != null || session.enemy.activeCreature != null) {
                enterKeepTheAncientPhase();
            } else {
                enterSendIntoArenaPhase();
            }

        }, true));
    }, true);
};
var enterKeepTheAncientPhase = function () {
    session.phase = PHASE_KEEP_THE_ANCIENT;
    if (session.you.activeCreature != null) {
        setMiddleBar("Chceš ponechat bytost&nbsp; <b>" + session.you.activeCreature.name + "</b> &nbsp;v aréně?");
        $("#keepButton").show();
        $("#discardButton").show();
    } else {
        setMiddleBar("Soupeř se rozhoduje, jestli ponechat starou bytost v aréně...");
    }
};
var enterSendIntoArenaPhase = function () {
    session.phase = PHASE_SEND_INTO_ARENA;
    $("#keepButton").hide();
    $("#discardButton").hide();
    if (session.you.activeCreature == null) {
        if (hasCreatureInHand(session.you)) {
            setMiddleBar("Vyber a zahraj bytost z ruky!");
        } else {
            setMiddleBar("Nemáš žádnou bytost :(. Zahraj cokoliv... stejně prohraješ bitvu automaticky...");
        }
    } else {
        setMiddleBar("Počkej, než soupeř vyloží bytost z ruky...");
    }
};