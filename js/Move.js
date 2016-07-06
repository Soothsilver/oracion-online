var Move = function (id, yours, type, argument) {
    this.id = id;
    this.yours = yours;
    this.type = type;
    this.argument = argument;
};
const MOVE_LOAD_DECK = "load deck";
const MOVE_RANDOM_SEED = "random seed";
const MOVE_PLAY_CARD = "play card";
const MOVE_PROCEED_TO_COMBAT = "proceed to combat";
const MOVE_KEEP_THE_ANCIENT = "keep the ancient";
const MOVE_DISCARD_THE_ANCIENT = "discard the ancient";