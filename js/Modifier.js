class Modifier {
    constructor (kind, image, name, value) {
        this.kind = kind;
        this.image = image;
        this.name = name;
        this.value = value;
    }
    copy () {
        return new Modifier(this.kind,  this.image,  this.name,  this.value);
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
var ModifierD6 = function (name) {
  return new Modifier(MODIFIER_DICE, "img/d6.png", name, 6);
};
const MODIFIER_FLAT = "flat";
const MODIFIER_DICE = "dice";
const MODIFIER_FEROCITY = "ferocity";