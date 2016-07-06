class Ability {
    constructor (id, value, isMagic) {
        this.id = id;
        this.value = value;
        this.isMagic = isMagic;
    }

    /**
     *
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
    /*
    CREATURES:
    ----------------
    
    ID's:
    Ferocity(6/10)
  *  Empowerment(x)
  *  SingleTurn
  *  VictoryHeals: Oživení (Pokud vyhraješ, počet tvých vyřazených bytostí se sníží o 1.)
    MagicSuppression
    EnemyBestIsZero: Počítej, jako by na jedné ze soupeřových nejsilnějších kostek padlo 0
    AgainstEvilD6(x)
    AgainstEvilPlus3 <-- on tool
    Undying Pokud prohraje, Černokněžník se nepočítá jako mrtvý.

    OnlyWaterAndPsychic: statni vlajka
    OnlyLeafAndFire

   * Lupic: Pokud vyhraješ souboj, lízni si 2 karty.
    PrerostlyPavouk: Pokud na některé soupeřově kostce padne více než 10, počítej, jako by na ní padlo jen 10.
    Rozkopu: Síla bytosti se mění na 10. Žádné jeho bonusy či kostky nefungují.
   * ZabitASnist:  Pokud vyhraješ tento souboj, lízni si 4 karty.


    SPELLS:

    Liznout:  Lízni si dvě karty.
    Soptik: Oživení (Počet tvých vyřazených bytostí se sníží o 1.)
    ListovaBritva: Kouzlo -- lízni si kartu a ukaž ji soupeři. Pokud je to bytost, máš o 2 šestistěnné kostky navíc.
     */
}