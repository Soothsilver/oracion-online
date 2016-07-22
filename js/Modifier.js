/**
 * A modifier is usually a die but may be also a flat modifier or the Ferocity special modifier. In combat, each modifier provides
 * its attack power and whoever's modifiers give the largest sum of attack powers wins the combat.
 */
class Modifier {
    constructor (kind, image, name, value) {
        /**
         * One of the MODIFIER_* constants.
         */
        this.kind = kind;
        /**
         * Die image.
         */
        this.image = image;
        /**
         * Name to be shown to the players.
         */
        this.name = name;
        /**
         * Value used by this modifier to get the resulting attack value. For dice, the value is the number of sides (e.g. 10 for a 10-sided die).
         */
        this.value = value;
    }
    copy () {
        return new Modifier(this.kind,  this.image,  this.name,  this.value);
    }

    /**
     * Gets the attack power of this modifier.
     * @param  {MersenneTwister} twister The RNG to use.
     * @return {number}
     */
    roll (twister) {
        switch (this.kind) {
            case MODIFIER_FLAT:
                return parseInt(this.value);
            case MODIFIER_DICE:
                return twister.between(1, this.value + 1);
            case MODIFIER_FEROCITY:
                var ferocityResult = 0;
                while (true) {
                    var dieRoll = twister.between(1, Number.parseInt(this.value) + 1);
                    ferocityResult = ferocityResult + dieRoll;
                    if (dieRoll == 1 || (dieRoll == 2 && this.value == 10)) {
                        break;
                    }
                }
                return ferocityResult;
            default: 
                console.log("Cannot roll.");
                return -5000;
        }
    }
}
/**
 * Creates a simple 1d6 modifier.
 * @param name Name to be shown to the players.
 * @return {Modifier} The created 1d6 modifier.
 */
var ModifierD6 = function (name) {
  return new Modifier(MODIFIER_DICE, "img/d6.png", name, 6);
};
const MODIFIER_FLAT = "flat";
const MODIFIER_DICE = "dice";
const MODIFIER_FEROCITY = "ferocity";