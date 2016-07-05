class Card {
    constructor(name, color, image) {
        this.name = name;
        this.color = color;
        this.image = image;
        this.facedown = false;
        /** @type jQuery */
        this.element = null;
        this.targetPosition = null;
        this.uniqueIdentifier = 0;
        this.beingDiscarded = false;
        /** @type Player */
        this.controller = null;
    }

    toLink() {
        return "<b>" + this.name + "</b>";
    }
    
    constructSelfDomElement() {
        var battlefield = $("#ingamescreen");
        this.element = $("<img>");
        this.element.addClass("card");
        this.element.attr("src", this.image);
        this.element.css("left", visualTwister.between(-100, 1000));
        this.element.css("top", visualTwister.between(-100, 1000));
        var capturedThis = this;
        this.element.mouseenter(function () {
           if (!capturedThis.facedown) {
               session.showOffCard = capturedThis;
               $("#showoff").attr("src", capturedThis.image).show();
           }
        });
        this.element.mouseleave(function () {
           if (session.showOffCard == capturedThis) {
               $("#showoff").hide();
               session.showOffCard = null;
           }
        });
        this.element.click(function() {
           session.click(capturedThis);
        });
        battlefield.append(this.element);
    }

    flip (newSide) {
        this.facedown = !newSide;
        if (this.facedown) {
            this.element.attr("src", "img/cardback.png");
        } else {
            this.element.attr("src", this.image);
        }
    }

    /**
     * @param {Rectangle} rectangle
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
                duration: quick ? 100 : 1000,
                complete: function () {
                    session.animationCompleted();
                }
            });
    }
}