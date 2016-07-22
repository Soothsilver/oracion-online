/**
 * Abstract base class for cards. The subclasses are Action, Creature and Tool.
 */
class Card {
    constructor(name, color, image) {
        /**
         * Name of the card.
         */
        this.name = name;
        /**
         * Whether this card is Leaf, Fire, Water etc.
         */
        this.color = color;
        /**
         * The card image.
         */
        this.image = image;
        /**
         * Whether the card's card back is visible.
         * @type {boolean} If true, the card is face down.
         */
        this.facedown = false;
        /**
         * The card's DOM element, encapsulated in a jQuery object.
         * @type jQuery */
        this.element = null;
        /**
         * The rectangle where this card is moving towards.
         * @type {Rectangle}
         */
        this.targetPosition = null;
        /**
         * This card's unique identifier. This identifier is used to send information about the card to the other player.
         * @type {number}
         */
        this.uniqueIdentifier = 0;
        /**
         * This card's inherent (printed) abilities.
         * @type {Ability[]}
         */
        this.inherentAbilities = [];
        /** @type Player */
        this.controller = null;
        /**
         * Whether this is an evil card (i.e. has dark background).
         * @type {boolean}
         */
        this.evil = false;
    }

    recalculateModifiers() {
        // Abstract.
        this.modifiers = [];
    }
    preroll() {
        // Abstract.

    }
    postroll () {
        // Abstract.
    }

    /**
     * Gets synthetic roll result information about the battle of a non-creature card (i.e. power -1).
     * @returns {{total: number, description: string}}
     */
    roll () {
        return {
            total: -1,
            description : "[není bytost]"
        }
    }
    rollTwister (twister) {
        // Abstract.
        return -1;
    }

    /**
     * Gets the union of inherent, acquired and tool abilities of this card.
     * Overriden in subclasses.
     * @returns {Ability[]}
     */
    getAbilities() {
        return [];
    }

    /**
     * Determines whether this card has an inherent or acquired ability.
     * Overriden in subclasses.
     */
    hasAbility(abilityId) {
        return false;
    }

    /**
     * Determines whether this card has an inherent ability.
     * Overriden in subclasses.
     */
    hasOwnAbility(abilityId) {
        return false;
    }

    /**
     * Returns a string that is an HTML link with the name of this card. If the player mouses over the link, the card's image is displayed.
     * @returns {string} This card's unique identifier number.
     */
    toLink() {
        return "<b><a href='javascript:void();' data-card='" + this.uniqueIdentifier +"' class='autocard'>" + this.name + "</a></b>";
    }

    /**
     * Creates a DOM element that represents this card and adds it to the page's DOM tree. Also attaches jQuery bind events to the element.
     */
    constructSelfDomElement() {
        var battlefield = $("#ingamescreen");
        this.element = $("<img>");
        this.element.addClass("card");
        this.element.attr("src", this.image);
        this.element.css("left", visualTwister.between(-100, 1000));
        this.element.css("top", visualTwister.between(-100, 400));
        this.element.css("zIndex", 400);
        var capturedThis = this;
        this.element.mouseenter(function () {
           if (!capturedThis.facedown) {
               session.showOffCard = capturedThis;
               $("#showoff").attr("src", capturedThis.image).show();
           }
            if (isPlayable(capturedThis.controller, capturedThis)) {
                capturedThis.element.addClass("hoverplayable");
            }
        });
        this.element.mouseleave(function () {
           if (session.showOffCard == capturedThis) {
               $("#showoff").hide();
               session.showOffCard = null;
           }
            capturedThis.element.removeClass("hoverplayable");
        });
        this.element.on("dragstart", function (event) {
           if (isPlayable(capturedThis.controller, capturedThis)) {
               //noinspection JSUnresolvedVariable
               event.originalEvent.dataTransfer.setData("application/card", capturedThis.uniqueIdentifier);
               //noinspection JSUnresolvedVariable
               event.originalEvent.dataTransfer.dropEffect = "move";
           }  else {
               console.log("dragstart not");
               event.originalEvent.preventDefault();
           }
        });
        this.element.attr("draggable", true);
        this.element.click(function() {
           session.click(capturedThis);
        });
        battlefield.append(this.element);
    }

    /**
     * Flips a card so that its face is visible (if argument is true) or so that the card is face-down (if argument is false).
     * @param newSide
     */
    flip (newSide) {
        this.facedown = !newSide;
        if (this.facedown) {
            this.element.attr("src", "img/cardback.png");
        } else {
            this.element.attr("src", this.image);
        }
    }

    /**
     * Initiates an asynchronous animation that moves this card to a target location.
     *
     * @param {Rectangle} rectangle Where should the card move.
     * @param {boolean} quick Whether the animation should be fast.
     */
    moveToRectangle(rectangle, quick = false) {
        session.animationsInProgress++;
        this.targetPosition = rectangle;
        this.element.animate({
            left: rectangle.x,
            top: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        }, 
            {
                duration: quick ? 100 : slowCardMovementTime,
                complete: function () {
                    session.animationCompleted();
                }
            });
    }
}
/**
 * How many milliseconds does a slow animation take.
 * @type {number}
 */
var slowCardMovementTime = 500;