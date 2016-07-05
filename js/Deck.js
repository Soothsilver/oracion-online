class Deck {
    constructor(you, cards) {
        this.you = you;
        this.cards = cards;
    }
    add(card) {
        this.cards.push(card);
    }
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