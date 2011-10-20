
(function (exports) {
    
    var util = require('stitch/util');
    
    /**
     * Create a new instance of this Creator
     */
    function _create () {
        var obj, fn, args;
        
        obj = Object.create(this.prototype);
        
        console.log(this.properties);
        Object.defineProperties(obj, this.properties);

        // create a references to its creator
        obj.__creator__ = this;
        
        // If the first argument is an object, use that to initialize the new
        // objects properties
        if (arguments.length === 1 && util.isObject(arguments[0])) {
            util.merge(obj, arguments[0]);
            args = util.slice(arguments, 1);
        }
        
        // Call the newly created object's 'created' method with the remaining
        // arguments, if any
        if ((fn = obj.created)) {
            fn.apply(obj, args || arguments);
        }
        
        // Return the instance of our Creator
        return obj;
    }
    
    /**
     * Mix-in properties to our instances
     */
    function _include (props) {
        var obj = this.prototype,
            key, spec, fn
        ;
        
        props = props.prototype || props;
        
        for (key in props) {
            spec = props[key];
            if (util.isPropSpec(spec)) {
                this.properties[key] = spec;
            }
            else {
                obj[key] = spec;
            }
        }
        
        if ((fn = props.included)) {
            fn(obj);
        }
        
        return obj;
    }
    
    /**
     * Apply static properties to our Creator;
     */
    function _merge (props) {
        return util.merge(this, props);
    }
    
    /**
     * Extend this Creator to make a new Creator
     */
    function _extend (statics, mixins) {
        var child;
        
        if (arguments.length === 1) {
            mixins = statics;
            statics = null;
        }
        
        child = statics ? Object.create(this, statics) : Object.create(this);
        child.prototype = Object.create(this.prototype);
        child.properties = this.properties || {};
        
        child.__super__ = this.prototype;
        
        child.extend    = _extend;
        child.merge     = _merge;
        child.create    = _create;
        child.include   = _include;
        
        if (statics) {
            this.merge(statics);
        }
        
        if (mixins) {
            child.include(mixins);
        }
        
        return child;
    }
    
    util.merge(exports, {
        extend: _extend,
        prototype: Object.create(Object.prototype)
    });
    
}(exports));