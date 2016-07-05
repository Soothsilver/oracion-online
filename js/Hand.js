class Hand {
    constructor(you, cards) {
        this.you = you;
        /** @type Card[] */
        this.cards = cards;
    }
    add(card) {
        this.cards.push(card);
    }

    /**
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