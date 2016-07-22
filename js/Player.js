/**
 * Represents one of the two players.
 */
class Player {
    constructor(you, deckname, session) {
        /**
         * The name of this player's deck, used to create the deck.
         * @type string
         */
        this.deckname = deckname;
        /**
         * The duel this player participates in.
         * @type Session */
        this.session = session;
        /**
         * The mersenne twister initialized with this player's random seed.
         * @type MersenneTwister */
        this.twister = null;
        /** @type Deck */
        this.deck = new Deck(you, []);
        /** @type Hand */
        this.hand = new Hand(you, []);
        /** @type DiscardPile */
        this.discardPile = new DiscardPile(you, []);
        /**
         * How many creatures must this player lose before he loses
         * @type {number}
         */
        this.deathsToLose = 4;
        /**
         * Whether this player is the client.
         * @type {boolean}
         */
        this.you = you;
        /**
         * All cards belonging to this player.
         * @type {Card[]}
         */
        this.cards = [];
        /** @type Creature */
        this.activeCreature = null;
        this.deaths = 0;
        this.empowerment = 0;
    }
    getName() {
        if (this.you) {
            return "Hráč";
        } else {
            return "Soupeř";
        }
    }
    artificialIntelligence() {
        if (this.session.gameover) {
            // Nothing to be done.
        }
        else if (this.session.phase == PHASE_KEEP_THE_ANCIENT) {
            if (this.activeCreature == null) {
                // Just wait for the player.
            } else {
                // Always keep.
                this.session.incomingMove(new Move(null, false,  MOVE_KEEP_THE_ANCIENT, {}));
            }
        }
        else if (this.activeCreature == null && this.session.phase == PHASE_SEND_INTO_ARENA) {
            var playables = [];
            for (var i = 0; i < this.hand.cards.length; i++) {
                if (isPlayable(this,  this.hand.cards[i])) {
                    playables.push(this.hand.cards[i]);
                }
            }
            var toPlay = playables[this.twister.between(0, playables.length)];
            this.session.incomingMove(new Move(null, false, MOVE_PLAY_CARD, { uniqueIdentifier: toPlay.uniqueIdentifier} ));
        } else if (this.session.phase == PHASE_MAIN) {
            var playables = [];
            for (var i = 0; i < this.hand.cards.length; i++) {
                if (isPlayable(this,  this.hand.cards[i])) {
                    playables.push(this.hand.cards[i]);
                }
            }
            if (playables.length > 0) {
                var toPlay = playables[this.twister.between(0, playables.length)];
                this.session.incomingMove(new Move(null, false, MOVE_PLAY_CARD, { uniqueIdentifier: toPlay.uniqueIdentifier} ));
            }
            else if (!this.session.enemyWantsToGoToCombat) {
                this.session.incomingMove(new Move(null, false,  MOVE_PROCEED_TO_COMBAT, {}));
            }
        }
    }
    getArenaRectangle() {
        var element;
        if (this.you) {
            element = $("#yourArena");
        } else {
            element = $("#enemyArena");
        }
        return new Rectangle(element.position().left, element.position().top,
            element.width(), element.height());
    }
    getToolRectangle(index) {
    var element;
    if (this.you) {
        element = $("#yourArena");
    } else {
        element = $("#enemyArena");
    }
    return new Rectangle(element.position().left - (1+ index) * 50, element.position().top,
        element.width(), element.height());
    }
    drawCard(quick = true) {
        if (this.deck.cards.length == 0) {
            // V praxi, s našimi balíčky, se nemůže stát, že balíček došel.
        } else {
            log ("<i><b>" + this.getName() + "</b> si líznul kartu.</i>");
            var topCard = this.deck.cards.pop();
            if (this.you) {
                topCard.flip(true);                
            }
            this.hand.add(topCard);
            this.hand.reorganize(quick);
        }
    }
}


Player.prototype.constructDeck = function () {
    log ("Sestavuji balíček...");
  for (var i = 0; i < 40; i++) {
      var card;
      if (this.deckname == "random") {
          card = getRandomCard(this.twister);
      } else if (this.deckname == "tools") {
          card = getRandomCard(this.twister);
          var tries = 0;
          while (!(card instanceof Tool) && tries < 10) {
              card = getRandomCard(this.twister);
              tries = tries + 1;
          }
      } else if (this.deckname == "advanced") {
          card = getRandomCard(this.twister);
          var tries = 0;
          while ((card instanceof Creature) && (!card.ex) && (card.inherentAbilities.length == 0 || card.hasOwnAbility("Empowerment")) && tries < 20) {
              card = getRandomCard(this.twister);
              tries = tries + 1;
          }
      } else if (this.deckname == "basic") {
          card = getRandomCard(this.twister);
          var tries = 0;
          while ((card instanceof Creature) && (card.color != "Leaf" && card.color != "Fire" && card.color != "Water") && tries < 20) {
              card = getRandomCard(this.twister);
              tries = tries + 1;
          }
      } else {
          console.log("unknown deck name");
      }
      card.uniqueIdentifier = this.session.lastUniqueIdentifier;
      card.controller = this;
      this.cards.push(card);
      this.session.lastUniqueIdentifier++;
      this.session.cardsByUniqueIdentifier[card.uniqueIdentifier] = card;
      this.deck.add(card);
      card.constructSelfDomElement();
      card.moveToRectangle(this.deck.getRectangle());
  }
};