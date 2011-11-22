
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
         *      @param directives {array[array]} directives to define
         *      @param handlers {object} object of handler: functions
         */
        init: function (source, args) {
            
            if (arguments.length < 2) {
                args = source;
                source = null;
            }
            
            this.source = source;
            
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
         * @param source {string} optional, the string to parse
         * @param handlers {object} optional, object of handler definitions
         */
        parse: function (source, handlers) {
            var match;
            
            if (arguments.length < 2 && typeof source === "object") {
                handlers = source;
                source = null;
            }
            
            if (source) {
                this.source = source;
            }

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
            
            /**
             * Fired when Parser starts parsing
             * 
             * @event start
             * @param {object} Parser
             */
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
            
            /**
             * Fired when parsing is complete
             * 
             * @event complete
             * @param {object} Parser
             */
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
                // Try to match the start token, and if the directive has
                // defined a function for further parsing see if it returns
                // something
                if (this.scan(dir.token) &&
                    ((fn && (args = fn.call(this))) || !fn)
                ) {
                    // turn our return values into an array, or use the
                    // regex captures array.
                    args = args || this.captures;
                    args = Array.isArray(args) ? args : [args];
                    // Emit the directive event
                    this.emit.apply(this, [dir.name].concat(args));
                    // Update our directive ending position
                    this.directiveEndPos = this.head;
                    return true;
                }
                else {
                    // reset our position
                    this.head = pos;
                }
            }
            
            return false;
        },
        
        get source () {
            return this.__source__ || "";
        },
        
        set source (txt) {
            if (!this.hasOwnProperty("__source__")) {
                Object.defineProperty(this, "__source__", {
                    value: "",
                    writable: true
                });
            }
            
            this.__source__ = txt ? txt.toString() : "";
            this.reset();
        },
        
        get pos () {
            return this.head;
        },
        
        set pos (idx) {
            this.head = idx;
        },
        
        get prevPos () {
            return this.last;
        },
        
        set prevPos (idx) {},
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
         * Set a marker point in the source string.
         * 
         * @method mark
         * @returns {integer}
         */
        mark: function () {
            if (!this.hasOwnProperty("__marker__")) {
                Object.defineProperty(this, "__marker__", {
                    value: 0,
                    writable: true
                });
            }
            
            return (this.__marker__ = this.pos);
        },
        
        /**
         * Get the text from the previous mark point up to the current
         * position minus the given offset.
         * 
         * @method getFromMark
         * @param endOffset {integer} optional, offset from current position,
         *      defaults to #getMatch().length
         * @returns {string} the text from the previous marker up to the
         *      current position minus the endOffset
         */
        getFromMark: function (endOffset) {
            var marker = this.__marker__ || 0;
            
            endOffset = typeof endOffset === "number" ?
                endOffset :
                this.getMatch().length;

            return this.source.slice(marker, this.pos - endOffset);
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
         *      0: {string} name of the directive, and the name of the event
         *          emitted by the parser when a directive is called
         *      1: {RegExp} start token for the directive
         *      2: {function} optional, a function to further parse the
         *          current directive. It is called with 'this' pointing to
         *          the current parser instance. Parser expects the function
         *          to return a truthy value, or an array of values -- these
         *          are passed on to the event called by the name of the
         *          directive
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
