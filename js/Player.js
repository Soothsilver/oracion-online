class Player {
    constructor(you, deckname, session) {
        this.deckname = deckname;
        /** @type Session */
        this.session = session;
        /** @type MersenneTwister */
        this.twister = null;
        /** @type Deck */
        this.deck = new Deck(you, []);
        /** @type Hand */
        this.hand = new Hand(you, []);
        this.discardPile = new DiscardPile(you, []);
        this.you = you;
        /** @type Creature */
        this.activeCreature = null;
        /** @type DiceRoller */
        this.roller = null;
        this.deaths = 0;
    }
    getName() {
        if (this.you) {
            return "Hráč";
        } else {
            return "Soupeř";
        }
    }
    artificialIntelligence() {
        if (this.activeCreature == null) {
            var playables = [];
            for (var i = 0; i < this.hand.cards.length; i++) {
                if (isPlayable(this,  this.hand.cards[i])) {
                    playables.push(this.hand.cards[i]);
                }
            }
            var toPlay = playables[this.twister.between(0, playables.length)];
            this.session.incomingMove(new Move(null, false, MOVE_PLAY_CARD, { uniqueIdentifier: toPlay.uniqueIdentifier} ));
        } else if (this.session.you.activeCreature != null && !this.session.enemyWantsToGoToCombat) {
            this.session.incomingMove(new Move(null, false,  MOVE_PROCEED_TO_COMBAT, {}));
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
  for (var i = 0; i < 20; i++) {
      var card = getRandomCard(this.twister);
      card.uniqueIdentifier = this.session.lastUniqueIdentifier;
      card.controller = this;
      this.session.lastUniqueIdentifier++;
      this.session.cardsByUniqueIdentifier[card.uniqueIdentifier] = card;
      this.deck.add(card);
      card.constructSelfDomElement();
      card.moveToRectangle(this.deck.getRectangle());
  }
};