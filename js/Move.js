/**
 * Represents an action taken by a player that must be sent to the server.
 * @param id The move's ID in the database, if available.
 * @param yours Whether this move was initiated by this client.
 * @param type The type of the move, i.e. one of the MOVE_* constants.
 * @param argument An optional argument to the move, such as the name of a deck or identifier of a card.
 */
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