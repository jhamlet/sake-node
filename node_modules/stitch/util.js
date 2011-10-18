
(function (exports) {
    
var util = {
    noop: function () {},
    
    /**
     * Merge the properties of the supplier object into the receiver
     * @param r {object} receiver
     * @param arg1..argN {object} supplier(s)
     * @param o {boolean} default true, overwrite an existing property?
     * @returns {object} the receiver object
     */
    merge: function (r) {
        var len     = arguments.length,
            nIdx    = len - 1,
            last    = arguments[nIdx],
            isBool  = typeof last === 'boolean',
            o       = isBool ? last : true,
            args    = util.slice(arguments, 1, isBool ? nIdx : len),
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
    },
    
    /**
     * Returns all indexes from start up to, but not including, end
     * @method slice
     * @param obj {object} array-like object to slice
     * @param start {number} optional, starting index
     * @param end {number} optionaal, ending index
     * @returns {array}
     */
    slice: function (obj, start, end) {
        return Array.prototype.slice.call(obj, start, end);
    },
    
    /**
     * Create a new object with the supplied prototype, and initialize the
     * new instance with the supplied properties
     * @method createObject
     * @param proto {object} optional, prototype object, defaults to Object.prototype
     * @param props {object} properties for new object
     * @returns {object}
     */
    createObject: function (proto, props) {
        if (props === undefined) {
            return this.merge(Object.create(Object.prototype), proto);
        }
        else {
            return Object.create(proto);
        }
    },
    
    alias: function (method) {
        return function () {
            return this[method].apply(this, arguments);
        };
    }
};

util.merge(exports, util);

}(exports || (window.util = {})));