class Tool extends Card {
    constructor(name, color, image, dice) {
        super(name, color,  image);
        this.dice = dice;
        /** @type Modifier[] */
        this.inherentModifiers = [];
    }
    attachSelfTo(activeCreature) {
        activeCreature.attachedCards.push(this);
        var index = activeCreature.attachedCards.indexOf(this);
        this.moveToRectangle(activeCreature.controller.getToolRectangle(index));
        this.element.css({
           zIndex: session.getLowZIndex()
        })
    }
    hasAbility(abilityId) {

        var abilities = this.inherentAbilities;
        for (var i = 0; i < abilities.length; i++) {
            if (abilities[i].id == abilityId) {
                return true;
            }
        }
        return false;
    }
}