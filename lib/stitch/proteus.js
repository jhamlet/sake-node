
(function (exports) {
    
    var Proteus;

    function _merge (r, s) {
        var key;
        
        for (key in s) {
            if (s.hasOwnProperty(key)) {
                r[key] = s[key];
            }
        }
        
        return r;
    }
    
    /**
     * Utility to create a new Proteus from another
     */
    function _proteate (proteus, statics, mixins) {
        var obj = Object.create(proteus),
            arglen = (arguments.length === 2)
        ;
        
        obj.proteus = this.proteus ? Object.create(this.proteus) : {};
        
        statics = arglen ? null : statics;
        mixins  = arglen ? statics : mixins;
        
        if (statics) {
            obj.merge(statics);
        }
        
        if (mixins) {
            obj.include(mixins);
        }
        
        return obj;
    }

    Proteus = {
        /**
         * Create a new instance.
         * If the first argument is an object, it will be used as an property
         * initializer (copying its members to the new instance). Otherwise,
         * all arguments are passed to the new instance's 'created' function.
         * 
         * @method create
         * @param spec {object} optional, a object properties to initialize
         *      the instance with
         * @param arg1..argN {mixed} optional, arguments to pass to the new
         *      instances 'created' function.
         */
        create: function () {
            var obj, args, fn;

            obj = Object.create(this.proteus);

            if (arguments.length === 1) {
                _merge(obj, arguments[0]);
                args = Array.prototype.slice.call(arguments, 1);
            }

            if ((fn = obj.created)) {
                fn.apply(obj, args);
            }

            return obj;
        },

        /**
         * Include properties into our instance's proteus
         */
        include: function (props) {
            var fn;

            props = props.proteus || props;
            _merge(this.proteus, props);

            if ((fn = props.included)) {
                fn.call(props, this);
            }

            return this;
        },
        
        /**
         * Merge properties into our Proteus
         */
        extend: (function () {
            var reserved = {
                    proteus: true,
                    included: true,
                    extended: true,
                    evolved: true
                }
            ;

            return function (props) {
                var fn, key;

                for (key in props) {
                    if (!reserved[key]) {
                        this[key] = props[key];
                    }
                }

                if ((fn = props.extended)) {
                    fn.call(props, this);
                }

                return this;
            };
        }()),
        
        /**
         * Give rise to a new Proteus
         */
        evolve:  function (statics, mixins) {
            var obj, fn;
            
            obj = _proteate(this, statics, mixins);
            
            if ((fn = this.evolved)) {
                fn.call(this, obj);
            }
        }
        
    };

    // Export
    exports.evolve = function (statics, mixins) {
        return _proteate(Proteus, statics, mixins);
    };

}());