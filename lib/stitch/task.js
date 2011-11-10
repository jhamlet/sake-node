
var Path  = require("path"),
    FS    = require("fs"),
    Proteus = require("proteus"),
    Model = require("./model"),
    Task, FileTask;

module.exports = Task = Model.derive({
    
    self: {
        normalizeArguments: function (args) {
            var name = args[0],
                preqs = args[1],
                fn = args[2]
            ;
            
            if (!fn && typeof preqs === "function") {
                fn = preqs;
                preqs = [];
            }
            
            preqs = preqs instanceof Array ? preqs : [preqs];
            fn = fn instanceof Array ? fn : [fn];
            
            return {name: name, preqs: preqs, fn: fn};
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
            
            if ((t = this.get(args.name))) {
                args.preqs.forEach(function (p) {
                    this.splice(this.length, 0, p);
                }, t.prerequisites);
                
                args.fn.forEach(function (f) {
                    this.splice(this.length, 0, f);
                }, t.actions);
                
                return t;
            }
            
            Model.initialize.call(this, task, args);
        },
        
        get: function (id) {
            return Model.get.call(this, id) || this.find({name: id})[0];
        },
        
        /**
         * Invoke the named task
         * 
         * @method invoke
         * @param name {string} name of the task to invoke
         */
        invoke: function (name) {
            var task = this.get(name);
            if (task.isNeeded) {
                task.run();
            }
        }
    },
    
    /**
     * 
     * @method init
     * @param name {string} name of the task
     * @param preqs {array[string]|string} a named task, an array of named tasks
     * @param fn {function} function to execute when task is invoked
     */
    init: function (name, preqs, fn) {
        var args = Task.normalizeArguments(arguments);
        
        this.name = args.name;
        this.prerequisites = args.preqs;
        this.actions = args.fn;
        
        Task.__super__.init.apply(this, arguments);
    },
    
    run: function () {
        this.runPrerequisites();
        this.runActions();
    },

    runPrerequisites: function () {
        this.prerequisites.forEach(function (p) {
            Task.invoke(p);
        });
    },
    
    runActions: function () {
        this.actions.forEach(function (a) {
            a(this);
        }, this);
    },
    /**
     * Timestamp (milliseconds since epoch) of the task. By default, tasks
     * have a timestamp of 'now'
     * 
     * @property timestamp
     * @type integer
     */
    get timestamp () {
        return Date.now();
    },
    
    set timestamp (v) {},
    
    /**
     * Is this task needed?
     * 
     * @property isNeeded
     * @type boolean
     */
    get isNeeded () {
        return true;
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

FileTask = Proteus.Class.derive().include(Model, Task, {
    runPrerequisites: function () {
        this.prerequisites.forEach(function (p) {
            new Task(p);
        });
        Task.prototype.runPrerequisites.call(this);
    },
    
    get isNeeded () {
        return !Path.existsSync(this.name) || isOutOfDate.call(this, this.timestamp);
    },
    
    get timestamp () {
        if (Path.existsSync(this.name)) {
            return (new Date(FS.statSync(this.name))).getTime();
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

new Task("other", ["core"], function (t) {
    console.log(t.name);
});

new Task("sub", "other", function (t) {
    console.log(t.name);
});


Task.invoke("file/to/create.js");
