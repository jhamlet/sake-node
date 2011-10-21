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
    function _create (protos, statics, mixins) {
        var obj = Object.create(protos);
        
        obj.protos = protos.protos ? Object.create(protos.protos) : {};
        // obj.__super__ = protos;
        Object.defineProperty(obj, "__super__", {
            value: protos,
            writable: false,
            configurable: false,
            enumerable: true
        });
        
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
            var obj, spec, args;

            obj = Object.create(this.protos);
            Object.defineProperty(obj, "__proteus__", {
                value: this,
                writable: false,
                configurable: false,
                enumerable: true
            });

            if (arguments.length === 1 &&
                !(spec = arguments[0]) &&
                !(spec instanceof Array) &&
                typeof spec === 'object'
            ) {
                _merge(obj, arguments[0]);
                args = _slice(arguments, 1);
            }

            if (this.created) {
                args = (args || _slice(arguments));
                this.created(obj, args);
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
         * Include properties into our instance's protos
         * AKA: mix-in new instance functionality
         * @method include
         * @param props {object|array}
         * @returns {object}
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
            
            props = props.protos || props;
            _merge(this.protos, props);

            if ((fn = props.included)) {
                fn.call(props, this);
            }

            return this;
        },
        
        /**
         * Called when the Proteus is included into another Proteus
         * @event included
         * @abstract
         * @param obj {object} the 'class' included into
         */
        
        /**
         * Enhance our Proteus with new properties
         * AKA: extend our Class with static members
         * @method enhance
         * @param props {object}
         * @returns {object} the Proteus object
         */
        enhance: (function () {
            var reserved = {
                    protos: true
                    // included: true,
                    // enhanced: true,
                    // extended: true
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
         * Called when the Proteus is used to enhance another Proteus
         * @event enhanced
         * @abstract
         * @param obj {object} the 'class' being enhanced
         */

        /**
         * Give rise to a new Proteus
         * @method extend
         * @param statics {object} properties to add to the Proteus
         * @param mixins {object} properties to include into the Proteus'
         *      instance prototype
         * @returns {object} a new Proteus based on the current one
         */
        extend:  function (statics, mixins) {
            var argshort = arguments.length === 1,
                proteus;
            
            proteus = _create(this,
                argshort ? null : statics,
                argshort ? statics : mixins
            );

            if (this.extended) {
                this.extended(proteus);
            }
            
            return proteus;
        }
        
        /**
         * Called when the current Proteus is extended to create another
         * @event extended
         * @abstract
         * @param proteus {object} the new Proteus object
         */
        
    };

    // Export
    exports.create = function (statics, mixins) {
        var argshort = arguments.length === 1;
        return _create(Proteus,
            argshort ? null : statics,
            argshort ? statics : mixins
        );
    };

}(exports));
