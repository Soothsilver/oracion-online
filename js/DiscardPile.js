/**
 * Represents a player's discard pile. This is analogous to Deck and Hand.
 */
class DiscardPile {
    constructor(you, cards) {
        this.you = you;
        this.cards = cards;
    }
    add(card) {
        this.cards.push(card);
    }
    /**
     * Puts the specified card on top of this discard pile. Initiates the appropriate animation.
     * @type Card */
    discard(card) {
        if (card instanceof Creature) {
            for (var i = 0; i < card.attachedCards.length; i++) {
                var tool = card.attachedCards[i];
                this.add(tool);
                tool.element.css("z-index", session.getHighZIndex());
                tool.moveToRectangle(this.getRectangle());
            }
        }
        this.add(card);
        card.element.css("z-index", session.getHighZIndex());
        card.moveToRectangle(this.getRectangle());
    }
    getRectangle() {
        var element;
        if (this.you) {
            element = $("#yourDiscardPile");
        } else {
            element = $("#enemyDiscardPile");
        }
        return new Rectangle(element.position().left, element.position().top,
        element.width(), element.height());
    }
}