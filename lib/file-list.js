
(function () {
    
    var Proteus = require("proteus"),
        Glob    = require("glob"),
        util    = require("./util"),
        GLOB_PATTERN = /[*?\[\{]/,
        AP      = Array.prototype,
        EXCLUDE_ARRAY_METHODS = ["length", "constructor"],
        ARRAY_METHOD_NAMES = Object.getOwnPropertyNames(AP).filter(
            function (name) {
                var fn;
                if (!~EXCLUDE_ARRAY_METHODS.indexOf(name) &&
                    (fn = typeof AP[name]) === "function"
                ) {
                    return true;
                }
            }
        ),
        __FileList__
    ;

    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function applyArrayMethod (obj, name) {
        return function () {
            obj.resolve();
            return AP[name].apply(obj.__items__.slice(), arguments);
        };
    }
    
    /**
     * Add array method wrappers to our array accessor function. The wrappers
     * ensure that we resolve the filepaths before returning.
     * 
     * @method applyArrayMethods
     * @private
     * @param obj {function} our array accessor function
     * @returns {function} obj
     */
    function applyArrayMethods (obj) {
        ARRAY_METHOD_NAMES.forEach(function (name) {
            Object.defineProperty(obj, name, {
                value: applyArrayMethod(obj, name)
            });
        });
        return obj;
    }
        
    /**
     * Add our semi-private (hidden) properties to our array accessor
     * 
     * @method defineProperties
     * @private
     * @param obj {function} our new array accessor function
     * @returns {function}
     */
    function defineProperties (obj) {
        Object.defineProperties(obj, {
            __pendingAdd__: {
                value: []
            },
            __pending__: {
                value: true,
                writable: true
            },
            __items__: {
                value: []
            },
            __exPats__: {
                value: []
            },
            __exFns__: {
                value: []
            },
            count: {
                get: function () {
                    this.resolve();
                    return this.__items__.length;
                },
                set: function (amt) {
                    this.resolve();
                    this.__items__.length = amt;
                }
            },
            items: {
                get: function () {
                    this.resolve();
                    return this.__items__.slice();
                }
            }
        });
        
        return applyArrayMethods(obj);
    }
    
    /**
     * Add non-excluded paths to our items
     * 
     * @method addMatching
     * @private
     * @param path {string} glob pattern
     * @returns {function} self
     */
    function addMatching (path) {
        Glob.sync(path).forEach(function (path) {
            if (!this.excludes(path)) {
                this.__items__.push(path);
            }
        }, this);
        return this;
    }
    
    /**
     * @method resolveAdd
     * @private
     * @param path {RegExp|string} the file path/pattern to add
     * @returns {function} self
     */
    function resolveAdd (path) {
        if (GLOB_PATTERN.test(path)) {
            addMatching.call(this, path);
        }
        else {
            this.__items__.push(path);
        }
        return this;
    }
    
    /**
     * Filter out the excluded items
     * 
     * @method resolveExcludes
     * @private
     * @returns {function} self
     */
    function resolveExcludes () {
        var items = this.__items__;
        
        items.splice.apply(items, [0, items.length].concat(
            items.filter(
                function (path) {
                    return !this.excludes(path);
                },
                this
            )
        ));
        
        return this;
    }
    
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    __FileList__ = {
        include: function () {
            util.slice(arguments).forEach(function (arg) {
                if (Array.isArray(arg)) {
                    return this.include.apply(this, arg);
                }
                else if (typeof arg === "function") {
                    return this.include.apply(this, arg.apply(this, this));
                }
                else {
                    this.__pendingAdd__.push(arg);
                }
            }, this);
            
            this.__pending__ = true;
            return this;
        },
        
        add: util.aliasMethod("include"),
        
        exclude: function () {
            var excludeFns      = this.__exFns__,
                excludePatterns = this.__exPats__
            ;
            
            util.slice(arguments).forEach(function (arg) {

                if (typeof arg === "function") {
                    excludeFns.push(arg);
                    return;
                }
                
                excludePatterns.push(arg);
            });
            
            if (!this.__pending__) {
                resolveExcludes.call(this);
            }

            return this;
        },
        
        clearExcludes: function () {
            this.__exPats__.splice(0, this.__exPats__.length);
            this.__exFns__.splice(0, this.__exFns__.length);
            return this;
        },
        
        /**
         * If we haven't been resolved, resolve our pending items
         * 
         * @method resolve
         * @returns {function} self
         */
        resolve: function () {
            var pendAdd = this.__pendingAdd__;
            
            if (this.__pending__) {
                this.__pending__ = false;
                pendAdd.forEach(function (path) {
                    resolveAdd.call(this, path);
                }, this);
                pendAdd.splice(0, pendAdd.length);
                resolveExcludes.call(this);
            }
            return this;
        },

        excludes: function (path) {
            return this.__exPats__.some(function (pattern) {
                if (pattern instanceof RegExp) {
                    return pattern.test(path);
                }
                else if (pattern.match(/[*?]/)) {
                    return Glob.fnmatch(pattern, path, Glob.FNM_PATHNAME);
                }
                else {
                    return (path === pattern);
                }
            }) || this.__exFns__.some(function (fn) { fn(path); });
        }
    };
    
    module.exports = function FileList (idx, val) {
        var fn = function (idx, val) {
                fn.resolve();
                if (arguments.length === 2) {
                    return (fn.__items__[idx] = val);
                }
                return fn.__items__[idx];
            }
        ;
        
        Proteus.extend(fn, __FileList__);
        defineProperties(fn);
        
        fn.include(util.slice(arguments));
        
        return fn;
    };
    
}());