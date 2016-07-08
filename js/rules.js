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

     if (card instanceof Action) {
         
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