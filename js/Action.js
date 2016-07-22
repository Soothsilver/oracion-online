/**
 * Represents an "action card" which is played from hand, performs its effect and is discarded.
 */
class Action extends Card {
    constructor(name, color, image) {
        super(name, color,  image);
        /**
         * The spell ability this card has, if any.
         * @type {string}
         */
        this.spellAbility = null;
        /**
         * Abilities which the action grants to its controller's active creature.
         * @type {Ability[]}
         */
        this.addToSelf = [];
        /**
         * Negative abilities which the action inflicts upon the opponent's active creature.
         * @type {Ability[]}
         */
        this.addToEnemy = [];
    }

    /**
     * Performs the effect of this action.
     * @param {Creature} yours The controller's active creature.
     * @param {Creature} his The opponent's active creature.
     *
     * The following spell abilities exist:
        Liznout:  Lízni si dvě karty.
        Soptik: Oživení (Počet tvých vyřazených bytostí se sníží o 1.)
        ListovaBritva: Kouzlo -- lízni si kartu a ukaž ji soupeři. Pokud je to bytost, máš o 2 šestistěnné kostky navíc.

     *
     * Other action card effects are handled via granting or inflicting abilities upon creatures. It is an error to add an ability
     * to an Action card but such may happen in a corner-case scenario. Javascript should be able to handle it with only notice-level errors.
     */
    execute(yours, his) {
        console.log("Executing action");
        for (var i = 0; i < this.addToSelf.length; i++) {
            yours.acquiredAbilities.push(this.addToSelf[i]);
        }
        for (i = 0; i < this.addToEnemy.length; i++) {
            his.acquiredAbilities.push(this.addToEnemy[i]);
        }
        if (this.spellAbility == "Liznout") {
            log("Pomocí karty Líznout (ale jen málo) si hráč líznul 2 karty.");
            session.enqueue(QDrawCard(yours.controller, false, true));
            session.enqueue(QDrawCard(yours.controller, false, true));
        } else if (this.spellAbility == "Soptik") {
            log("Pomocí karty Soptíkova superschopnost se snížil počet mrtvých bytostí.");
            yours.controller.deaths--;
            updateStatistics();
        } else if (this.spellAbility == "ListovaBritva") {
            var card = yours.controller.deck.cards[yours.controller.deck.cards.length-1];
            log("Pomocí karty Listová břitva byla odhalena karta " + card.toLink() + ".");
            session.enqueue(QDrawCard(yours.controller, false, true));
            if (card instanceof Creature) {
                yours.acquiredAbilities.push(new Ability("ListovaBritvaBonus", 2, true));
            }
        }
    }
} 