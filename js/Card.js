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
        this.abilities = [];
        /** @type Player */
        this.controller = null;
        this.evil = false;
    }

    recalculateModifiers() {
        this.modifiers = [];
    }
    roll () {
        return {
            total: -1,
            description : "[není bytost]"
        }
    }

    toLink() {
        return "<b><a href='javascript:void();' data-card='" + this.uniqueIdentifier +"' class='autocard'>" + this.name + "</a></b>";
    }
    
    constructSelfDomElement() {
        var battlefield = $("#ingamescreen");
        this.element = $("<img>");
        this.element.addClass("card");
        this.element.attr("src", this.image);
        this.element.css("left", visualTwister.between(-100, 1000));
        this.element.css("top", visualTwister.between(-100, 400));
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
                duration: quick ? 100 : 100,
                complete: function () {
                    session.animationCompleted();
                }
            });
    }
}