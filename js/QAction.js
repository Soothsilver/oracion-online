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
    updateStatistics();
};
var updateStatistics = function () {
  $("#yourDeaths").text(session.you.deaths);
  $("#enemyDeaths").text(session.enemy.deaths);
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
    }
    whom.exhausted = true;
};
var QCombat = function () {
  return new QAction(()=>{
      var yourResult = session.you.roller.roll(session.you.activeCreature.dice);
      var enemyResult = session.enemy.roller.roll(session.enemy.activeCreature.dice);
      log("<b>Boj!</b> Tvoje útočná síla je <b>" + yourResult + "</b>. Soupeřova útočná síla je <b>" + enemyResult + "</b>.");
      var yourValue = yourResult.getTotal();
      var enemyValue = enemyResult.getTotal();
      var result = "";
      if (yourValue > enemyValue) result = "win";
      else if (yourValue == enemyValue) result = "draw";
      else if (yourValue < enemyValue) result = "loss";      

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
      
      if (session.you.activeCreature != null) {
          exhaust(session.you.activeCreature);
      }
      if (session.enemy.activeCreature != null) {
          exhaust(session.enemy.activeCreature);
      }

      session.enqueue(QStartTurn());

      session.checkQueue();
      
  }, true);
};
var QStartTurn = function() {
    return new QAction(() => {
        log("<b>Začíná nové kolo!</b> Oba hráči si líznou kartu.");
        setMiddleBar("Začíná nové kolo....");
        session.enqueue(QDrawCard(session.you, false, false));
        session.enqueue(QDrawCard(session.enemy, false, false));
        session.enqueue(new QAction(() => {
            if (hasCreatureInHand(session.you)) {
                setMiddleBar("Vyber a zahraj bytost z ruky!");
            } else {
                setMiddleBar("Nemáš žádnou bytost :(. Zahraj cokoliv... stejně prohraješ bitvu automaticky...");
            }
        }, true));
    }, true);
};