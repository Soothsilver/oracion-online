class Modifier {
    constructor (kind, image, name, value) {
        this.kind = kind;
        this.image = image;
        this.name = name;
        this.value = value;
    }

    /**
     * @param  {MersenneTwister} twister
     */
    roll (twister) {
        switch (this.kind) {
            case MODIFIER_FLAT:
                return parseInt(this.value);
            case MODIFIER_DICE:
                return twister.between(1, this.value + 1);
            default: 
                console.log("Cannot roll.");
                return -5000;
        }
    }
}
var ModifierD6 = function (name) {
  return new Modifier(MODIFIER_DICE, "img/d6.png", name, 6);
};
const MODIFIER_FLAT = "flat";
const MODIFIER_DICE = "dice";
const MODIFIER_FEROCITY = "ferocity";