class Creature extends Card {


    constructor(name, color, image, dice) {
        super(name, color,  image);
        this.dice = dice;
        this.exhausted = false;
        this.god = false;
        this.ex = false;
        this.inherentModifiers = [];
        /** @type Player */
        this.controller = null;
        /** @type Modifier[] */
        this.modifiers = [];
        /** @type Tool[] */
        this.attachedCards = [];
    }

    /**
     *
     * @returns Ability[]
     */
    getAbilities() {
        return [].concat(this.inherentAbilities);
    }
    hasAbility(abilityId) {

        var abilities = this.getAbilities();
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].id == abilityId) {
                return true;
            }
        }
        return false;
    }

    preroll() {
        
    }
    postroll (victory) {

        var abilities = this.getAbilities();
        for (var i = 0; i < abilities.length; i++) {
            var ability = abilities[i];
            ability.postroll(victory, this);
        }
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
    rollTwister(twister) {
        var total = 0;
        for (var i = 0; i < this.modifiers.length; i++) {
            var modifier = this.modifiers[i];
            total += modifier.roll(twister);
        }
        return total;
    }

    recalculateModifiers() {
        // Basic
        this.modifiers = [];
        for (var i = 0; i < this.inherentModifiers.length; i++) {
            this.modifiers.push(this.inherentModifiers[i]);
        }

        // Tools
        for ( i = 0; i < this.attachedCards.length; i++) {
            for (var j = 0; j < this.attachedCards[i].inherentModifiers.length; j++) {
                this.attachedCards[i].inherentModifiers[j].name = this.attachedCards[i].name;
                this.modifiers.push(this.attachedCards[i].inherentModifiers[j]);
            }
        }

        // Abilities
        var abilities = this.getAbilities();
        for ( i = 0; i < abilities.length; i++) {
            abilities[i].modifySelfModifiers(this, this.modifiers);
        }


        // Empowerment
        for ( i = 0; i < this.controller.empowerment; i++) {
            this.modifiers.push(ModifierD6("Posílení z minulého kola"));
        }

        // Enemy intervention
        var enemyCreature = this.controller.session.enemy.activeCreature == this ?
            this.controller.session.you.activeCreature : this.controller.session.enemy.activeCreature;
        if (enemyCreature != null) {
            // Type bonus
            var myType = this.color;
            var enemyType = enemyCreature.color;
            if (myType == "Leaf" && enemyType == "Water") {
                this.modifiers.push(ModifierD6("Výhoda lesních proti vodním"));
            } else if (myType == "Fire" && enemyType == "Leaf") {
                this.modifiers.push(ModifierD6("Výhoda ohně proti lesu"));
            } else if (myType == "Water" && enemyType == "Fire") {
                this.modifiers.push(ModifierD6("Výhoda vody proti ohni"));
            }

            var friendlyAbilities = this.getAbilities();
            for ( i = 0; i < friendlyAbilities.length; i++) {
                friendlyAbilities[i].modifySelfAgainstEnemyModifiers(this, this.modifiers);
            }
            // Abilities
            var enemyAbilities = enemyCreature.getAbilities();
            for ( i = 0; i < enemyAbilities.length; i++) {
                enemyAbilities[i].modifyEnemyModifiers(enemyCreature, this, this.modifiers);
            }
        }
    }
}