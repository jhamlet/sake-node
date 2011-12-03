
(function () {
    
    var Proteus = require("proteus"),
        EM      = require("events").EventEmitter,
        util = require("./util"),
        AsyncQueue
    ;
    
    module.exports = AsyncQueue = Proteus.Class.derive({
        /**
         * Initialize the AsyncQueue with the passed functions.
         * 
         * @method init
         * @param rest {array[function]|function} either an array of functions,
         *      or individual functions as arguments.
         */
        init: function () {
            Object.defineProperties(this, {
                __queue__: {
                    value: []
                },
                
                __queueIndex__: {
                    value: 0,
                    writable: true
                },
                
                __timeoutQueue__: {
                    value: []
                }
            });
            
            this.add.apply(this, arguments);
        },
        //-------------------------------------------------------------------
        // EVENTS
        //-------------------------------------------------------------------
        /**
         * Fired when the AsyncQueue starts
         * 
         * @event start
         * @param {object} the AsyncQueue instance
         */
         
        /**
         * Fired when all of the functions in the AsyncQueue are done running
         * 
         * @event done
         * @param {object} the AsyncQueue instance
         */

        /**
         * Fired before the next function is run.
         * 
         * @event next
         * @param {object} the AsyncQueue instance
         * @param {function} the function about to be run
         */

        /**
         * @event asyncSet
         * @param {object} the AsyncQueue instance
         * @param {function} the currently running function
         */

        /**
         * @event asyncCleared
         * @param {object} the AsyncQueue instance
         * @param {function} the currently running function
         */
        //-------------------------------------------------------------------
        // METHODS
        //-------------------------------------------------------------------
        /**
         * Add functions to the AsyncQueue
         * 
         * @method add
         * @param rest {function|array[function]} one or more functions, or 
         *      an array of functions
         * @returns {AsyncQueue}
         */
        add: function () {
            var args = Array.isArray(arguments[0]) ?
                        arguments[0] :
                        util.slice(arguments);
                        
            args.forEach(function (arg) {
                this.__queue__.push({
                    action: arg,
                    asyncCount: 0
                });
            }, this);
            
            return this;
        },
        
        /**
         * Call the next function in the queue. If the asynchronous flag has
         * not been cleared for this queue, an error will be thrown.
         * 
         * @method next
         * @returns {AsyncQueue}
         */
        next: function () {
            var obj, idx;

            if (this.isAsync) {
                throw new Error(
                    "AsyncQueue#next called before asynchronous flag cleared"
                );
            }
            
            idx = ++this.__queueIndex__;
            if (idx >= this.__queue__.length) {
                this.isRunning = false;
                return this.emit("done", this);
            }

            obj = this.__queue__[idx];
            
            this.emit("next", this, obj.action);
            obj.action();

            if (!obj.asyncCount) {
                this.next();
            }
            
            return this;
        },
        
        /**
         * Start running the functions in the queue. If already running, an
         * error will be thrown.
         * 
         * @method start
         * @returns {AsyncQueue}
         */
        start: function () {
            if (this.isRunning) {
                throw new Error("AsyncQueue#start called when already started.");
            }
            this.__queueIndex__ = -1;
            this.isRunning = true;
            this.emit("start", this);
            this.next();
            return this;
        },
        
        
        /**
         * Set the Asynchronous flag for this AsyncQueue
         * 
         * @method setAsync
         * @param ms {integer} number of miliseconds before timeout
         * @returns {AsyncQueue}
         */
        setAsync: function (ms) {
            var obj = this.__queue__[this.__queueIndex__];
            obj.asyncCount++;
            this.emit("asyncSet", this, obj.action);

            this.__timeoutQueue__.push(setTimeout(function () {
                this.emit("timeout", this, obj.action);
                process.exit(1);
            }.bind(this), ms || 10000));
            
            return this;
        },
        
        /**
         * Clear the Asynchronous flag for this AsyncQueue
         * 
         * @method clearAsync
         * @returns {AsyncQueue}
         */
        clearAsync: function () {
            var obj = this.__queue__[this.__queueIndex__],
                isAsync = obj.asyncCount > 0,
                tId = this.__timeoutQueue__.pop();
            ;

            tId = tId && clearTimeout(tId);
            
            obj.asyncCount--;
            this.emit("asyncCleared", this, obj.action);

            if (isAsync && obj.asyncCount === 0) {
                this.next();
            }
            
            return this;
        },
        
        /**
         * @property isAsync
         * @type {boolean}
         */
        get isAsync () {
            var obj = this.__queue__[this.__queueIndex__];
            return (obj && obj.asyncCount > 0);
        }
    });
    
    AsyncQueue.include(EM);
    
}());