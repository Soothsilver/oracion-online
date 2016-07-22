/**
 * Represents a player's deck of undrawn cards.
 */
class Deck {
    constructor(you, cards) {
        /**
         * Whether this deck's controller is this client.
         * @type {boolean}
         */
        this.you = you;
        /**
         * Cards in the deck.
         * @type {Card[]}
         */
        this.cards = cards;
    }

    /**
     * Adds a card on top of the deck.
     * @param {Card} card
     */
    add(card) {
        this.cards.push(card);
    }

    /**
     * Gets the on-screen rectanngle of where the deck should be drawn.
     * @returns {Rectangle}
     */
    getRectangle() {
        var element;
        if (this.you) {
            element = $("#yourDeck");
        } else {
            element = $("#enemyDeck");
        }
        return new Rectangle(element.position().left, element.position().top,
        element.width(), element.height());
    }
}