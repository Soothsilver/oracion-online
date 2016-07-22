/**
 * Determines whether an array contains the specified object.
 * @param obj The object that might be in the array (the needle).
 * @returns {boolean} True if the object is in the array; false otherwise.
 */
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};
/**
 * Removes an object from the array. Uses indexOf to find the object in the array.
 * @param obj The object to be removed.
 */
Array.prototype.remove = function (obj) {
    var index = this.indexOf(obj);
    if(index !== -1) {
        this.splice(index, 1);
    }
};