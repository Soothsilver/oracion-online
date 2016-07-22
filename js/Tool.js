/**
 * Represents a "tool card" that can be attached to a creature to boost its power.
 */
class Tool extends Card {
    constructor(name, color, image) {
        super(name, color,  image);
        /**
         * Modifiers this tool adds to its creature.
         *  @type Modifier[] */
        this.inherentModifiers = [];
    }

    /**
     * Attaches this tool to a creature.
     * @param {Creature} activeCreature
     */
    attachSelfTo(activeCreature) {
        activeCreature.attachedCards.push(this);
        var index = activeCreature.attachedCards.indexOf(this);
        this.moveToRectangle(activeCreature.controller.getToolRectangle(index));
        this.element.css({
           zIndex: session.getLowZIndex()
        })
    }

    /**
     * Determines whether this tool has a specific ability.
     * @param {string} abilityId
     * @returns {boolean}
     */
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