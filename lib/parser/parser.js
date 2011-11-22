
(function () {
    
    var Proteus       = require("proteus"),
        FS            = require("fs"),
        EM            = require("events").EventEmitter,
        StringScanner = require("strscan").StringScanner,
        Parser
    ;
    
    module.exports = Parser = Proteus.Class.derive({
        /**
         * 
         * @method init
         * @param args {object} optional, parameters to define this instance
         *      of Parser
         *      @property directives {array[array]} directives to define
         *      @property handlers {object} object of handler: functions
         */
        init: function (args) {
            
            if (args && args.directives) {
                this.defineDirectives(args.directives);
            }
            
            if (args && args.handlers) {
                this.registerHandlers(args.handlers);
            }
        },
        
        /**
         * Parse the supplied source string for directive patterns, firing off
         * the event for that directive as we go.
         * 
         * @method parse
         * @param source {string} the string to parse
         * @param handlers {object} optional, object of handler definitions
         */
        parse: function (source, handlers) {
            var match;
            
            this.source = source.toString();
            this.reset();
            
            if (handlers) {
                this.registerHandlers(handlers);
            }
            
            if (!this.__directives__) {
                throw new Error("No directives defined for Parser");
            }
            
            /**
             * End point of the last directive
             * 
             * @property directiveEndPos
             * @type {integer}
             */
            this.directiveEndPos = 0;
             /**
              * Starting point of the last directive
              * 
              * @property directiveStartPos
              * @type {integer}
              */
            this.directiveStartPos = 0;
            
            this.emit("start", this);
            
            while (this.scanUntil(this.tokenUnion)) {
                match = this.getMatch();
                this.head -= match.length;
                this.directiveStartPos = this.head;
                if (!this.scanDirectives()) {
                    // nothing matched, reset and move on
                    this.head += match.length;
                    this.directiveStartPos = this.head;
                }
            }
            
            this.emit("complete", this);
        },
        
        /**
         * Using our defined directives try to find a match at our current
         * position. They are tried in reverse order from which they were 
         * added (last-in, first tried).
         * 
         * @method scanDirectives
         * @returns {boolean}
         */
        scanDirectives: function () {
            var list = this.__directives__,
                i = list.length,
                pos, dir, fn, args
            ;
            
            while (i--) {
                dir = list[i];
                fn = dir.parser;
                pos = this.head;
                if (this.scan(dir.token) &&
                    ((fn && (args = fn.call(this))) || !fn)
                ) {
                    args = args || this.captures;
                    args = Array.isArray(args) ? args : [args];
                    args.unshift(dir.name);
                    this.emit.apply(this, args);
                    this.directiveEndPos = this.head;
                    return true;
                }
                else {
                    this.head = pos;
                }
            }
            
            return false;
        },
        
        /**
         * @property tokenUnion
         * @type {RegExp}
         */
        get tokenUnion () {
            if (!this.hasOwnProperty("__tokenUnion__")) {
                Object.defineProperty(this, "__tokenUnion__", {
                    value: undefined,
                    writable: true
                });
            }
            
            if (!this.__tokenUnion__) {
                this.__tokenUnion__ = new RegExp(
                    this.__directives__.map(function (obj) {
                        return obj.token.source;
                    }).join("|")
                );
            }
            
            return this.__tokenUnion__;
        },
        
        /**
         * Get the text between the end point of our last directive found,
         * and the starting point of the current directive found.
         * 
         * @property preDirectiveMatch
         * @type {string}
         */
        get preDirectiveMatch () {
            return this.source.substr(
                this.directiveEndPos,
                this.directiveStartPos - this.directiveEndPos
            );
        },
        
        /**
         * @method registerHandlers
         * @param handlers {object} object of handlers to define
         */
        registerHandlers: function (handlers) {
            var key;

            for (key in handlers) {
                this.on(key, handlers[key]);
            }
        },
        
        /**
         * @method defineDirectives
         * @param directives {array[array]} list of directives to define.
         *      A directive array has the following indices
         *      0: {string} name of the directive
         *      1: {RegExp} start token for the directive
         *      2: {function} optional, a function to further parse the
         *          current directive
         */
        defineDirectives: function (directives) {
            if (!this.hasOwnProperty("__directives__")) {
                Object.defineProperty(this, "__directives__", {
                    value: []
                });
            }
            
            directives.forEach(function (args) {
                this.__directives__.push({
                    name:   args[0],
                    token:  args[1],
                    parser: args[2]
                });
            }, this);
        }
        
    });
    
    // Mix-in EventEmitter and StringScanner functionality
    Parser.include(EM, StringScanner);
    
}());
