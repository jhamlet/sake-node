
(function (exports) {

var util = require('stitch/util');

exports.create = (function () {
    var _doNotInit = {};
    
    /**
     * Private utility function
     * @method _merge
     * @param obj {object} the object to modify
     * @param args {array-like}
     * @param what {string} the function name to call if it exists
     * @param scope {object} scope of function call
     * @returns {object} scope
     */
    function _merge (obj, args, what, scope) {
        var len = args.length,
            i = 0,
            o
        ;
        
        for (; i < len; i++) {
            o = args[i];
            util.merge(obj, o);
            if (obj[what]) {
                obj[what].call(this);
            }
        }
        
        return this;
    }
    /**
     * Include additional properties onto the constructor function
     * AKA: Mix in static stuff
     * @method include
     * @returns {function} the constructor function
     */
    function _include () {
        return _merge(this, arguments, "included", this);
    }
    
    /**
     * Mix in functionality into the prototype of the constructor.
     * AKA: add instance stuff
     * @method mixin
     * @returns {function} the constructor function
     */
    function _mixin () {
        return _merge(this.prototype, arguments, "mixedin", this);
    }
    
    /**
     * Create a new constructor based on the current one.
     * @method extend
     * @param statics {object} optional, static properties
     * @param props {object} optional, instance properties
     * @returns {function} constructor function
     */
    function _extend (statics, props) {
        var prototype = new this(_doNotInit),
            subclass
        ;
        
        if (arguments.length === 1) {
            props = statics;
            statics = null;
        }
        
        subclass = _create(statics, prototype);
        subclass.mixin(props);
        
        subclass.__parent__ = this;
        subclass.__super__ = this.prototype;

        return subclass;
    }
    
    /**
     * Create a constructor.
     * @param statics {object} optional, static properties
     * @param props {object} optional, instance properties
     * @returns {function} constructor function
     */
    function _create (statics, props) {
        function Class () {
            var init = this.init;
            if (init && arguments[0] !== _doNotInit) {
                init.apply(this, arguments);
            }
        }
        
        if (arguments.length === 1) {
            props = statics;
            statics = null;
        }
        
        Class.constructor = Class;
        
        Class.extend  = _extend;
        Class.mixin   = _mixin;
        Class.include = _include;
        
        if (statics) {
            Class.include(statics);
        }

        if (props) {
            Class.prototype = props;
        }
        
        return Class;
    }
    
    // Expose our _create function to the public
    return _create;
}());

}(exports));