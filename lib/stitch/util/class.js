/**
 * Proteus |ˈprōtēəs; ˈprōˌt(y)oōs|
 * 
 * Greek Mythology a minor sea god (son of Oceanus and Tethys) who had the
 * power of prophecy but who would assume different shapes to avoid answering
 * questions.
 * 
 * From the Greek protos "first."
 */

(function (exports) {
    
    var util = require('stitch/util'),
        _doNotInit = {}
    ;

    /**
     * Create a new class from an existing one
     * @method create
     * @param statics {object} static properties to extend the class with
     * @param mixins {object} instance properties to include
     * @returns {function} constructor function
     */
    function create (statics, mixins) {
        var argshort = arguments.length < 2,
            Class = _create(new this(_doNotInit),
                argshort ? null : statics,
                argshort ? statics : mixins
            )
        ;
        
        Class.__proteus__ = this;
        
        if (this.inherited) {
            this.inherited(Class);
        }
        
        return Class;
    }
    
    /**
     * Utility method for handling multiple arguments to mixin functions
     * @method _doMulti
     * @static
     * @private
     * @param scope {object}
     * @param method {string}
     * @param args {array-like}
     * @returns {object} scope
     */
    function _doMulti (scope, method, args) {
        var list = args[0] instanceof Array ?
                args[0] :
                args,
            i = 0,
            len = list.length
        ;
        
        for (; i < len; i++) {
            scope[method](list[i]);
        }
        
        return scope;
    }
    
    /**
     * Extend the current class with additional properties
     * @method extend
     * @param statics {object} static properties to extend the class with
     * @returns {function} constructor function
     */
    function extend (statics) {
        var isFunc;
        
        if (util.isArray(statics) || arguments.length > 1) {
            return this.extendAll(arguments);
        }
        
        if (((isFunc = util.isFunction(statics)) &&
            statics.extending &&
            statics.extending(this) === true) ||
            !isFunc
        ) {
            util.merge(this, statics);
        }
        
        if (isFunc && statics.extended) {
            statics.extended(this);
        }
        
        return this;
    }
    
    /**
     * Extend with all extensions passed
     * @param args {array-like}
     * @returns {type}
     */
    function extendAll (args) {
        return _doMulti(this, "extend", args);
    }
    
    /**
     * Include additional properties onto this Class' prototype
     * @method include
     * @param mixins {object} instance properties to include
     * @returns {function} constructor function
     */
    function include (mixins) {
        if (util.isArray(mixins) || arguments.length > 1) {
            return this.includeAll(arguments);
        }

        util.merge(this.prototype, mixins.prototype || mixins);

        if (util.isFunction(mixins) && mixins.included) {
            mixins.included(this);
        }
        
        return this;
    }
    
    /**
     * Include all passed
     * @param args {array-like}
     * @returns {type}
     */
    function includeAll (args) {
        return _doMulti(this, "include", args);
    }

    /**
     * Utility method for creating new Classes
     * @method _create
     * @private
     * @param protos {object} prototype of the new Class
     * @param statics {object} static properties to extend the class with
     * @param mixins {object} instance properties to include
     * @returns {function} constructor function
     */
    function _create (protos, statics, mixins) {
        var Class = function Proteus () {
            var init = this.init;

            if (init && arguments[0] !== _doNotInit) {
                init.apply(this, arguments);
            }
        };
        
        if (protos) {
            Class.prototype = protos;
        }
        
        Class.__proteus__ = Class.constructor;
        Class.constructor = Class;

        Class.create     = create;
        Class.extend     = extend;
        Class.extendAll  = extendAll;
        Class.include    = include;
        Class.includeAll = includeAll;
        
        if (statics) {
            Class.extend(statics);
        }
        
        if (mixins) {
            Class.include(mixins);
        }
        
        return Class;
    }
    
    /**
     * Export our base 'create' method
     * @method create
     * @param statics {object} static properties to extend the class with
     * @param mixins {object} instance properties to include
     * @returns {function} constructor function
     */
    exports.create = function (statics, mixins) {
        var argshort = arguments.length < 2;
        
        return _create({
                _super: util._super
            },
            argshort ? null : statics,
            argshort ? statics : mixins
        );
    };
    
}(exports));