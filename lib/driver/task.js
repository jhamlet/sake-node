
(function () {
    
    var Proteus = require("proteus"),
        util    = require("../util"),
        INVOCATION_QUEUE = [],
        TIMEOUT_QUEUE = [],
        INVOCATION_INDEX,
        Task, TaskDriver
    ;

    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function isNeeded (task) {
        return (!task.alreadyRun && task.isNeeded);
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
            var prereq = Task.get(name);
            if (isNeeded(prereq)) {
                this.splice.apply(
                    this,
                    [this.length, 0].concat(mapPrereqs(prereq, args))
                );
            }
        }, chain);
        
        if (isNeeded(task)) {
            task.actions.forEach(function (fn, i) {
                chain.push({task: task, index: i, args: args});
            });
        }
        
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

            if (!Task) {
                Task = require("../model/task");
            }
            
            // Add the task's prerequisites and actions to the invocation
            // queue, either at the end if we aren't running, or just after
            // where we are now if we are running.
            INVOCATION_QUEUE.splice.apply(
                INVOCATION_QUEUE,
                [nextIdx, 0].concat(mapPrereqs(task, args))
            );
            
            // console.log(INVOCATION_QUEUE.length);
            
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
            
            Task.on("asyncStarted", this.__startAsyncListener__);
            Task.on("asyncCleared", this.__clearAsyncListener__);

            INVOCATION_INDEX = -1;
            this.next();
            return this;
        },
        
        next: function () {
            var current = INVOCATION_QUEUE[INVOCATION_INDEX],
                currentTask,
                next, task, idx, fn, args
            ;
            
            this.isRunning = true;
            
            INVOCATION_INDEX++;

            next = INVOCATION_QUEUE[INVOCATION_INDEX];
            task = next && next.task;
            
            // Are we transitioning between tasks?
            if (current && (currentTask = current.task) !== task) {
                currentTask.alreadyRun = true;
                currentTask.emit("complete", current);
            }

            // No next task? we're done
            if (!next) {
                return this.complete();
            }
            // Has the next task been run, or is it even needed?
            else if (!isNeeded(task)) {
                // console.log("not needed");
                return this.next();
            }
            
            // Fire the next action
            idx = next.index;
            fn = task.actions[idx];
            args = [task].concat(next.args);
            
            task.emit("action", task);
            fn.apply(task, args);
            
            // If the startAsync has been called, we wait until it is cleared
            // before advancing to the next action.
            if (!next.async) {
                this.next();
            }
            
            return this;
        },
        
        complete: function () {
            this.isRunning = false;
            Task.removeListener("startAsync", this.__startAsyncListener__);
            Task.removeListener("clearAsync", this.__clearAsyncListener__);
            delete this.__startAsyncListener__;
            delete this.__clearAsyncListener__;
            INVOCATION_QUEUE.splice(0, INVOCATION_QUEUE.length);
            INVOCATION_INDEX = -1;
        },
        
        timeout: function (obj) {
            var task = obj.task;
            task.emit("timeout", task);
            this.clearAsync();
        },
        
        startAsync: function (ms) {
            var obj = INVOCATION_QUEUE[INVOCATION_INDEX];
            
            if (!this.isRunning || !obj) {
                return;
            }
            
            obj.async = 1;
            
            TIMEOUT_QUEUE.push(setTimeout(function () {
                this.timeout(obj);
            }.bind(this), ms || 10000));
        },
        
        clearAsync: function () {
            var obj = INVOCATION_QUEUE[INVOCATION_INDEX],
                tId = TIMEOUT_QUEUE.pop(),
                isAsync
            ;
            
            if (!this.isRunning || !obj) {
                return;
            }
            
            isAsync = obj.async > 0;
            tId = tId && clearTimeout(tId);
            
            obj.async--;
            if (isAsync && obj.async === 0) {
                // console.log("TaskDriver#clearAsync: " + obj.task.name);
                this.next();
            }
            
            return this;
        },
        
        get isAsync () {
            return Boolean(TIMEOUT_QUEUE.length);
        }
    });
    
}());