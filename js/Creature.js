class Creature extends Card {


    constructor(name, color, image, dice) {
        super(name, color,  image);
        this.dice = dice;
        this.exhausted = false;
        this.god = false;
        this.ex = false;
        this.inherentModifiers = [];
        this.acquiredAbilities = [];
        /** @type Player */
        this.controller = null;
        /** @type Modifier[] */
        this.modifiers = [];
        /** @type Tool[] */
        this.attachedCards = [];
    }

    isSuppressed() {
        var enemyCreature = this.controller.session.enemy.activeCreature == this ?
            this.controller.session.you.activeCreature : this.controller.session.enemy.activeCreature;
        if (enemyCreature != null) {
            if ( enemyCreature.hasOwnAbility("MagicSuppression") ) return true;
            for (var i = 0; i < this.attachedCards.length; i++) {
                var tool = this.attachedCards[i];
                for (var j = 0; j < tool.inherentAbilities.length; j++) {
                    if (tool.inherentAbilities[j].id == "MagicSuppression") {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     *
     * @returns Ability[]
     */
    getAbilities() {
        var rAbilities = [].concat(this.inherentAbilities).concat(this.acquiredAbilities);

        for (var i = 0; i < this.attachedCards.length; i++) {
            var tool = this.attachedCards[i];
            rAbilities = rAbilities.concat(tool.inherentAbilities);
        }

        var sAbilities = [];
        if (this.isSuppressed()) {
            for (var j = 0 ; j < rAbilities.length; j++) {
                if (!rAbilities[j].isMagic) {
                    sAbilities.push(rAbilities[j]);
                }
            }
            return sAbilities;
        } else {
            return rAbilities;
        }
    }
    hasOwnAbility(abilityId) {

        var abilities = this.inherentAbilities.concat(this.acquiredAbilities);
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].id == abilityId) {
                return true;
            }
        }
        return false;
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
            this.modifiers.push(this.inherentModifiers[i].copy());
        }

        // Tools
        for ( i = 0; i < this.attachedCards.length; i++) {
            for (var j = 0; j < this.attachedCards[i].inherentModifiers.length; j++) {
                this.attachedCards[i].inherentModifiers[j].name = this.attachedCards[i].name;
                this.modifiers.push(this.attachedCards[i].inherentModifiers[j].copy());
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
                friendlyAbilities[i].modifySelfAgainstEnemyModifiers(this, enemyCreature, this.modifiers);
            }
            // Abilities
            var enemyAbilities = enemyCreature.getAbilities();
            for ( i = 0; i < enemyAbilities.length; i++) {
                enemyAbilities[i].modifyEnemyModifiers(enemyCreature, this, this.modifiers);
            }
        }
        // Final modifications
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].id == "Rozkopu") {
                this.modifiers.length = 0;
                this.modifiers.push(new Modifier(MODIFIER_FLAT, "img/dPlus.png", "Rozkopán (+10)", 10));
            }
        }
    }
}