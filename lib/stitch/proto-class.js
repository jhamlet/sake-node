
(function (exports) {

var util = require('stitch/util');

exports.create = (function () {
    var _doNotInit = {};
    
    /**
     * Include additional properties onto the constructor function
     * AKA: Mix in static stuff
     * @method include
     * @returns {function} the constructor function
     */
    function _include () {
        var len = arguments.length,
            i, obj
        ;

        for (i = 0; i < len; i++) {
            obj = arguments[i];
            util.merge(this, obj);
            if (obj.included) {
                obj.included.call(this);
            }
        }
        return this;
    }
    
    /**
     * Mix in functionality into the prototype of the constructor.
     * AKA: add instance stuff
     * @method mixin
     * @returns {function} the constructor function
     */
    function _mixin () {
        var len = arguments.length,
            i, obj
        ;

        for (i = 0; i < len; i++) {
            obj = arguments[i];
            util.merge(this.prototype, obj);
            if (obj.mixedin) {
                obj.mixedin.call(this);
            }
        }
        return this;
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