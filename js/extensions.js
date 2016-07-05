Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};
Array.prototype.remove = function (obj) {
    var index = this.indexOf(obj);
    if(index !== -1) {
        this.splice(index, 1);
    }
};