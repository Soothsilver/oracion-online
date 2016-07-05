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
                var creatureTags = (cardXml.getElementsByTagName("creature"));
                if (creatureTags.length > 0) {
                    dice = creatureTags[0].getAttribute("dice");
                }
                cardlist[name] = {
                    name : name,
                    color : color,
                    image : "cards/" + image + ".png",
                    type : "creature",
                    dice : dice
                }
            }
            log("Karty byly načteny.");
            thenWhat();
        }
    });
};
var createCard = function (description) {
    var card;
    switch (description.type) {
        case "creature":
            card = new Creature(description.name, description.color, description.image, description.dice);
            break;
        default:
            log ("unknown type");
            break;
    }
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