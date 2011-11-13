
(function (exports) {

    var Path     = require("path"),
        FS       = require("fs"),
        EM       = require("events").EventEmitter,
        Proteus  = require("proteus"),
        util     = require("./util"),
        Model    = require("./model"),
        Task, FileTask // to be defined
    ;

    //------------------------------------------------------------------------
    // Privates
    //------------------------------------------------------------------------
    
    /**
     * Run a Tasks prerequisites asynchronously
     * 
     * @method runPrerequisites
     * @private
     */
    function runPrerequisites () {
        var preqs = this.prerequisites,
            len = preqs.length,
            idx = 0,
            name, preq, callback, ret
        ;
        
        callback = function (t) {
            name = preqs[idx];
            
            if (!name) {
                ret = t && t.removeListener("complete", callback);
                return this.emit("__preqs__", this);
            }
            
            idx++;
            preq = Task.get(name);
            preq.on("complete", callback);
            preq.invoke();
        }.bind(this);

        callback();
    }

    /**
     * Run a Tasks actions asynchronously
     * 
     * @method runActions
     * @private
     */
    function runActions () {
        var actions = this.actions,
            len = actions.length,
            idx = 0,
            taskArgs = [this].concat(this.taskArguments),
            action, callback
        ;
        
        callback = function (t) {
            action = actions[idx];
            
            if (!action) {
                this.removeListener("__action__", callback);
                return this.emit("__actions__", this);
            }
            
            idx++;
            action.apply(this, taskArgs);
            
            if (!Task.isAsync) {
                this.emit("__action__", this);
            }
        }.bind(this);
        
        this.on("__action__", callback);
        callback();
    }

    
    //------------------------------------------------------------------------
    // Publics
    //------------------------------------------------------------------------
    
    module.exports = Task = Model.derive({

        self: {
            // Override Proteus.Class#derive so we maintain one Model for all tasks
            derive: function (props) {
                return Proteus.Class.derive().include(Model, this, props);
            },

            /**
             * 
             * @method normalizeArguments
             * @static
             * @param args {array-like} arguments
             * @returns {object}
             *      - name {string}
             *      - prerequisites {string|array[string]}
             *      - actions {function|array[function]}
             */
            normalizeArguments: function (args) {
                var name = args[0],
                    prerequisites = args[1],
                    actions = args[2]
                ;

                if (!actions && typeof prerequisites === "function") {
                    actions = prerequisites;
                    prerequisites = undefined;
                }

                return {
                    name: name,
                    prerequisites: prerequisites,
                    actions: actions
                };
            },

            /**
             * If we already have a defined task, extend it.
             * 
             * @method initialize
             * @static
             * @param task {object} Task
             * @param args {array-like} arguments passed to constructor
             * @returns {object|undefined} if already defined, a Task object,
             *      otherwise, nothing
             */
            initialize: function (task, args) {
                var t;

                args = this.normalizeArguments(args);

                this.initializing = true;
                if ((t = this.get(args.name))) {
                    t.enhance(args.prerequisites, args.actions);
                }
                else {
                    Model.initialize.call(this, task, args);
                }

                delete this.initializing;

                if (t) {
                    return t;
                }
            },

            /**
             * Get a Task by id or name, or try to synthesize a FileTask
             * 
             * @method get
             * @static
             * @param id {integer|string}
             * @returns {object|null}
             */
            get: function (id) {
                return Model.get.call(this, id) ||
                        this.find({name: id})[0] ||
                        (!this.initializing && Path.existsSync(id) ?
                            new FileTask(id) :
                            null);
            },

            /**
             * Invoke the named task
             * 
             * @method invoke
             * @static
             * @param name {string} name of the task to invoke
             * @param rest {mixed} additional arguments for the task
             */
            invoke: function (name /*, rest */) {
                var task, taskCallback;

                if (!(task = this.get(name))) {
                    throw new Error("Do not know how to run task '" + name + ".'");
                }
                
                return task.invoke.apply(task, util.slice(arguments, 1));
            },
            
            /**
             * Set the asynchronous flag.
             * 
             * @method setAsync
             * @static
             */
            setAsync: function () {
                this.isAsync = true;
            },
            
            /**
             * Clear the asynchronous flag, and fire the "clearAsync" event
             * @method clearAsync
             * @static
             */
            clearAsync: function () {
                if (this.isAsync) {
                    this.isAsync = false;
                    /**
                     * @event clearAsync
                     */
                    this.emit("clearAsync");
                }
            }
        },

        /**
         * 
         * @method init
         * @param name {string} name of the task
         * @param prerequisites {array[string]|string} a named task, an array of
         *      named tasks
         * @param actions {function} function to execute when task is invoked
         */
        init: function (name, prerequisites, actions) {
            var args = Task.normalizeArguments(arguments);

            this.name = args.name;
            this.prerequisites = [];
            this.actions = [];
            this.enable();

            this.enhance(args.prerequisites, args.actions);

            Task.__super__.init.apply(this, arguments);
        },

        /**
         * Add prerequisites and actions to the Task
         * 
         * @method enhance
         * @param deps {array[string]} additional prerequisites for this task
         * @param actions {array[function]} additional actions for this task
         * @returns {object} Task
         */
        enhance: function (deps, actions) {
            deps = !deps ? [] :
                    Array.isArray(deps) ? deps : [deps];

            actions = !actions ? [] :
                        Array.isArray(actions) ? actions : [actions];
            
            // TODO: Determine if this work is really necessary. We check to 
            // see if a prerequisite is already run or if it is even needed,
            // so, theoretically, they should not be called twice.
            deps.forEach(function (p) {
                if (!~this.indexOf(p)) {
                    this.splice(this.length, 0, p);
                }
            }, this.prerequisites);

            // TODO: Same here, if we are adding functions, they most likely
            // will not have the same reference, so the indexOf check is 
            // probably a waste of time.
            actions.forEach(function (f) {
                if (!~this.indexOf(f)) {
                    this.splice(this.length, 0, f);
                }
            }, this.actions);

            return this;
        },

        /**
         * Invoke the Task, running all its prerequisites first, and then all
         * of its own actions.
         * 
         * Additional arguments will be passed to each action after the Task
         * reference, and they can also be accessed via the Tasks#taskArguments
         * property.
         * 
         * @method invoke
         * @returns {object} Task
         */
        invoke: function () {
            var asyncListener,
                preqsListener,
                doneListener
            ;

            if (!this.alreadyRun && this.isNeeded) {
                // If a task action triggered an asynchronous method we listen
                // to the clearAsync event to advance our actions
                Task.on("clearAsync", asyncListener = function () {
                    this.emit("__action__", this);
                }.bind(this));

                // When prerequisites are done running, we can run our actions
                this.on("__preqs__", preqsListener = runActions.bind(this));

                // When our actions are done running, clear out our listeners
                // and signal that this task is complete.
                this.on("__actions__", doneListener = function (t) {
                    this.alreadyRun = true;
                    this.removeListener("clearAsync", asyncListener);
                    this.removeListener("__preqs__", preqsListener);
                    this.removeListener("__actions__", doneListener);
                    this.emit("complete", this);
                }.bind(this));

                this.taskArguments = util.slice(arguments);
                runPrerequisites.call(this);
            }
            else {
                this.emit("complete", this);
            }
            
            return this;
        },
        
        run: util.aliasMethod("invoke"),
        
        /**
         * (re-)enable the Task
         * 
         * @method enable
         * @returns {object} Task
         */
        enable: function () {
            this.alreadyRun = false;
            return this;
        },
        
        /**
         * Alias the clearAsync method from Task so client code can clear the
         * flag themselves.
         */
        clearAsync: util.aliasMethod("clearAsync", Task),

        /**
         * Is this task needed?
         * 
         * @property isNeeded
         * @type boolean
         */
        get isNeeded () {
            return true;
        },

        get timestamp () {
            return Math.max.apply(
                Math,
                this.prerequisites.map(function (p) {
                    return p.timestamp;
                })
            );
        }
    });
    
    // Mixin EventEmitter to our instances
    Task.include(EM);
    
    // Late require
    FileTask = require("./task/file-task");
    
}(exports));
