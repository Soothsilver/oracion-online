class Tool extends Card {
    constructor(name, color, image, dice) {
        super(name, color,  image);
        this.dice = dice;
        this.inherentModifiers = [];
    }
}