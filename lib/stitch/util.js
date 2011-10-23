
(function (exports) {

    var empty   = function NOOP () {},
        rNull   = 'null',
        oObject = 'object',
        aArray  = 'array',
        nNumber = 'number',
        sString = 'string',
        fFunction  = 'function',
        bBoolean   = 'boolean',
        uUndefined = 'undefined',
        util
    ;

    /**
     * Returns all indexes from start up to, but not including, end
     * @method slice
     * @param obj {object} array-like object to slice
     * @param start {number} optional, starting index
     * @param end {number} optionaal, ending index
     * @returns {array}
     */
    function slice (obj, start, end) {
        return Array.prototype.slice.call(obj, start, end);
    }

    /**
     * Various methods to determine 'is-ness'
     * @returns {boolean}
     */
    function isArray (a) {
        return a instanceof Array;
    }

    function isBoolean (b) {
        return typeof b === bBoolean;
    }

    function isFunction (f) {
        return typeof f === fFunction;
    }

    function isNumber (n) {
        return typeof n === nNumber;
    }

    function isString (s) {
        return typeof s === sString;
    }

    function isObject (o) {
        return (o && o !== null && !isArray(o) && typeof o === oObject);
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
                if (s.hasOwnProperty(key) && (r[key] === undefined || o)) {
                    r[key] = s[key];
                }
            }
        }
    
        return r;
    }

    /**
     * Returns one of several constants depending on what type of
     * value the argument is.
     * 
     * @param o {mixed}
     * @returns {string}
     */
    function typeOf (o) {
        switch (typeof o) {
            case oObject:
                if (o === null) {
                    return rNull;
                }
                else if (o instanceof Array) {
                    return aArray;
                }
                return oObject;
            case sString:
                return sString;
            case nNumber:
                return nNumber;
            case bBoolean:
                return bBoolean;
            case uUndefined:
                return uUndefined;
        }
    }

    merge(typeOf, {
        NULL:       rNull,
        UNDEFINED:  uUndefined,
        BOOLEAN:    bBoolean,
        NUMBER:     nNumber,
        STRING:     sString,
        ARRAY:      aArray,
        FUNCTION:   fFunction,
        OBJECT:     oObject
    });

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
     * object.
     * @param name {string} name of the method to alias
     * @returns {function}
     */
    function aliasMethod (name) {
        return function () {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * 
     * @param scope {object} scope to bind to
     * @param name {string} name of the method to call
     * @returns {function}
     */
    function bindMethod (scope, name) {
        return function () {
            return scope[name].apply(this, arguments);
        };
    }
    
    function bindMethods (child, parent, props) {
        var len, i, p;
        
        props = isArray(props) ? makeEnum(props) : props;
        
        for (p in props) {
            child[p] = bindMethod(parent, [props[p]]);
        }
    }
    
    function bindGetter (child, getter, parent, name) {
        var fn = parent.__lookupGetter__(name);
        child.__defineGetter__(getter, function () {
            return fn.call(this);
        });
    }
    
    function bindGetters (child, parent, names) {
        var n;

        names = names instanceof Array ? makeEnum(names) : names;

        for (n in names) {
            bindGetter(child, n, parent, names[n]);
        }
    }
    
    function bindSetter (child, setter, parent, name) {
        var fn = parent.__lookupSetter__(name);
        child.__defineSetter__(setter, function (v) {
            fn.apply(this, v);
        });
    }
    
    function bindSetters (child, parent, names) {
        var n;
        
        names = isArray(names) ? makeEnum(names) : names;
        
        for (n in names) {
            bindSetter(child, n, parent, names[n]);
        }
    }
    
    function bindProperty (child, name, parent, prop) {
        child.__defineGetter__(name, function () {
            return parent[prop];
        });
        child.__defineSetter__(name, function (v) {
            parent[prop] = v;
        });
    }
    
    function bindProperties (child, parent, props) {
        var p;
        
        props = isArray(props) ? makeEnum(props) : props;
        
        for (p in props) {
            bindProperty(child, p, parent, props[p]);
        }
    }
    
    // export 'em
    merge(exports, util = {
    
        noop:           empty,
    
        typeOf:         typeOf,
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
        bindMethod:     bindMethod,
        bindMethods:    bindMethods,
        bindGetter:     bindGetter,
        bindGetters:    bindGetters,
        bindSetter:     bindSetter,
        bindSetters:    bindSetters,
        bindProperty:   bindProperty,
        bindProperties: bindProperties
        
    });

}(exports || (window.util = {})));