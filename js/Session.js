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
    this.highIndex = 2;
    this.lowIndex = -2;
    /** @type QAction[] */
    this.queue = [];
};
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
      }
  }
};
/**
 * @param {Player} player
 * @param {Card} card
 */
Session.prototype.playCard = function (player, card) {
    if (player.activeCreature == null) {
        player.activeCreature = card;
        player.activeCreature.flip(false);
        player.hand.cards.remove(card);
        player.hand.reorganize(false);
        if (player.you) {
            log ("Zahrál jsi bytost " + card.toLink() + ".");
        } else if (player) {
            log ("Soupeř zahrál bytost lícem dolů.");
        }
        card.moveToRectangle(player.getArenaRectangle(), false);
        this.canWeMoveToMainPhase();

        if (!this.local) {
            this.sendMove(new Move(null, true, MOVE_PLAY_CARD, { uniqueIdentifier: card.uniqueIdentifier }));
        }
        this.checkQueue();
    }
};
/**
 * @param {Move} move
 */
Session.prototype.sendMove = function (move) {
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
            console.log("Move sent.");
        },
        error: function (msg) {
            console.log("Move failed to send. We are now in desync.");
        }
    });
};
Session.prototype.click = function (card)  {
    if (this.queue.length != 0) {
        return; // Wait until it's calm.
    }
    if (isPlayable(this.you, card)) {
        this.playCard(this.you, card);
    }
};
Session.prototype.checkQueue = function () {
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
Session.prototype.incomingMove = function (move) {
  switch (move.type) {
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
          console.log("A request arrived.");
          if (move.yours) break;
          var capturedThis = this;
          var theCard = this.cardsByUniqueIdentifier[move.argument.uniqueIdentifier];
          console.log(this.cardsByUniqueIdentifier);
          console.log(theCard);
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