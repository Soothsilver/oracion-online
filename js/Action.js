class Action extends Card {
    constructor(name, color, image) {
        super(name, color,  image);
        this.spellAbility = null;
        this.addToSelf = [];
        this.addToEnemy = [];
    }

    /**
     * 
     * @param {Creature} yours
     * @param {Creature} his
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
        /*
         SPELLS:

         Liznout:  Lízni si dvě karty.
         Soptik: Oživení (Počet tvých vyřazených bytostí se sníží o 1.)
         ListovaBritva: Kouzlo -- lízni si kartu a ukaž ji soupeři. Pokud je to bytost, máš o 2 šestistěnné kostky navíc.
         */
} 