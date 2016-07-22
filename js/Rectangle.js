/**
 * An on-screen rectangle.
 */
class Rectangle {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Determines if this rectangle has the same coordinates and dimensions as another rectangle.
     * @param {Rectangle} other
     */
    equals(other) {
        return this.x == other.x &&
                this.y == other.y &&
                this.width == other.width &&
                this.height == other.height;
    }
}