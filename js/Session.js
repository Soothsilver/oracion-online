var Session = function (gameId) {
    this.gameId = gameId;
    this.lastMoveId = -1;
    this.you = null;
    this.enemy = null;
    this.local = false;
    this.enemyIsAi = false;
    this.yourRandom = null;
    this.enemyRandom = null;
    this.decksLoaded = 0;
    this.randomsLoaded = 0;
    this.animationsInProgress = 0;
    this.showOffCard = null;
    this.youAreGameCreator = false;
    this.iWantToGoToCombat = false;
    this.enemyWantsToGoToCombat = false;
    this.lastUniqueIdentifier = 0;
    this.cardsByUniqueIdentifier = {};
    this.highIndex = 401;
    this.gameover = false;
    this.phase = PHASE_BEGINNING;
    this.lowIndex = 399;
    this.toBeSentQueue = [];
    this.sendingInProgress = false;
    this.hasBeenReceivedQueue = [];
    /** @type QAction[] */
    this.queue = [];
    var capturedThis = this;
    $(".ingamefull").on("mouseenter", ".autocard", function (event) {
        var cardId = event.target.getAttribute("data-card");
        var card = capturedThis.cardsByUniqueIdentifier[cardId];
        capturedThis.showOffCard = card;
        $("#showoff").attr("src", card.image).show();
    });
    $(".ingamefull").on("mouseleave", ".autocard", function (event) {
        var cardId = event.target.getAttribute("data-card");
        var card = capturedThis.cardsByUniqueIdentifier[cardId];
        if (capturedThis.showOffCard == card) {
            $("#showoff").hide();
            capturedThis.showOffCard = null;
        }
    });
};
const PHASE_BEGINNING = "beginning";
const PHASE_KEEP_THE_ANCIENT = "keep the ancient";
const PHASE_SEND_INTO_ARENA = "send into arena";
const PHASE_MAIN = "main phase";
const PHASE_COMBAT = "combat";
Session.prototype.getHighZIndex = function () {
    this.highIndex++;
    return this.highIndex;
};
Session.prototype.getLowZIndex = function () {
    this.lowIndex--;
    return this.lowIndex;
};
/**
 * @param {Player} player
 */
Session.prototype.confirmNoFurtherActions = function (player) {
  if (player.you) {
      log ("Již nechceš hrát žádné další karty.");
      $("#fightButton").addClass("disabledFightButton");
      $("#fightButton").attr("disabled", true);
      this.iWantToGoToCombat = true;
      setMiddleBar("Čekám, než se soupeř rozhodne přejít do boje...");
      if (!this.local) {
          this.sendMove(new Move(null, true, MOVE_PROCEED_TO_COMBAT, { /* checksum here*/ }));
      }
  } else {
      log ("Soupeř již nechce hrát žádné další karty.");
      this.enemyWantsToGoToCombat = true;
  }
  if (this.iWantToGoToCombat && this.enemyWantsToGoToCombat) {
      this.enqueue(QCombat());
  }
  this.checkQueue();
};
Session.prototype.canWeMoveToMainPhase = function () {
  if (this.you.activeCreature != null) {
      if (this.enemy.activeCreature == null) {
          setMiddleBar("Počkej, než soupeř vyloží bytost...");
      } else {
          // Move to phase 2.
          this.you.activeCreature.flip(true);
          this.enemy.activeCreature.flip(true);
          log ("Soupeřovou bytostí je " + this.enemy.activeCreature.toLink() + ".");
          setMiddleBar("Hraj nástroje nebo akce, nebo klikni 'Do boje!'");
          $("#fightButton").removeClass("disabledFightButton");
          $("#fightButton").attr("disabled", false);
          this.iWantToGoToCombat = false;
          this.enemyWantsToGoToCombat = false;
          this.phase = PHASE_MAIN;

      }
  }
};
/**
 * @param {Player} player
 * @param {Card} card
 */
Session.prototype.playCard = function (player, card) {
    player.hand.cards.remove(card);
    player.hand.reorganize(false);
    
    if (player.activeCreature == null) {
        player.activeCreature = card;
        player.activeCreature.flip(false);
        if (player.you) {
            log ("Zahrál jsi bytost " + card.toLink() + ".");
        } else if (player) {
            log ("Soupeř zahrál bytost lícem dolů.");
        }
        card.moveToRectangle(player.getArenaRectangle(), false);
        this.canWeMoveToMainPhase();


        this.checkQueue();
    } else if (card instanceof Tool) {
        card.attachSelfTo(player.activeCreature);
        card.flip(true);
        log(player.getName() + " přiložil nástroj " + card.toLink() + " ke své bytosti v aréně.");
    } else if (card instanceof Action) {
        card.flip(true);
        player.discardPile.discard(card);
        log(player.getName()+ " použil akci " + card.toLink() + ".");
        var enemy = player.you ? session.enemy : this.you;
        card.execute(player.activeCreature, enemy.activeCreature);
    } else if (card instanceof Creature) {
        card.flip(true);
        log(player.getName() + " povýšil svoji bytost na " + card.toLink() + ".");
        card.moveToRectangle(player.getArenaRectangle(), false);
        var oldActive = player.activeCreature;
        player.activeCreature = card;
        card.acquiredAbilities = oldActive.acquiredAbilities;
        card.attachedCards = oldActive.attachedCards;
        oldActive.attachedCards = [];
        player.discardPile.discard(oldActive);
    }
    if (!this.local && player.you) {
        this.sendMove(new Move(null, true, MOVE_PLAY_CARD, { uniqueIdentifier: card.uniqueIdentifier }));
    }
};
/**
 * @param {Move} move
 */
Session.prototype.sendMove = function (move) {
    this.toBeSentQueue.push(move);
    if (!this.sendingInProgress) {
        this.launchSend();
    }
};
Session.prototype.launchSend = function () {
    if (this.sendingInProgress) return;
    if (this.toBeSentQueue.length == 0) return;
    this.sendingInProgress = true;
    var move = this.toBeSentQueue.shift();
    var theSession = this;
    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            "ajaxAction": "move",
            "gameId": this.gameId,
            "moveType": move.type,
            "moveArgument": JSON.stringify(move.argument)
        },
        success: function (msg) {
            if (msg && msg != "false") {
                console.log("Move sent.");
                console.log("Move was:");
                console.log(move);
                theSession.sendingInProgress = false;
                theSession.launchSend();
            } else {
                console.log("Move failed to send. We are now in desync.");
                console.log("Move was:");
                console.log(move);
                console.log("Reason is because reply was false, probably due to database deconnection: ");
                console.log(msg);
                theSession.endTheGame(ENDGAME_DESYNC, "Nepodařilo se odeslat naši akci, čímž byla způsobena desynchronizace. Pravděpodobná příčina je, že se nepodařilo připojit k databázi." )
            }
        },
        error: function (msg) {
            console.log("Move failed to send. We are now in desync.");
            console.log("Move was:");
            console.log(move);
            console.log("Reason follows: ");
            console.log(msg);
            theSession.endTheGame(ENDGAME_DESYNC, "Nepodařilo se odeslat naši akci, čímž byla způsobena desynchronizace." )
        }
    });
};
Session.prototype.click = function (card)  {
    if (this.gameover) {
        return; // Game has already ended.
    }
    if (this.queue.length != 0) {
        return; // Wait until it's calm.
    }

    if (this.phase == PHASE_SEND_INTO_ARENA || this.phase == PHASE_MAIN) {
        if (isPlayable(this.you, card)) {
            this.playCard(this.you, card);
        }
    }
};
/**
 * @param {Player} player
 */
Session.prototype.updateModifiers = function (player) {
    var elements = player.you ? $("#yourModifiers") : $("#enemyModifiers");
    player.activeCreature.recalculateModifiers();
    for (var i = 0; i < player.activeCreature.modifiers.length; i++) {
        var modifier = player.activeCreature.modifiers[i];
        var element = $("<div></div>").addClass('modifier');
        var img = $("<img>");
        img.attr("src", modifier.image);
        element.append(img);
        element.append(modifier.name);
        elements.append(element);
    }
};
Session.prototype.calculateVictoryChance = function(yours, his) {
    var repetitionCount = 5000;
    var successes = 0;
    for (var i = 0; i < repetitionCount; i++) {
        var yourNum = yours.rollTwister(visualTwister);
        var hisNum = his.rollTwister(visualTwister);
        if (yourNum > hisNum) {
            successes++;
        }
    }
    return Math.round(100 * successes / repetitionCount);
};
Session.prototype.stateBased = function () {
    for (var i =0 ; i < this.you.cards.length; i++) {
        var crd = this.you.cards[i];
        if (isPlayable(this.you, crd)) {
            crd.element.addClass("playable");
        } else {
            crd.element.removeClass("playable");
        }
    }

    $("#yourModifiers").html("");
    $("#enemyModifiers").html("");
    $("#victoryChance").html("");
    var creaturesWhoHaveModifiers = 0;
    if (this.phase == PHASE_MAIN) {
        if (this.you.activeCreature != null) {
            this.updateModifiers(this.you);
            creaturesWhoHaveModifiers++;
        }
        if (this.enemy.activeCreature != null && !this.enemy.activeCreature.facedown) {
            this.updateModifiers(this.enemy);
            creaturesWhoHaveModifiers++;
        }
        if (creaturesWhoHaveModifiers == 2) {
            $("#victoryChance").html("Tvoje šance na výhru je zhruba <b>" + this.calculateVictoryChance(this.you.activeCreature, this.enemy.activeCreature) + "%</b>.");
        }
    }
};
Session.prototype.checkQueue = function () {
   this.stateBased(); 
   if (this.queue.length > 0) {
       var top = this.queue[0];
       if (top.waitForCalm) {
           if (this.animationsInProgress == 0) {
               this.queue.shift();
               top.whatToDo();
               this.checkQueue();
           }
       } else {
           this.queue.shift();
           top.whatToDo();
           this.checkQueue();
       }
   } else {
       if (this.enemyIsAi) {
            this.enemy.artificialIntelligence();
            if (this.queue.length > 0) {
                this.checkQueue();
            }
       }
   }
};
/**
 * @param {QAction} qaction
 */
Session.prototype.enqueue = function (qaction) {
  this.queue.push(qaction);
};
Session.prototype.enqueuePrioritized = function (qaction) {
    this.queue.splice(0, 0, qaction);
};
Session.prototype.animationCompleted = function () {
  this.animationsInProgress--;
  this.checkQueue();
};
Session.prototype.gameStarts = function ()  {
  log ("Sestavuji balíčky...");
  setMiddleBar("Míchám balíčky...");
    if (this.youAreGameCreator) {
        this.you.constructDeck();
        this.enemy.constructDeck();
    }
    else {
        this.enemy.constructDeck();
        this.you.constructDeck();
    }
  this.enqueue(new QAction(()=>{
          for (var i =0; i < this.enemy.deck.cards.length; i++) {
             this.enemy.deck.cards[i].flip(false);
            }
          for ( i =0; i < this.you.deck.cards.length; i++) {
              this.you.deck.cards[i].flip(false);
          }
      }, true));
    this.enqueue(QMiddleBar("Hráči si lížou počáteční ruku..."));
    for (var i = 0; i < 4; i++) {
        this.enqueue(QDrawCard(this.you, false, false));
        this.enqueue(QDrawCard(this.enemy, false, false));
    }
    this.enqueue(QStartTurn());
  this.checkQueue();
};
Session.prototype.canWeBeginNow = function () {
    if (this.decksLoaded == 2) {
        if (this.randomsLoaded == 2) {
            this.you.twister = this.yourRandom;
            this.you.roller = new DiceRoller(this.you.twister);
            this.enemy.twister = this.enemyRandom;
            this.enemy.roller = new DiceRoller(this.enemy.twister);
            this.gameStarts();
        } else {
            log("Čekám, než soupeř potvrdí náhodné semínko...");
        }
    } else {
        log("Čekám, než soupeř potvrdí svůj balíček...");
    }
};
Session.prototype.keepTheAncient = function (player) {
    log("<b>" + player.getName() + "</b> si ponechává ve hře svoji starou bytost, " + player.activeCreature.toLink() + ".");
    enterSendIntoArenaPhase();
    if (!this.local && player.you){
        this.sendMove(new Move(null, true,  MOVE_KEEP_THE_ANCIENT, {})); // TODO checksum
    }
    this.enqueuePrioritized(QWaitForCalm());
    this.checkQueue();
    // TODO multiplayer
};
Session.prototype.discardTheAncient = function (player) {
  var ancient = player.activeCreature;
  log("<b>" + player.getName() + "</b> odhodil svoji starou bytost, " + ancient.toLink() + ".");
    if (!this.local && player.you){
        this.sendMove(new Move(null, true,  MOVE_DISCARD_THE_ANCIENT, {})); // TODO checksum
    }
  player.discardPile.discard(ancient);
  player.activeCreature = null;
  enterSendIntoArenaPhase();
  this.enqueuePrioritized(QWaitForCalm());
  this.checkQueue();
    // TODO multiplayer
};
Session.prototype.incomingMove = function (move) {
  switch (move.type) {
      case MOVE_KEEP_THE_ANCIENT:
          if (move.yours) break;
          this.keepTheAncient(this.enemy);
          break;
      case MOVE_DISCARD_THE_ANCIENT:
          if (move.yours) break;
          this.discardTheAncient(this.enemy);
          break;
      case MOVE_LOAD_DECK:
          if (move.yours) {
              this.you = new Player(true, move.argument, this);
          } else {
              this.enemy = new Player(false, move.argument, this);
          }
          this.decksLoaded++;
          this.canWeBeginNow();
          break;
      case MOVE_RANDOM_SEED:
          var twister = new MersenneTwister(move.argument);
          var twister1 = new MersenneTwister(twister.genrand_int32());
          var twister2 = new MersenneTwister(twister.genrand_int32());
          if (move.yours) {
              this.yourRandom = twister1;
              this.enemyRandom = twister2;
              this.youAreGameCreator = true;
          } else {
              this.yourRandom = twister2;
              this.enemyRandom = twister1;
              this.youAreGameCreator = false;
          }
          this.randomsLoaded = 2;
          this.canWeBeginNow();
          break;
      case MOVE_PLAY_CARD:
          if (move.yours) break;
          var capturedThis = this;
          var theCard = this.cardsByUniqueIdentifier[move.argument.uniqueIdentifier];
          this.enqueue(new QAction(()=>{
              capturedThis.playCard(capturedThis.enemy, theCard);
          }, true));
          this.checkQueue();
          break;
      case MOVE_PROCEED_TO_COMBAT:
            // check checksum
          var capturedThis = this;
          if (move.yours) break;

          this.enqueue(new QAction(()=>{
              capturedThis.confirmNoFurtherActions(capturedThis.enemy);
          }, true));
          this.checkQueue();
          break;
      default:
          log("Unrecognized action: " + move.type);
          break;
  }
};