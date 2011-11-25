
(function () {
    
    var Proteus = require("proteus"),
        Glob    = require("glob"),
        util    = require("./util"),
        // useful for determining if a string is a glob pattern
        GLOB_PATTERN = /[*?\[\{]/,
        // Short-cut
        AP      = Array.prototype,
        // Methods not to copy over
        EXCLUDE_ARRAY_METHODS = ["length", "constructor"],
        // List of methods we want to copy over from Array
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
        DEFAULT_IGNORE_PATTERNS = [
            /(^|[\/\\])CVS([\/\\]|$)/,
            /(^|[\/\\])\.svn([\/\\]|$)/,
            /(^|[\/\\])\.git([\/\\]|$)/,
            /\.bak$/,
            /~$/
        ],
        FileList
    ;

    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    /**
     * Apply the named property to obj
     * 
     * @param obj {function} the array accessor
     * @param name {string} property name
     * @returns {function}
     */
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
     * @method defineInstanceProperties
     * @private
     * @param obj {function} our new array accessor function
     * @returns {function}
     */
    function defineInstanceProperties (obj) {
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
                value: DEFAULT_IGNORE_PATTERNS.slice()
            },
            __exFns__: {
                value: []
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
    module.exports = FileList = Proteus.Class.derive({
        /**
         * @method init
         * @param rest {string|function|array} paths, glob patterns, or functions
         *      to use as includes
         */
        init: function () {
            defineInstanceProperties(this);
            this.include(util.slice(arguments));
        },
        
        /**
         * @method include
         * @param rest (string|function|array) a path to include, a function
         *      that will return a path to include, or an array of paths
         * @returns {function} FileList instance
         */
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
        
        /**
         * @method add
         * @alias include
         */
        add: util.aliasMethod("include"),
        
        /**
         * Exclude a series of file paths.
         * 
         * @method exclude
         * @param rest {string|function|RegExp} the string, glob pattern,
         *      regular expression, or a function that returns true or false
         *      when passed a path to exclude (true exludes it)
         * @returns {function} FileList instance
         */
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
        
        /**
         * Clear out the exclude patterns and functions.
         * 
         * @method clearExcludes
         * @returns {function} FileList instance
         */
        clearExcludes: function () {
            this.__exPats__.splice(0, this.__exPats__.length);
            this.__exFns__.splice(0, this.__exFns__.length);
            return this;
        },
        
        /**
         * If we haven't been resolved, resolve our pending items
         * 
         * @method resolve
         * @returns {function} FileList instance
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

        
        /**
         * Will the passed path be excluded?
         * 
         * @method excludes
         * @param path {string} file path to see if it will be excluded
         * @returns {boolean}
         */
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
        },
        
        get: function (idx) {
            this.resolve();
            return this.__items__[idx];
        },
        
        set: function (idx, val) {
            this.resolve();
            this.__items__[idx] = val;
            this.__pending__ = true;
        },
        
        get length () {
            this.resolve();
            return this.__items__.length;
        },
        
        set length (amt) {
            this.resolve();
            this.__items__.length = amt;
        },
        
        get items () {
            this.resolve();
            return this.__items__.slice();
        }
        
    });
    
}());