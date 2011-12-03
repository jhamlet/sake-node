
(function (exports) {

    var Path       = require("path"),
        FS         = require("fs"),
        EM         = require("events").EventEmitter,
        Proteus    = require("proteus"),
        Model      = require("../model"),
        util       = require("../../util"),
        FileList   = require("../../file-list"),
        AsyncQueue = require("../../async-queue"),
        CURRENT_TASK,
        Task, FileTask, sake // to be defined
    ;

    //------------------------------------------------------------------------
    // PRIVATES
    //------------------------------------------------------------------------
    function resolvePrerequisites () {
        if (this.__pending__) {
            this.__pendingPrereqs__.forEach(function (p) {
                if (p instanceof FileList) {
                    p.items.forEach(function (i) {
                        if (!~this.indexOf(i)) {
                            this.splice(this.length, 0, i);
                        }
                    }, this);
                }
                else {
                    if (!~this.indexOf(p)) {
                        this.splice(this.length, 0, p);
                    }
                }
            }, this.__prerequisites__);
            this.__pendingPrereqs__.slice();
            this.__pending__ = false;
        }
    }
    /**
     * Run a Task prerequisites asynchronously
     * 
     * @method runPrerequisites
     * @private
     */
    function runPrerequisites () {
        var preqs = this.prerequisites,
            len = preqs.length,
            idx = 0,
            name, preq, callback, nil
        ;
        
        sake.log("[" + this.name + " prerequisites start]");
        callback = function (t) {
            name = preqs[idx];
            
            if (idx >= len || !name) {
                nil = t && t.removeListener("complete", callback);
                sake.log("[" + this.name + " prerequisites done]");
                return this.emit("__preqs__", this);
            }

            preq = Task.get(name);
            idx++;
            
            preq.on("complete", callback);
            preq.invoke.apply(preq, this.taskArguments);
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
        
        sake.log("[" + this.name + " actions start]");
        callback = function (t) {
            action = actions[idx];
            
            if (!action) {
                this.removeListener("__action__", callback);
                sake.log("[" + this.name + " actions done]");
                return this.emit("__actions__", this);
            }
            
            idx++;
            action.fn.apply(this, taskArgs);
            
            sake.log(
                "[" + this.name + "[" + (idx - 1) + "] " +
                (action.async ? "is" : "is not") + " Async]"
            );
            if (!action.async) {
                this.emit("__action__", this);
            }
        }.bind(this);
        
        this.on("__action__", callback);
        callback();
    }

    
    //------------------------------------------------------------------------
    // PUBLICS
    //------------------------------------------------------------------------
    module.exports = Task = Model.derive({

        self: {
            // Override Proteus.Class#derive so we maintain one Model for all tasks
            derive: function (props) {
                var Ctor = function (name, deps, fn) {
                        var inst;
                        
                        if ((inst = Task.initialize(this, arguments))) {
                            return inst;
                        }
                        
                        this.init(name, deps, fn);
                    };
                
                Ctor.prototype = Proteus.create(this.prototype, props);
                // Do not re-assign the constructor property so we keep the
                // relationship with "instanceof" Task intact
                return Ctor;
            },

            get currentNamespace () {
                if (!this.__currentNamespace__) {
                    Object.defineProperty(this, "__currentNamespace__", {
                        value: "default",
                        writable: true
                    });
                }
                
                return this.__currentNamespace__;
            },
            
            set currentNamespace (name) {
                if (name) {
                    this.__currentNamespace__ = name;
                    this.emit("namespaceChanged", this, name);
                }
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
             *      - async {boolean}
             */
            normalizeArguments: function (args) {
                var name = args[0],
                    prerequisites = args[1],
                    action = args[2],
                    async = args[3],
                    nameSplit,
                    namespace
                ;

                if (!action && typeof prerequisites === "function") {
                    async = action;
                    action = prerequisites;
                    prerequisites = null;
                }

                if (~name.indexOf(":")) {
                    nameSplit = name.split(":");
                    namespace = nameSplit[0];
                    name = nameSplit[1];
                }
                
                return {
                    name: name,
                    namespace: namespace || this.currentNamespace,
                    prerequisites: prerequisites,
                    action: action,
                    async: async
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
                    t.enhance(args.prerequisites, args.actions, args.async);
                    this.emit("updated", t);
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
             * Get a Task by id, name, a function to execute that returns a
             * string or Task object, or try to synthesize a FileTask
             * 
             * @method get
             * @static
             * @param id {Task|function|integer|string}
             * @returns {object|null}
             */
            get: function (id) {
                if (id instanceof this) {
                    return id;
                } else if (typeof id === "function") {
                    return this.get(id());
                }

                if (!FileTask) {
                    FileTask = require("./file-task");
                }
                
                return Model.get.call(this, id) ||
                        this.find({name: id})[0] ||
                        (!this.initializing && Path.existsSync(id) ?
                            new FileTask(id) :
                            null);
            },
            
            find: function (spec, sortFn) {
                var name, nameSplit, namespace;
                
                if (typeof spec !== "function" && !spec.namespace && spec.name) {
                    if (~spec.name.indexOf(":")) {
                        nameSplit = spec.name.split(":");
                        spec.namespace = nameSplit[0];
                        spec.name = nameSplit[1];
                    }
                    else {
                        spec.namespace = this.currentNamespace;
                    }
                }
                
                return Model.find.call(this, spec, sortFn);
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
                var task, ret;

                if (!(task = this.get(name))) {
                    throw new Error("Do not know how to run task '" + name + ".'");
                }
                
                this.emit("beforeInvoked", task);
                ret = task.invoke.apply(task, util.slice(arguments, 1));
                this.emit("invoked", task);
                return ret;
            },
            
            run: util.aliasMethod("invoke"),
            /**
             * Set the asynchronous flag.
             * 
             * @method setAsync
             * @static
             */
            setAsync: function () {
                // If _asyncCount is less than zero, someoone was a little
                // zealous in clearing it out, lets reset.
                if (!this._asyncCount || this._asyncCount < 0) {
                    this._asyncCount = 0;
                }
                
                this._asyncCount += 1;
                this.isAsync = true;
            },
            
            /**
             * Clear the asynchronous flag, and fire the "clearAsync" event
             * @method clearAsync
             * @static
             */
            clearAsync: function () {
                this._asyncCount -= 1;
                // We check for less than, or equal to, because if someone
                // calls clearAsync without needing too, we should fire the
                // clear event immediately
                if (!this._asyncCount || this._asyncCount <= 0) {
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
         * @param action {function} function to execute when task is invoked
         */
        init: function (name, prerequisites, action) {
            var args = Task.normalizeArguments(arguments);

            this.name = args.name;
            this.description = "";
            this.namespace = args.namespace;
            this.actions = [];
            this.enable();

            Object.defineProperties(this, {
                __pending__: {
                    value: true,
                    writable: true
                },
                __pendingPrereqs__: {
                    value: []
                },
                __prerequisites__: {
                    value: []
                },
                prerequisites: {
                    get: function () {
                        resolvePrerequisites.call(this);
                        return this.__prerequisites__;
                    },
                    enumerable: true
                }
            });
            
            // this.setMaxListeners(0);
            
            this.enhance(args.prerequisites, args.action, args.async);

            Task.__super__.init.apply(this, arguments);
        },

        /**
         * Add prerequisites and actions to the Task
         * 
         * @method enhance
         * @param deps {string|function|array[string|function]} additional
         *      prerequisites for this task
         * @param action {function} additional actions for
         *      this task
         * @returns {object} Task
         */
        enhance: function (deps, action, async) {
            this.addPrerequisites.apply(
                this,
                !deps ? [] : Array.isArray(deps) ? deps : [deps]
            );

            action = action && this.addAction(action, async);
            
            this.emit("enhanced", this);
            
            return this;
        },

        addPrerequisite: function () {
            util.slice(arguments).forEach(function (p) {
                this.splice(this.length, 0, p);
            }, this.__pendingPrereqs__);
            this.__pending__ = true;
        },
        
        addPrerequisites: util.aliasMethod("addPrerequisite"),
        
        addAction: function () {
            var len = arguments.length,
                i = 0,
                fn, async
            ;
            
            for (; i < len; i++) {
                fn = arguments[i];
                if (typeof fn !== "function") {
                    throw new TypeError("Task#addAction expects a Function");
                }
                async = arguments[i+1];
                if (typeof async === "function") {
                    async = false;
                }
                else {
                    i++;
                }
                this.actions.splice(this.actions.length, 0, {
                    fn: fn,
                    async: async
                });
            }
        },
        
        addActions: util.aliasMethod("addAction"),
        
        /**
         * Invoke the Task, running all its prerequisites first, and then all
         * of its own actions.
         * 
         * Additional arguments will be passed to each action after the Task
         * reference, and they can also be accessed via the Tasks#taskArguments
         * property.
         * 
         * @method invoke
         * @param rest {mixed} additional arguments
         * @returns {object} Task
         */
        invoke: function (/* rest */) {
            var asyncListener,
                preqsListener,
                doneListener
            ;
            
            if (!this.alreadyRun && this.isNeeded) {
                // If a task action triggered an asynchronous method we listen
                // to the clearAsync event to advance our actions
                // Task.on("clearAsync", asyncListener = function () {
                //     this.emit("__action__", this);
                // }.bind(this));

                // When prerequisites are done running, we can run our actions
                this.on("__preqs__", preqsListener = runActions.bind(this));

                // When our actions are done running, clear out our listeners
                // and signal that this task is complete.
                this.on("__actions__", doneListener = function (t) {
                    this.alreadyRun = true;
                    // this.removeListener("clearAsync", asyncListener);
                    this.removeListener("__preqs__", preqsListener);
                    this.removeListener("__actions__", doneListener);
                    this.emit("complete", this);
                }.bind(this));

                this.taskArguments = util.slice(arguments);
                
                this.emit("invoked", this);
                
                runPrerequisites.call(this);
            }
            else {
                this.emit("complete", this);
            }
            
            return this;
        },
        
        run: util.aliasMethod("invoke"),
        
        complete: function () {
            this.emit("__action__", this);
        },
        
        /**
         * (re-)enable the Task
         * 
         * @method enable
         * @returns {object} Task
         */
        enable: function () {
            this.alreadyRun = false;
            this.emit("enabled", this);
            return this;
        },
        
        /**
         * (re-)enable this Task and all of it's prerequisites
         * 
         * @method enableAll
         */
        enableAll: function () {
            this.enable();
            this.prerequisites.forEach(function (p) {
                Task.get(p).enableAll();
            });
        },
        
        inspect: function () {
            var tmpl = Array(72).join("-") + "\n" +
                       "task: ${name}\n" +
                       "namespace: ${namespace}\n" +
                       "prerequisites: ${prerequisites}\n" +
                       "actions: ${actions}\n" +
                       Array(72).join(".") + "\n";
            
            return util.template(tmpl, this);
        },
        
        toString: function () {
            return this.inspect();
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

        /**
         * Get the timestamp for this Task, or any of its prerequisites if
         * they are earlier.
         * 
         * @property timestamp
         * @type {integer}
         */
        get timestamp () {
            return Math.max.apply(
                Math,
                this.prerequisites.map(function (p) {
                    return p.timestamp;
                })
            );
        }
    });
    
    Object.defineProperty(Task, "_asyncCount", {value: 0, writable: true});
    
    // Mixin EventEmitter to our instances
    Task.include(EM);
    // Task.setMaxListeners(0);

    sake = require("../../driver/sake");
}(exports));
