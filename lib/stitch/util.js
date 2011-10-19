
(function (exports) {

var util,
    createObject,
    rNull   = 'null',
    oObject = 'object',
    aArray  = 'array',
    nNumber = 'number',
    sString = 'string',
    fFunction  = 'function',
    bBoolean   = 'boolean',
    uUndefined = 'undefined'
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
 * Return a function that is bound to call another function on the current
 * object.
 * @param method {string} name of the method to alias
 * @returns {function}
 */
function alias (method) {
    return function () {
        return this[method].apply(this, arguments);
    };
}

/**
 * Create a new object with the supplied prototype, and initialize the
 * new instance with the supplied properties. After composing the object
 * look for an 'init' function and call it with the remaining arguments.
 * 
 * The 'init' function can be configured by modifying 
 * 'util.createObject.initFn'
 * 
 * @method createObject
 * @param proto {object} prototype object, defaults to Object.prototype
 * @param props {object} optional, properties for new object. These can
 *      either be plain properties, or defineProperty specifications.
 * @param args {array[mixed]} optional, arguments to pass to init function
 * @returns {object}
 */
createObject = (function () {
    // enclose some re-useable things in this closure
    var propertiesKeys = makeEnum("value", "enumerable", "writable",
            "configurable", "get", "set")
    ;
    
    function isPropSpec (p) {
        var key;
        
        // short-circuit on non-object values
        if (!p || p instanceof Array || typeof p !== 'object') {
            return false;
        }
        
        for (key in p) {
            if (propertiesKeys[key]) {
                return true;
            }
        }
        
        return false;
    }
    
    // return the meat of the function
    return function (proto, props, args) {
        var obj, key, fn;
        
        obj = Object.create(
            isObject(proto) ?
                proto :
                Object.prototype
        );
        
        if (isObject(props)) {
            for (key in props) {
                if (isPropSpec(props[key])) {
                    obj.defineProperty(key, props[key]);
                }
                else {
                    obj[key] = props[key];
                }
            }
        }
        
        if ((fn = obj[createObject.initFn])) {
            args = isArray(props) ? props : args || [];
            fn.apply(obj, args);
        }

        return obj;
    };
}());

/**
 * The name of the function to call when creating a new object
 * @property initFn
 * @namespace util.createObject
 * @type {string}
 */
createObject.initFn = 'init';

// export 'em
merge(exports, util = {
    
    noop: function () {},
    
    typeOf:         typeOf,
    isArray:        isArray,
    isNumber:       isNumber,
    isBoolean:      isBoolean,
    isFunction:     isFunction,
    isObject:       isObject,
    isString:       isString,

    createObject:   createObject,

    makeEnum: makeEnum,
    merge:    merge,
    slice:    slice,
    alias:    alias
});

}(exports || (window.util = {})));