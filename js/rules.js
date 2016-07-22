/**
 * Determines whether the specified player has at least one playable creature in his or her hand.
 * @param {Player} player
 * @return {boolean}
 */
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
 * Determines whether the specified player can play the specified card from his or her hand at this time.
 * @param {Player} player
 * @param {Card} card
 * @returns {boolean}
 */
var isPlayable = function (player, card) {
  if (!player.hand.cards.contains(card)) {
      // Cards may only be played from hand.
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
     // We are in the main phase.
     if (card instanceof Action) {
         // Actions have no requirements.
         return true;
     }
      if (card instanceof Tool) {
          if (card.hasAbility("OnlyWaterAndPsychic")) {
              return player.activeCreature.color == "Water" ||
                      player.activeCreature.color == "Psychic";
          }
          if (card.hasAbility("OnlyLeafAndFire")) {
              return player.activeCreature.color == "Leaf" ||
                      player.activeCreature.color == "Fire";
          }
          return true;
      }
      if (card instanceof Creature) {
          if (card.ex && !player.activeCreature.ex) {
              return card.color == player.activeCreature.color;
          }
      }
     return false;
  } else {
      return false;
  }
};