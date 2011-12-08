
(function (exports) {

    var Path       = require("path"),
        FS         = require("fs"),
        EM         = require("events").EventEmitter,
        Proteus    = require("proteus"),
        Model      = require("../model"),
        TaskDriver = require("../../driver/task"),
        util       = require("../../util"),
        FileList   = require("../../file-list"),
        Task, FileTask // to be defined
    ;

    //------------------------------------------------------------------------
    // PRIVATE
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
    //------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------
    module.exports = Task = Model.derive({
        //-------------------------------------------------------------------
        // STATIC
        //-------------------------------------------------------------------
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
                    nameSplit,
                    namespace
                ;

                if (!action && typeof prerequisites === "function") {
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
                    action: action
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
                return this.lookup(id) ||
                        this.synthesizeFileTask(id);
            },
            
            lookup: function (id) {
                if (id instanceof this) {
                    return id;
                } else if (typeof id === "function") {
                    return this.get(id());
                }

                return Model.get.call(this, id) ||
                        this.find({name: id})[0] ||
                        null;
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
            
            synthesizeFileTask: function (id) {
                if (!FileTask) {
                    FileTask = require("./file-task");
                }

                return !this.initializing && Path.existsSync(id) ?
                        new FileTask(id) :
                        null;
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
                
                if (!TaskDriver) {
                    TaskDriver = require("../../driver/task");
                }
                
                this.emit("invoked", task);
                ret = task.invoke.apply(task, util.slice(arguments, 1));
                return ret;
            },
            
            run: util.aliasMethod("invoke"),
            /**
             * Set the asynchronous flag.
             * 
             * @method startAsync
             * @static
             */
            startAsync: function (ms) {
                this.emit("asyncStarted", this, ms);
            },
            
            begin: util.aliasMethod("startAsync"),
            
            /**
             * Clear the asynchronous flag, and fire the "clearAsync" event
             * @method clearAsync
             * @static
             */
            clearAsync: function () {
                this.emit("asyncCleared", this);
            },
            
            complete: util.aliasMethod("clearAsync")
        },
        //-------------------------------------------------------------------
        // INSTANCE
        //-------------------------------------------------------------------
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
            
            this.enhance(args.prerequisites, args.action);

            Task.__super__.init.apply(this, arguments);
        },

        /**
         * Add prerequisites and action to the Task
         * 
         * @method enhance
         * @param deps {string|function|array[string|function]} additional
         *      prerequisites for this task
         * @param action {function} another action for this task
         * @returns {object} Task
         */
        enhance: function (deps, action) {
            this.addPrerequisites.apply(
                this,
                !deps ? [] : Array.isArray(deps) ? deps : [deps]
            );

            action = action && this.addAction(action);
            
            this.emit("enhanced", this);
            
            return this;
        },

        addPrerequisite: function () {
            util.slice(arguments).forEach(function (p) {
                this.splice(this.length, 0, p);
            }, this.__pendingPrereqs__);
            this.__pending__ = true;
            return this;
        },
        
        addPrerequisites: util.aliasMethod("addPrerequisite"),
        
        addAction: function () {
            util.slice(arguments).forEach(function (fn) {
                this.splice(this.length, 0, fn);
            }, this.actions);
            return this;
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
            TaskDriver.run(this, arguments);
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
            this.emit("enabled", this);
            return this;
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
        
        startAsync: function (ms) {
            Task.startAsync(ms);
        },

        begin: util.aliasMethod("startAsync"),
        
        clearAsync: function () {
            Task.clearAsync();
        },

        complete: util.aliasMethod("clearAsync"),

        get fqn () {
            return this.namespace + ":" + this.name;
        },
        
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
            var max = Math.max.apply(
                Math,
                this.prerequisites.map(function (p) {
                    return p.timestamp;
                })
            );
            
            return isFinite(max) ? max : Date.now();
        }
    });
    
    Proteus.extend(Task, EM.prototype);

    // Mixin EventEmitter to our instances
    Task.include(EM);

}(exports));
