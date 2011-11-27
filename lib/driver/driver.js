
(function (exports) {

    var util    = require("../util"),
        Driver  = module.exports
    ;

    Object.defineProperties(Driver, {
        /**
         * Run a function with the Driver's context object set.  
         * 
         * @method run
         * @param fn {function} a function to run
         * @param rest {mixed} additional arguments to pass to the function
         * @returns {object} Driver
         */
        run: {
            value: function (fn) {
                return fn.apply(this, [this].concat(util.slice(arguments, 1)));
            }
        }
    });
    
    require("proteus").extend(Driver, require("events").EventEmitter.prototype);
    
}(exports));
