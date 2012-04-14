
(function () {
    
    var Proteus = require("proteus"),
        util    = require("../util"),
        INVOCATION_QUEUE = [],
        TIMEOUT_QUEUE = [],
        INVOCATION_INDEX,
        ASYNC_COUNT,
        TaskDriver, sake
    ;

    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function isNeeded (task) {
        return (!task.alreadyRun && task.isNeeded);
    }
    
    function mapActions (task, args) {
        return !isNeeded(task) ?
            [] :
            task.actions.map(function (fn, i) {
                return {task: task, index: i, args: args};
            });
    }
    /**
     * Unwrap a task's prerequistes and their actions and the actions of the
     * task's into one long list.
     * 
     * @param task {object}
     * @param args {array}
     * @returns {array}
     */
    function mapPrereqs (task, args) {
        var chain = [];
        
        task.prerequisites.forEach(function (name) {
            var prereq = sake.Task.get(name);
            if (prereq && isNeeded(prereq)) {
                this.splice.apply(
                    this,
                    [this.length, 0].concat(mapPrereqs(prereq, args))
                );
            }
        }, chain);
        
        chain.splice.apply(
            chain,
            [chain.length, 0,].concat(mapActions(task, args))
        );
        
        return chain;
    }
    
    function mapTask (task, args) {
        var chain = mapPrereqs(task, args);
        
        chain.splice.apply(
            chain,
            [chain.length, 0].concat(mapActions(task, args))
        );
        
        return chain;
    }
    
    //-----------------------------------------------------------------------
    // PUBLIC INTERFACE
    //-----------------------------------------------------------------------
    module.exports = TaskDriver = Proteus.create(module.exports, {
        /**
         * Run a task's prerequisites then its actions, either from the start,
         * or by inserting them into the current invocation queue.
         * 
         * @method run
         * @param task {object} the task to run
         * @param rest {mixed} additional arguments are passed to the tasks
         * @returns {object} TaskDriver
         */
        run: function (task, args) {
            var // args = util.slice(arguments, 1),
                isRunning = this.isRunning,
                nextIdx = isRunning ?
                            INVOCATION_INDEX + 1 :
                            INVOCATION_QUEUE.length
            ;

            args = util.slice(args);
            
            sake = sake ? sake : require("./sake");
            
            // Add the task's prerequisites and actions to the invocation
            // queue, either at the end if we aren't running, or just after
            // where we are now if we are running.
            INVOCATION_QUEUE.splice.apply(
                INVOCATION_QUEUE,
                [nextIdx, 0].concat(mapPrereqs(task, args))
            );
            
            if (!isRunning) {
                this.start();
            }
            
            return this;
        },
        
        start: function () {
            if (this.isRunning) {
                return this;
            }
            
            Object.defineProperties(this, {
                __startAsyncListener__: {
                    value: this.startAsync.bind(this),
                    configurable: true
                },
                __clearAsyncListener__: {
                    value: this.clearAsync.bind(this),
                    configurable: true
                }
            });
            
            sake.Task.on("asyncStarted", this.__startAsyncListener__);
            sake.Task.on("asyncCleared", this.__clearAsyncListener__);

            INVOCATION_INDEX = -1;
            this.next();
            return this;
        },
        
        next: function () {
            var next, task, idx, fn, args;
            
            this.isRunning = true;
            
            INVOCATION_INDEX++;

            next = INVOCATION_QUEUE[INVOCATION_INDEX];
            task = next && next.task;
            
            // No next task? we're done
            if (!next) {
                return this.complete();
            }
            
            // Fire the next action
            idx = next.index;
            fn = task.actions[idx];
            args = [task].concat(next.args);
            
            if (idx === 0) {
                sake.debug("[" + task.name + " start]");
            }
            
            task.emit("action", task);
            sake.debug("[running " + task.name + " action " + idx + "]");
            fn.apply(task, args);
            
            if (fn.__isAsync__) {
                sake.debug("[" + task.name + " is async]");
                this.startAsync();
            }
            
            // If startAsync has been called, we wait until it is cleared
            // before advancing to the next action.
            if (!this.isAsync) {
                sake.debug("[" + task.name + " action " + idx + " is not async]");
                return this.postNext(next);
            }
            
            return this;
        },
        
        postNext: function (next) {
            var task = next.task;
            
            if (next.index === task.actions.length - 1) {
                sake.debug("[" + task.name + " done]");
                task.alreadyRun = true;
                task.emit("complete", task);
            }
            
            this.next();
            
            return this;
        },
        
        complete: function () {
            this.isRunning = false;
            sake.Task.removeListener("startAsync", this.__startAsyncListener__);
            sake.Task.removeListener("clearAsync", this.__clearAsyncListener__);
            delete this.__startAsyncListener__;
            delete this.__clearAsyncListener__;
            INVOCATION_QUEUE.splice(0, INVOCATION_QUEUE.length);
            INVOCATION_INDEX = -1;
        },
        
        timeout: function (obj) {
            var task = obj.task;
            task.emit("timeout", task);
            sake.debug("[task timed out]");
            this.clearAsync();
        },
        
        startAsync: function (ms) {
            if (ASYNC_COUNT === undefined) {
                ASYNC_COUNT = 0;
            }
            
            ASYNC_COUNT++;
            
            TIMEOUT_QUEUE.push(setTimeout(
                function (obj) {
                    this.timeout(obj);
                }.bind(this, INVOCATION_QUEUE[INVOCATION_INDEX]),
                ms || 30000
            ));
        },
        
        clearAsync: function () {
            var isAsync = ASYNC_COUNT > 0,
                obj;
            
            if (!this.isRunning) {
                return;
            }
            
            clearTimeout(TIMEOUT_QUEUE.pop());
            
            ASYNC_COUNT--;
            if (ASYNC_COUNT === 0) {
                obj = INVOCATION_QUEUE[INVOCATION_INDEX];
                sake.debug("[Clearing async for " + obj.task.name + ", action: " + obj.index + "]");
                return this.postNext(obj);
            }
            
            return this;
        },
        
        get isAsync () {
            return Boolean(ASYNC_COUNT);
        }
    });
    
}());