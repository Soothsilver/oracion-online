class Creature extends Card {


    constructor(name, color, image, dice) {
        super(name, color,  image);
        this.dice = dice;
        this.exhausted = false;
        this.god = false;
        this.ex = false;
        this.inherentModifiers = [];
        /** @type Modifier[] */
        this.modifiers = [];
    }

    roll() {
        var total = 0;
        var description = "";
        for (var i = 0; i < this.modifiers.length; i++) {
            var modifier = this.modifiers[i];
            if (description != "") {
                description += "+";
            }
            var value = modifier.roll(this.controller.twister);
            total += value;
            description += value;
        }
        description = "[" + description + "=" + total + "]";
        return {
            total: total,
            description: description
        };
    }

    recalculateModifiers() {
        this.modifiers = [];
        for (var i = 0; i < this.inherentModifiers.length; i++) {
            this.modifiers.push(this.inherentModifiers[i]);
        }
        var enemyCreature = this.controller.session.enemy.activeCreature == this ?
            this.controller.session.you.activeCreature : this.controller.session.enemy.activeCreature;
        if (enemyCreature != null) {
            var myType = this.color;
            var enemyType = enemyCreature.color;
            if (myType == "Leaf" && enemyType == "Water") {
                this.modifiers.push(ModifierD6("Výhoda lesních proti vodním"));
            } else if (myType == "Fire" && enemyType == "Leaf") {
                this.modifiers.push(ModifierD6("Výhoda ohně proti lesu"));
            } else if (myType == "Water" && enemyType == "Fire") {
                this.modifiers.push(ModifierD6("Výhoda vody proti ohni"));
            }
        }
    }
}