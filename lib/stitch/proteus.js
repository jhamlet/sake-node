/**
 * Proteus |ˈprōtēəs; ˈprōˌt(y)oōs|
 * Greek Mythology a minor sea god who had the power of prophecy but who
 * would assume different shapes to avoid answering questions.
 */
(function (exports) {
    
    var Proteus;

    function _slice (list, offset) {
        return Array.prototype.slice.call(list, offset || 0);
    }
    
    function _merge (r, s) {
        var key;
        
        for (key in s) {
            if (s.hasOwnProperty(key)) {
                r[key] = s[key];
            }
        }
        
        return r;
    }
    
    function _processArray (list, method, scope) {
        var len = list.length,
            i = 0
        ;

        while (i < len) {
            scope[method](list[i]);
            i++;
        }
        
        return scope;
    }
    
    /**
     * Utility to create a new Proteus from another
     */
    function _proteate (proteus, statics, mixins) {
        var obj = Object.create(proteus);
        
        obj.proteus = proteus.proteus ? Object.create(proteus.proteus) : {};
        
        if (statics) {
            obj.enhance(statics);
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
            var obj, spec, args, fn;

            obj = Object.create(this.proteus);

            if (arguments.length === 1 &&
                !(spec = arguments[0]) &&
                !(spec instanceof Array) &&
                typeof spec === 'object'
            ) {
                _merge(obj, arguments[0]);
                args = _slice(arguments, 1);
            }

            if ((fn = this.created)) {
                args = (args || _slice(arguments));
                fn.call(this, obj, args);
            }
            
            return obj;
        },
        
        /**
         * @event created
         * @param obj {object} The created instance
         * @param args {array} the additional arguments passed to 'create'
         */
        created: function (obj, args) {
            var fn;
            
            if ((fn = obj.init)) {
                fn.apply(obj, args);
            }
        },
        
        /**
         * Include properties into our instance's proteus
         * AKA: 
         */
        include: function (props) {
            var isList, fn;
            
            if (props instanceof Array || (isList = arguments.length > 1)) {
                return _processArray(
                    isList ? arguments : props,
                    "include",
                    this
                );
            }
            
            props = props.proteus || props;
            _merge(this.proteus, props);

            if ((fn = props.included)) {
                fn.call(props, this);
            }

            return this;
        },
        
        /**
         * Enhance our Proteus with new properties
         * AKA: extend our Class with static members
         */
        enhance: (function () {
            var reserved = {
                    proteus: true,
                    included: true,
                    enhanced: true,
                    extended: true
                }
            ;

            return function (props) {
                var isList, key, fn;

                if (props instanceof Array || (isList = arguments.length > 1)) {
                    return _processArray(
                        isList ? arguments : props,
                        "enhance",
                        this
                    );
                }

                for (key in props) {
                    if (!reserved[key]) {
                        this[key] = props[key];
                    }
                }

                if ((fn = props.enhanced)) {
                    fn.call(props, this);
                }

                return this;
            };
        }()),
        
        /**
         * Give rise to a new Proteus
         */
        extend:  function (statics, mixins) {
            var argshort = arguments.length === 1,
                proteus, fn;
            
            proteus = _proteate(this,
                argshort ? null : statics,
                argshort ? statics : mixins
            );
            
            if ((fn = this.extended)) {
                fn.call(this, proteus);
            }
            
            return proteus;
        }
        
    };

    // Export
    exports.create = function (statics, mixins) {
        var argshort = arguments.length === 1;
        return _proteate(Proteus,
            argshort ? null : statics,
            argshort ? statics : mixins
        );
    };

}(exports));
