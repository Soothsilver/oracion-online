var cardlist = {};

var loadCardlist = function (thenWhat) {
    log("Načítám seznam všech karet...");
    /**
     * @var $xml XMLDoc
     */
    var xml;
    jQuery.ajax({
        url : '/cards/cards.xml',
        type : 'GET',
        contentType : "text/html; charset=utf-8",
        success: function (result) {
            var cards = result.getElementsByTagName("card");
            for (var i = 0; i < cards.length; i++) {
                var cardXml = cards[i];
                var name = cardXml.getAttribute("name");
                var color = cardXml.getAttribute("color");
                var image = cardXml.getAttribute("image");
                var dice = "0";
                var god = false;
                var ex = false;
                var evil = cardXml.getAttribute("evil");
                var creatureTags = (cardXml.getElementsByTagName("creature"));
                var toolTags = (cardXml.getElementsByTagName("tool"));
                var abilityTags = (cardXml.getElementsByTagName("ability"));
                var abilities = [];
                var inherentModifiers = [];
                var cardType = "creature";
                switch (cardXml.getAttribute("color")) {
                    case "Tool": cardType = "tool"; break;
                    case "Action" : cardType = "action"; break;
                }
                if (creatureTags.length > 0) {
                    dice = getDiceExpression(creatureTags[0].getAttribute("d20"),
                        creatureTags[0].getAttribute("d10"),
                        creatureTags[0].getAttribute("d6"),
                        creatureTags[0].getAttribute("dPlus"));
                    inherentModifiers = getInherentModifiers(creatureTags[0].getAttribute("d20"),
                        creatureTags[0].getAttribute("d10"),
                        creatureTags[0].getAttribute("d6"),
                        creatureTags[0].getAttribute("dPlus"));
                    god = creatureTags[0].getAttribute("god") == "true";
                    ex = creatureTags[0].getAttribute("ex");
                }
                else if (toolTags.length > 0) {
                    dice = getDiceExpression(toolTags[0].getAttribute("d20"),
                        toolTags[0].getAttribute("d10"),
                        toolTags[0].getAttribute("d6"),
                        toolTags[0].getAttribute("dPlus"));
                    inherentModifiers = getInherentModifiers(toolTags[0].getAttribute("d20"),
                        toolTags[0].getAttribute("d10"),
                        toolTags[0].getAttribute("d6"),
                        toolTags[0].getAttribute("dPlus"));
                }

                for (var j = 0; j < abilityTags.length; j++) {
                    var abilityTag = abilityTags[j];
                    var abilityId = abilityTag.getAttribute("id");
                    var abilityValue = abilityTag.getAttribute("value");
                    abilities.push(new Ability(abilityId, abilityValue));
                }

                cardlist[name] = {
                    name : name,
                    color : color,
                    image : "cards/" + image + ".png",
                    type : cardType,
                    god : god,
                    ex: ex,
                    evil: evil,
                    dice : dice,
                    inherentModifiers : inherentModifiers,
                    abilities : abilities
                };
            }
            log("Karty byly načteny.");
            thenWhat();
        }
    });
};
var getInherentModifiers = function (d20,d10,d6,dPlus) {
    var i;
    var returnArray = [];
    for (i = 0; i < d20; i++) {
        returnArray.push(new Modifier(MODIFIER_DICE, "img/d20.png", "Základní síla", 20));
    }
    for (i = 0; i < d10; i++) {
        returnArray.push(new Modifier(MODIFIER_DICE, "img/d10.png", "Základní síla", 10));
    }
    for (i = 0; i < d6; i++) {
        returnArray.push(new Modifier(MODIFIER_DICE, "img/d6.png", "Základní síla", 6));
    }
    if (dPlus != "0") {
        returnArray.push(new Modifier(MODIFIER_FLAT, "img/dPlus.png", "Základní síla <b>+" + dPlus + "</b>", dPlus));
    }
    return returnArray;
};
var getDiceExpression = function (d20,d10,d6,dPlus) {
  var s = "";
  if (d20 != "0") {
      s += d20 + "d20";
  }
    if (d10 != "0") {
        if (s) s+= "+";
        s += d10 + "d10";
    }  if (d6 != "0") {
        if (s) s+= "+";
        s += d6 + "d6";
    }  if (dPlus != "0") {
        if (s) s+= "+";
        s += dPlus;
    }
  return s;
};
var createCard = function (description) {
    var card;
    switch (description.type) {
        case "creature":
            card = new Creature(description.name, description.color, description.image, description.dice);
            if (description.god) {
                card.god = true;
            }
            if (description.ex == "true") {
                card.ex = true;
            } else {
                card.ex = false;
            }
            break;
        case "tool":
            card = new Tool(description.name,  description.color,  description.image,  description.dice);
            break;
        case "action":
            card = new Action(description.name,  description.color,  description.image);
            break;
        default:
            console.log ("unknown type");
            break;
    }
    card.inherentModifiers = description.inherentModifiers;
    card.inherentAbilities = description.abilities;
    card.evil = description.evil;
    return card;
};
/**
 * @param {MersenneTwister} twister 
 */
var getRandomCard = function (twister) {
    var cards = Object.keys(cardlist).map(key => cardlist[key]);
    var count = cards.length;
    var index = twister.between(0, count);
    var card = createCard(cards[index]);
    return card;
};