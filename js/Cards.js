// This file loads cards from XML into a Javascript object.
var cardlist = {};

/**
 * Loads cards from the XML file, then executes a callback.
 * @param thenWhat A Javascript function to be executed when all cards are loaded.
 */
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
                var actionTags = (cardXml.getElementsByTagName("action"));
                var abilityTags = (cardXml.getElementsByTagName("ability"));
                var abilities = [];
                var addToSelf = [];
                var addToEnemy = [];
                var inherentModifiers = [];
                var spellAbility = null;
                var cardType = "creature";
                switch (cardXml.getAttribute("color")) {
                    case "Tool": cardType = "tool"; break;
                    case "Action" : cardType = "action"; break;
                }
                if (creatureTags.length > 0) {
                    inherentModifiers = getInherentModifiers(creatureTags[0].getAttribute("d20"),
                        creatureTags[0].getAttribute("d10"),
                        creatureTags[0].getAttribute("d6"),
                        creatureTags[0].getAttribute("dPlus"));
                    god = creatureTags[0].getAttribute("god") == "true";
                    ex = creatureTags[0].getAttribute("ex");
                }
                else if (toolTags.length > 0) {
                    inherentModifiers = getInherentModifiers(toolTags[0].getAttribute("d20"),
                        toolTags[0].getAttribute("d10"),
                        toolTags[0].getAttribute("d6"),
                        toolTags[0].getAttribute("dPlus"));
                } 
                else if (actionTags.length > 0) {
                    var actionTag = actionTags[0];
                    spellAbility = actionTag.getAttribute("spellability");
                    var addToSelfTag = actionTag.getElementsByTagName("addToSelf") ? actionTag.getElementsByTagName("addToSelf")[0] : null;
                    var addToEnemyTag = actionTag.getElementsByTagName("addToEnemy") ? actionTag.getElementsByTagName("addToEnemy")[0] : null;
                    if (addToSelfTag != null) {
                        var abilityTagsSelf = addToSelfTag.getElementsByTagName("ability");
                        for (var j = 0; j < abilityTagsSelf.length; j++) {
                            var abilityTag = abilityTagsSelf[j];
                            var abilityId = abilityTag.getAttribute("id");
                            var abilityValue = abilityTag.getAttribute("value");
                            var isMagic = abilityTag.getAttribute("isMagic") == "true";
                            addToSelf.push(new Ability(abilityId, abilityValue, isMagic));
                        }
                    }
                    if (addToEnemyTag != null) {
                        var abilityTagsEnemy = addToEnemyTag.getElementsByTagName("ability");
                        for (var j = 0; j < abilityTagsEnemy.length; j++) {
                            var abilityTag = abilityTagsEnemy[j];
                            var abilityId = abilityTag.getAttribute("id");
                            var abilityValue = abilityTag.getAttribute("value");
                            var isMagic = abilityTag.getAttribute("isMagic") == "true";
                            addToEnemy.push(new Ability(abilityId, abilityValue, isMagic));
                        }
                    }
                }

                for (var j = 0; j < abilityTags.length; j++) {
                    var abilityTag = abilityTags[j];
                    var abilityId = abilityTag.getAttribute("id");
                    var abilityValue = abilityTag.getAttribute("value");
                    var isMagic = abilityTag.getAttribute("isMagic") == "true";
                    abilities.push(new Ability(abilityId, abilityValue, isMagic));
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
                    spellAbility: spellAbility,
                    inherentModifiers : inherentModifiers,
                    abilities : abilities,
                    addToSelf : addToSelf,
                    addToEnemy : addToEnemy,
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

/**
 * Creates a card from a Javascript description (see the function above this one).
 * @param description Information about a card as a Javascript object.
 * @returns {Card}
 */
var createCard = function (description) {
    var card;
    switch (description.type) {
        case "creature":
            card = new Creature(description.name, description.color, description.image, description.dice);
            if (description.god) {
                card.god = true;
            }
            card.ex = description.ex == "true";
            break;
        case "tool":
            card = new Tool(description.name,  description.color,  description.image,  description.dice);
            break;
        case "action":
            card = new Action(description.name,  description.color,  description.image);
            card.spellAbility = description.spellAbility;
            card.addToSelf = description.addToSelf;
            card.addToEnemy = description.addToEnemy;
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
 * Gets a random card from the list of all cards.
 * @param {MersenneTwister} twister The RNG to be used.
 * @return {Card}
 */
var getRandomCard = function (twister) {
    var cards = Object.keys(cardlist).map(key => cardlist[key]);
    var count = cards.length;
    var index = twister.between(0, count);
    return createCard(cards[index]);
};