/**
 * An ability is defined by an ability ID which is a string such as "Empowerment" and, optionally an argument. For example,
 * "Empowerment" with argument "3" corresponds to the ability "Posílení +3". Only creatures and tools can have abilities. Actions either
 * grant abilities to creatures or have "spell abilities" which are handled by a different class (Action.js).
 *
 This is a full list of ability keywords:

 CREATURES:

 *  Ferocity(6/10)
 *  Empowerment(x)
 *  SingleTurn
 *  VictoryHeals: Oživení (Pokud vyhraješ, počet tvých vyřazených bytostí se sníží o 1.)
 *  MagicSuppression
 *  EnemyBestIsZero: Počítej, jako by na jedné ze soupeřových nejsilnějších kostek padlo 0
 *  AgainstEvilD6(x)
 *  AgainstEvilPlus3 <-- on tool
 *  PrerostlyPavouk: Pokud na některé soupeřově kostce padne více než 10, počítej, jako by na ní padlo jen 10.
 *  Rozkopu: Síla bytosti se mění na 10. Žádné jeho bonusy či kostky nefungují.
 *  Undying Pokud prohraje, Černokněžník se nepočítá jako mrtvý.

 *  OnlyWaterAndPsychic: statni vlajka
 *  OnlyLeafAndFire

 * Lupic: Pokud vyhraješ souboj, lízni si 2 karty.
 * ZabitASnist:  Pokud vyhraješ tento souboj, lízni si 4 karty.

 SPELLS:

 * Liznout:  Lízni si dvě karty.
 * Soptik: Oživení (Počet tvých vyřazených bytostí se sníží o 1.)
 * ListovaBritva: Kouzlo -- lízni si kartu a ukaž ji soupeři. Pokud je to bytost, máš o 2 šestistěnné kostky navíc.
 */
class Ability {
    constructor (id, value, isMagic) {
        /**
         * The ability's ID string such as "Empowerment".
         * @type string
         */
        this.id = id;
        /**
         * The argument for this ability, if any.
         * @type int
         */
        this.value = value;
        /**
         * Whether this ability is suppressed by magic suppression.
         * @type boolean
         */
        this.isMagic = isMagic;
    }

    /**
     * This event triggers after a combat roll.
     * @param {string} victory
     * @param {Creature} source
     */
    postroll(victory, source) {
        if (this.id == "Ferocity") {

        }
        if (this.id == "Empowerment") {
            source.controller.empowerment = this.value;
        }
        if (this.id == "VictoryHeals" && victory == "win") {
            source.controller.deaths--;
        }
        if (this.id == "Undying" && victory != "win") {
            source.controller.deaths--;
        }
        if (this.id == "Lupic" && victory == "win") {
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
        }
        if (this.id == "ZabitASnist" && victory == "win") {
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
            session.enqueuePrioritized(QDrawCard(source.controller, false, true));
        }
    }

    /**
     * This event triggers when modifiers are determined for the owner.
     * @param {Creature} self The creature that has this ability.
     * @param {Modifier[]} modifiers
     */
    modifySelfModifiers(self, modifiers) {
        if (this.id == "Ferocity") {
            modifiers.push(new Modifier(MODIFIER_FEROCITY, "img/ferocity.png","Zuřivost " + this.value, this.value));
        }
        if (this.id == "ListovaBritvaBonus") {
            modifiers.push(ModifierD6("Listová břitva"));
            modifiers.push(ModifierD6("Listová břitva"));
        }
    }

    /**
     * This event triggers when modifiers are determined for the owner and an enemy creature is in the arena.
     * @param {Creature} self The creature that has this ability.
     * @param {Creature} enemy The enemy creature in the arena, guaranteed to be nonnull.
     * @param {Modifier[]} modifiers
     */
    modifySelfAgainstEnemyModifiers(self, enemy, modifiers) {
        if (enemy.evil == "true" || enemy.color == "Darkness") {
            if (this.id == "AgainstEvilD6") {
                for (var i = 0; i < this.value; i++) {
                    modifiers.push(ModifierD6("Bonus proti zlu"));
                }
            }
            if (this.id == "AgainstEvilPlus3") {
                modifiers.push(new Modifier(MODIFIER_FLAT, "img/dPlus.png", "Meč: bonus proti zlu", 3));
            }
        }
    }

    /**
     * This event triggers when modifiers are determined for the opposing creature.
     * @param {Creature} self The creature that has this ability.
     * @param {Creature} enemy The opposing creature whose modifiers are being determined.
     * @param {Modifier[]} modifiers
     */
    modifyEnemyModifiers(self, enemy, modifiers) {
        if (this.id == "EnemyBestIsZero") {
            for (var i = 0; i < modifiers.length; i++) {
                if (modifiers[i].kind == MODIFIER_DICE) {
                    modifiers[i].kind = MODIFIER_FLAT;
                    modifiers[i].value = 0;
                    modifiers[i].name = "Zrušeno soupeřem";
                    break;
                }
            }
        }
    }
}