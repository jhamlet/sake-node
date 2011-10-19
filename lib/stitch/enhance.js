
(function (exports) {
    
    exports.enhance = function (fn) {
        fn.call(this, this);
        return this;
    };
    
}(exports));