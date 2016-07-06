var hasCreatureInHand = function (player) {
    for (var i = 0; i < player.hand.cards.length; i++) {
        if (player.hand.cards[i] instanceof Creature) {
            if (player.hand.cards[i].ex != true) {
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
                /** @type Creature */
                var creature = card;
                return creature.ex != true;
          }
      } else {
          return true;
      }
  } else if (player.activeCreature != null && (player.activeCreature instanceof Creature) && player.session.phase == PHASE_MAIN) {

     if ((card instanceof Tool) || (card instanceof Action)) {
         return true;
     }
      // TODO ex creatures
      // TODO tool restrictions
     return false;
  } else {
      return false;
  }
};