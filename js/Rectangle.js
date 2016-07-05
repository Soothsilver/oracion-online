class Rectangle {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * @param {Rectangle} other
     */
    equals(other) {
        return this.x == other.x &&
                this.y == other.y &&
                this.width == other.width &&
                this.height == other.height;
    }
}