
(function (exports) {
    
    // Execution scope short-cut
    var hasOwn = Object.prototype.hasOwnProperty;
    
    exports.setSuper = function setSuper (child, parent) {
        child._super = function _super () {
            return parent;
        };
    };
    
    exports.callSuper = function callSuper () {
        var proto = 
    };
    
}(exports));