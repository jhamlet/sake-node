
(function (exports) {
    
    var util = require('stitch/util');
    
    /**
     * Create a new instance of this Creator
     */
    function _create () {
        var obj, fn, args;
        
        obj = Object.create(this.protospec);
        
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
        var key, spec, fn;
        
        props = props.properties || props;
        
        for (key in props) {
            spec = props[key];
            if (!util.isPropSpec(spec)) {
                spec = {
                    value: spec,
                    writable: true,
                    enumerable: true,
                    configurable: true
                }
            }
            this.properties[key] = spec;
        }
        
        if ((fn = props.included)) {
            fn.call(props, this);
        }
        
        return this;
    }
    
    /**
     * Apply static properties to our Creator;
     */
    function _merge (props) {
        return util.merge(this, props);
    }
    
    function _childize (obj, statics, mixins) {

        console.log(">>>");
        console.dir(obj);
        console.dir(Object.getPrototypeOf(obj));
        console.log("<<<");
        
        if (statics) {
            obj.merge(statics);
        }
        
        if (mixins) {
            obj.include(mixins);
        }
        
        return obj;
    }
    /**
     * Extend this Creator to make a new Creator
     */
    function _extend (statics, mixins) {
        var arglen = (arguments.length === 1);
        
        return _childize(
            Object.create(this),
            arglen ? null : statics,
            arglen ? statics : mixins
        );
    }
    
    util.merge(exports, {
        extend: function (statics, mixins) {
            var arglen = (arguments.length === 1);
            
            return _childize(
                {   properties: {},
                    extend:     _extend,
                    merge:      _merge,
                    create:     _create,
                    include:    _include },
                arglen ? null : statics,
                arglen ? statics : mixins
            );
        }
    });
    
}(exports));