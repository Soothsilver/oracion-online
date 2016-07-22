/**
 * Represents a player's hand of cards.
 */
class Hand {
    constructor(you, cards) {
        /**
         * Whether this hand's owner is this client.
         * @type boolean
         */
        this.you = you;
        /**
         * Cards in the player's hand.
         * @type Card[] */
        this.cards = cards;
    }

    /**
     * Adds a card as the last card of this hand.
     * @param {Card} card
     */
    add(card) {
        this.cards.push(card);
    }

    /**
     * Gets the on-screen rectangle where cards should be drawn.
     * @returns {Rectangle}
     */
    getRectangle() {
        var element;
        if (this.you) {
            element = $("#yourHand");
        } else {
            element = $("#enemyHand");
        }
        return new Rectangle(element.position().left, element.position().top,
        element.width(), element.height());
    }

    /**
     * Launches animations that move cards around this hand so they are neatly ordered.
     * @param {boolean} quick Whether the animation should be fast.
     */
    reorganize(quick) {
        var fullHand = this.getRectangle();
        var cardWidth = Math.min(150, fullHand.width / this.cards.length);
        for (var i = 0; i < this.cards.length; i++) {
            var expectedPosition = new Rectangle(fullHand.x + i * cardWidth, fullHand.y,
                cardWidth, fullHand.height);
            var card = this.cards[i];
            if (!card.targetPosition.equals(expectedPosition)) {
                card.moveToRectangle(expectedPosition, quick);
            }
        }
    }
}