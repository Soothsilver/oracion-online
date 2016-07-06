var hasCreatureInHand = function (player) {
    for (var i = 0; i < player.hand.cards.length; i++) {
        if (player.hand.cards[i] instanceof Creature) {
            if (player.hand.cards[i].ex != "true") {
                return true;
            }
        }
    }
    return false;
};
/**
 * 
 * @param {Player} player
 * @param {Card} card
 * @returns {boolean}
 */
var isPlayable = function (player, card) {
  if (!player.hand.cards.contains(card)) {
      return false;
  }
  if (player.activeCreature == null && player.session.phase == PHASE_SEND_INTO_ARENA) {
      // We're playing a creature.
      if (hasCreatureInHand(player)) {
          var isCreature = card instanceof Creature;
          if (isCreature) {
                return card.ex != "true";
          }
      } else {
          return true;
      }
  } else {
      // We're playing an action or a tool.
      return false;
  }
};