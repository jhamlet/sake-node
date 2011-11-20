
(function (exports) {

    var Proteus = require("proteus"),
        empty   = function NOOP () {},
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
    Proteus.merge(exports, util = {
    
        noop:           empty,
    
        isArray:        isArray,
        isNumber:       isNumber,
        isBoolean:      isBoolean,
        isFunction:     isFunction,
        isObject:       isObject,
        isString:       isString,
        
        slice:          slice,
        aliasMethod:    aliasMethod,
        template:       template
        
    });

}(exports || (window.util = {})));