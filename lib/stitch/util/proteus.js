
(function (exports) {
    var util = require("stitch/util"),
        _doNotInit = {},
        Obj = Object,
        ObjProto = Obj.prototype,
        _derive, derive, _extend, _include
    ;
    
    /**
     * Augment one object with another.
     * @method augment
     * @param augmentee {object}
     * @param augmentor {object}
     */
    function augment (augmentee, augmentor) {
        var O = Obj,
            keys, key, i, len, spec, otherSpec;
            
        keys = Obj.getOwnPropertyNames(augmentor);
        len = keys.length;
        i = 0;
        for (; i < len; i++) {
            key = keys[i];
            spec = O.getOwnPropertyDescriptor(augmentor, key);
            otherSpec = O.getOwnPropertyDescriptor(augmentee, key);
            if (!otherSpec || otherSpec.configurable) {
                O.defineProperty(augmentee, key, spec);
            }
        }
        
        return augmentee;
    }
    
    /**
     * Create a new Constructor
     */
    function makeCtor (proto) {
        var Ctor = function Proteus () {
                var initialize = arguments[0] !== _doNotInit,
                    initFn
                ;
                
                if (initialize) {
                    if ((initFn = this.init)) {
                        initFn.apply(this, arguments);
                    }
                    
                    if (Ctor.initializing) {
                        Ctor.initializing.call(Ctor, this, arguments);
                    }
                }
            }
        ;
        
        if (proto) {
            Ctor.prototype = proto;
        }
        
        Ctor.constructor = Ctor;

        augment(Ctor, {
            derive:  derive,    // New Class with this as base class
            extend:  _extend,   // Extend the Class
            include: _include   // Include into Instance
        });

        return Ctor;
    }

    /**
     * Create a new object based on a prototype
     * If you want to use property specifiers, use Object.create directly
     * @method createObject
     * @param base {object} optional, prototype object defaults to
     *      Object.prototype
     * @param props {object} prototype object
     * @returns {object} the newly created object with its prototype
     *      linked to props
     */
    function createObject (base, props) {
        if (!props) {
            props = base;
            base = ObjProto;
        }
        
        return augment(Obj.create(base), props);
    }
    
    /**
     * Include instance properites either from a plain object, or another
     * Constructor function.
     */
    _include = function _include () {
        var i, len, mod;
        
        len = arguments.length;
        i = 0;
        for (; i < len; i++) {
            mod = arguments[i];
            
            augment(this.prototype, mod);
            
            if (mod.prototype && mod.included) {
                mod.included(this);
            }
        }
        
        return this;
    };
    
    /**
     * Extend a Constructor object with new functionality.
     * @method _extend
     * @param arg1..argN {function|object}
     */
    _extend = function _extend () {
        var i, len, xtndr;
        
        len = arguments.length;
        i = 0;
        for (; i < len; i++) {
            xtndr = arguments[i];

            augment(this, xtndr);
            
            if (xtndr.prototype && xtndr.extended) {
                xtndr.extended(this);
            }
        }
        
        return this;
    };
    
    /**
     * Direct inheritance
     * 
     * Create a new Constructor based on this one and include mixins as new 
     * instance properties.
     */
    _derive = function _derive (baseCtor, mixins) {
        var superSpec = {
                configurable: false,
                writable: false,
                enumerable: false
            },
            Ctor
        ;
        
        if (arguments.length === 1) {
            mixins = baseCtor;
            baseCtor = this;
        }
        
        if (baseCtor) {
            Ctor = makeCtor(new baseCtor(_doNotInit));
            
            superSpec.value = baseCtor.prototype;
            Obj.defineProperty(Ctor, "__super__", superSpec);
            
            augment(Ctor, baseCtor);

            if (mixins) {
                augment(Ctor.prototype, mixins);
            }
            
            if (baseCtor.inherited) {
                baseCtor.inherited(Ctor);
            }
        }
        else {
            Ctor = makeCtor(mixins);
            superSpec.value = ObjProto;
            Obj.defineProperty(Ctor, "__super__", superSpec);
        }

        return Ctor;
    };
    
    derive  = function derive () {
        return _derive.call(this, arguments[0]);
    };

    /**
     * Export our Proteus module
     */
    exports.Proteus = {
        augment: augment,
        createObject: createObject,
        createClass: function (mixins) {
            return _derive(null, mixins);
        }
    }
    
}(exports));