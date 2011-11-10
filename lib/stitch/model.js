
var Proteus = require('proteus'),
    EM      = require("events").EventEmitter,
    util    = require('./util'),
    Model
;

module.exports = Model = Proteus.Class.derive({
    
    self: {
        // Class props
        id: "Model",
        
        inherited: function (subclass) {
            subclass.records = {};
            subclass.__uuid__ = 0;
        },

        initialize: function (rec, args) {
            var id = rec.id = this.__uuid__++;
            Object.defineProperty(rec, "__private__", {value: {}});
            Object.defineProperty(rec, "__model__", {value: this});
            this.records[id] = rec;
        },

        get: function (id) {
            return this.records[id];
        },

        has: function (id) {
            return Boolean(this.get(id));
        },
        
        getAll: function () {
            var recs;
            // temporarily assign a length property so slice will work
            this.records.length = this.__uuid__;
            recs = util.slice(this.records);
            delete this.records.length;
            return recs;
        },

        /**
         * 
         * @method find
         * @param args {object|function} an object with key/value pairs
         *      to match, or a function that 
         * @param sortFn {type} description
         * @returns {type}
         */
        find: function (args, sortFn) {
            var records = this.records,
                ret = [],
                rec, key
            ;

            for (rec in records) {
                rec = records[rec];
                if (rec.matches(args)) {
                    ret.push(rec);
                }
            }
            
            if (sortFn) {
                ret.sort(sortFn);
            }
            
            return ret;
        },
        
        destroy: function (id) {
            delete this.records[id];
        }
    }, // end self
    
    // Instance props
    init: function () {
        this.constructor.emit("created", this);
    },
    
    destroy: function () {
        this.__model__.destroy(this.id);
    },
    
    matches: function (args) {
        var key;
        
        if (util.isFunction(args)) {
            return args(this);
        }
        
        for (key in args) {
            if (this[key] !== args[key]) {
                return false;
            }
        }
        
        return true;
    }
    
});

Proteus.extend(Model, EM.prototype);
