
(function (exports) {

    var empty   = function NOOP () {},
        kNull   = 'null',
        kObject = 'object',
        kArray  = 'array',
        kNumber = 'number',
        kString = 'string',
        kFunction  = 'function',
        kBoolean   = 'boolean',
        kUndefined = 'undefined',
        templateSettings,
        util
    ;

    /**
     * Various methods to determine 'is-ness'
     * @returns {boolean}
     */
    function isArray (a) {
        return Array.isArray(a);
    }

    function isBoolean (b) {
        return typeof b === kBoolean;
    }

    function isFunction (f) {
        return typeof f === kFunction;
    }

    function isNumber (n) {
        return typeof n === kNumber;
    }

    function isString (s) {
        return typeof s === kString;
    }

    function isObject (o) {
        return (o && o !== null && !isArray(o) && typeof o === kObject);
    }
    
    function isNull (n) {
        return n === null;
    }
    
    function isDefined (d) {
        return d !== kUndefined && d !== null;
    }

    /**
     * Returns all indexes from start up to, but not including, end
     * 
     * @method slice
     * @param obj {object} array-like object to slice (should have a length
     *      property and integer keys)
     * @param start {number} optional, starting index
     * @param end {number} optionaal, ending index
     * @returns {array}
     */
    function slice (obj, start, end) {
        start = isNumber(start) ? start : 0;
        end = isNumber(end) ? end : obj.length;
        return Array.prototype.slice.call(obj, start, end);
    }

    /**
     * Merge the properties of the supplier object into the receiver
     * @param r {object} receiver
     * @param arg1..argN {object} supplier(s)
     * @param o {boolean} default true, overwrite an existing property?
     * @returns {object} the receiver object
     */
    function merge (r) {
        var len     = arguments.length,
            nIdx    = len - 1,
            last    = arguments[nIdx],
            isBool  = typeof last === 'boolean',
            o       = isBool ? last : true,
            args    = slice(arguments, 1, isBool ? nIdx : len),
            key, s, i
        ;
    
        for (i = 0, len = args.length; i < len; i++) {
            s = args[i];
            for (key in s) {
                if (s.hasOwnProperty(key) && (r[key] === kUndefined || o)) {
                    r[key] = s[key];
                }
            }
        }
    
        return r;
    }

    /**
     * Map a list of arguments to a hash.
     * @param arg1..argN {mixed}
     * @returns {object}
     */
    function makeEnum () {
        var obj = {},
            i = 0,
            len = arguments.length,
            key
        ;
    
        for (; i < len; i++) {
            key = arguments[i];
            obj[key] = key;
        }
    
        return obj;
    }
   
    /**
     * Return a function that is bound to call another function on the current
     * object, or the supplied one.
     * 
     * @param name {string} name of the method to alias
     * @param scope {object} optional, scope to call the aliased method in
     * @returns {function}
     */
    function aliasMethod (name, scope) {
        return function () {
            scope = scope || this;
            return scope[name].apply(scope, arguments);
        };
    }

    /**
     * Swap out the interface of an object with another.
     * @param subject {object}
     * @param map {object} the interface to swap onto the subject
     * @returns {object} an interface of the subject objects properties
     *      that were swapped
     */
    function swapInterface (subject, map) {
        var store = {},
            hasOwn = Object.prototype.hasOwnProperty,
            getter, setter,
            key
        ;
        
        for (key in map) {
            getter = subject.__lookupGetter__(key);
            setter = subject.__lookupSetter__(key);
            
            if (getter || setter) {
                getter = getter && store.__defineGetter__(key, getter);
                setter = setter && store.__defineSetter__(key, setter);
            }
            else {
                store[key] = subject[key];
            }
            
            getter = map.__lookupGetter__(key);
            setter = map.__lookupSetter__(key);
            
            if (getter || setter) {
                getter = getter && subject.__defineGetter__(key, getter);
                setter = setter && subject.__defineSetter__(key, setter);
            }
            else {
                if (map[key] !== kUndefined) {
                    subject[key] = map[key];
                }
                else {
                    delete subject[key];
                }
            }
        }
        
        return store;
    }
    
    //------------------------------------------------------------------------
    // The following was borrowed from underscore
    //------------------------------------------------------------------------
    
    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    templateSettings = {
      evaluate    : /%\{([\s\S]+?)\}/g,
      interpolate : /\$\{([\s\S]+?)\}/g
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    function template (str, data) {
        var c  = templateSettings,
            tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
                'with(obj||{}){__p.push(\'' +
                str.replace(/\\/g, '\\\\').
                replace(/'/g, "\\'").
                replace(c.interpolate, function(match, code) {
                    return "'," + code.replace(/\\'/g, "'") + ",'";
                }).
                replace(c.evaluate || null, function(match, code) {
                    return "');" + code.replace(/\\'/g, "'").
                        replace(/[\r\n\t]/g, ' ') + "__p.push('";
                }).
                replace(/\r/g, '\\r').
                replace(/\n/g, '\\n').
                replace(/\t/g, '\\t') +
                "');}return __p.join('');",
            func = new Function('obj', tmpl)
        ;
        
        return data ? func(data) : func;
    }
    
    // export 'em
    merge(exports, util = {
    
        noop:           empty,
    
        isArray:        isArray,
        isNumber:       isNumber,
        isBoolean:      isBoolean,
        isFunction:     isFunction,
        isObject:       isObject,
        isString:       isString,
        
        makeEnum:       makeEnum,
        merge:          merge,
        slice:          slice,
        
        aliasMethod:    aliasMethod,
        swapInterface:  swapInterface,
        
        template:       template
        
    });

}(exports || (window.util = {})));