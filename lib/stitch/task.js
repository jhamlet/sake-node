
var Path  = require("path"),
    FS    = require("fs"),
    Proteus = require("proteus"),
    Model = require("./model"),
    Task, FileTask
;

function runPrerequisites () {
    this.prerequisites.forEach(function (p) {
        Task.invoke(p);
    });
}

function runActions () {
    this.actions.forEach(function (a) {
        a(this);
    }, this);
}


module.exports = Task = Model.derive({
    
    self: {
        // Override Proteus.Class#derive so we maintain one Model for all tasks
        derive: function (props) {
            return Proteus.Class.derive().include(Model, this, props);
        },
        
        normalizeArguments: function (args) {
            var name = args[0],
                prerequisites = args[1],
                actions = args[2]
            ;
            
            if (!actions && typeof prerequisites === "function") {
                actions = prerequisites;
                prerequisites = [];
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
         * @param name {string} name of the task to invoke
         */
        invoke: function (name) {
            var task = this.get(name);

            if (task && task.isNeeded) {
                task.run();
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
        this.alreadyRun = false;
        
        this.enhance(args.prerequisites, args.actions);
        
        Task.__super__.init.apply(this, arguments);
    },
    
    enhance: function (deps, actions) {
        deps = deps !== undefined ?
                    deps instanceof Array ? deps : [deps] :
                    [];
        
        actions = actions !== undefined ?
                    actions instanceof Array ? actions : [actions] :
                    [];
        
        deps.forEach(function (p) {
            if (!~this.indexOf(p)) {
                this.splice(this.length, 0, p);
            }
        }, this.prerequisites);
        
        actions.forEach(function (f) {
            if (!~this.indexOf(f)) {
                this.splice(this.length, 0, f);
            }
        }, this.actions);
        
        return this;
    },
    
    run: function () {
        if (this.alreadyRun) {
            return;
        }
        runPrerequisites.call(this);
        runActions.call(this);
        this.alreadyRun = true;
    },
    
    reenable: function () {
        this.alreadyRun = false;
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
    
    get timestamp () {
        return this.prerequisites.sort(function (a, b) {
            return b.timestamp - a.timestamp;
        })[0].timestamp;
    }
});

function isOutOfDate (ts) {
    return this.prerequisites.some(function (p) {
        var t = Task.get(p);
        if (t && t.timestamp > ts) {
            return true;
        }
    });
}

FileTask = Task.derive({
    get isNeeded () {
        return !Path.existsSync(this.name) ||
            isOutOfDate.call(this, this.timestamp);
    },
    
    get timestamp () {
        if (Path.existsSync(this.name)) {
            return (new Date(FS.statSync(this.name).mtime)).getTime();
        }
        else {
            return Date.now();
        }
    }
});

new FileTask("test.js", ["types.js"], function (t) {
    console.log(process.cwd());
    console.log("create '" + t.name + "'");
});

new Task("core", function (t) {
    console.log(t.name);
});

new Task("other", ["core", "test.js"], function (t) {
    console.log(t.name);
});

new Task("sub", ["other", "core"], function (t) {
    console.log(t.name);
});


// console.log(Task.get("types.js").timestamp);
Task.invoke("sub");