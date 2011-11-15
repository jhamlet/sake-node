
var Proteus         = require("proteus"),
    Path            = require('path'),
    util            = require('../util'),
    ConfigModel     = require("../model/config"),
    TypeModel       = require("../model/type"),
    Driver          = require('../driver'),
    ConfigDriver    = require('./config'),
    BundleDriver    = require("./bundle"),
    Task            = require("../task"),
    FileTask        = require("../task/file-task"),
    FileCreateTask  = require("../task/file-create-task"),
    exec            = require("child_process").exec,
    EVENTS          = {
        "typeCreated": [TypeModel, "created"],
        "typeUpdated": [TypeModel, "updated"]
    },
    currentTaskDescription = "",
    StitchDriver
;

//---------------------------------------------------------------------------
// Privates
//---------------------------------------------------------------------------
function defineTask (TaskClass, name, deps, fn) {
    var t = new TaskClass(name, deps, fn);
    t.description = currentTaskDescription;
    currentTaskDescription = "";
    return t;
}

function execShellCommand (cmd, callback) {
    Task.setAsync();
    exec(cmd, function (error, txt, errTxt) {
        if (!error && callback) {
            callback(txt);
        }
        if (error && errTxt) {
            process.stderr.write(errTxt, "utf8");
        }
        Task.clearAsync();
    });
}

//---------------------------------------------------------------------------
// Publics
//---------------------------------------------------------------------------
module.exports = StitchDriver = Proteus.create(Driver, {

    id: "StitchDriver",
    
    get stitch () { return StitchDriver; },
    set stitch (v) {},
    
    get options () { return StitchDriver.context.options; },
    set options (v) {},
    
    get environment () { return StitchDriver.context.environment; },
    set environment (v) {},
    
    get env () { return StitchDriver.context.environment; },
    set env (v) {},
    
    // Re-define some needed globals
    require: require,
    console: console,
    /**
     * Retrieve, extend, or define a type
     * 
     * @method type
     * @param name {string} name of the type
     * @param mime {string} optional, mime type for the type
     * @param ext {string} optional, extension for the type
     * @returns {object} TypeModel instance
     */
    type: function (name, mime, ext) {
        if (arguments.length === 1 && typeof name === "string") {
            return TypeModel.get(name);
        }
        return new TypeModel(name, mime, ext);
    },
    
    /**
     * Include one, or more, stitch configuration files.  Files loaded and
     * run will have access to global variables (actual references on global),
     * however, they will not have access to the local variable scope
     * definitions where 'include' is called.
     * 
     * @method include
     * @param rest {string} list of absolute or relative paths
     */
    include: function (/* rest */) {
        var len = arguments.length,
            i = 0
        ;
        
        for (; i < len; i++) {
            StitchDriver.context.loadStitchfile(arguments[i]);
        }
    },

    /**
     * Retrieve or define a configuration.
     * 
     * If name is omitted, returns the default configuration.
     * 
     * The supplied function is then run in the scope of the named 
     * configuration, or default.
     * 
     * @method configure
     * @param name {string} optional, name of the configuration, defaults
     *      to "default".
     * @param fn {function} optional, function to run to define the
     *      named configuration.
     * @returns {type}
     */
    configure: function () {
        var cfg, name, fn;
        
        if (util.isFunction(arguments[0])) {
            fn = arguments[0];
        }
        else {
            name = arguments[0];
            fn = arguments[1];
        }
        
        cfg = ConfigModel.get(name);
        
        if (fn) {
            ConfigDriver.context = cfg;
            ConfigDriver.run(fn);
        }
        
        return ConfigDriver;
    },
    
    config: util.aliasMethod("configure", StitchDriver),
    
    //-----------------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------------
    on: function (name, fn) {
        var pub = EVENTS[name];
        if (!pub) {
            throw new Error("Unknown Stitch Event '" + name + "'.");
        }
        
        pub[0].on(pub[1], fn);
    },
    
    //------------------------------------------------------------------------
    // Task aliases
    //------------------------------------------------------------------------
    Task:           Task,
    FileTask:       FileTask,
    FileCreateTask: FileCreateTask,
    
    get description () { return currentTaskDescription; },
    set description (txt) { currentTaskDescription += txt; },
    
    get desc () { return StitchDriver.description; },
    set desc (txt) { StitchDriver.description = txt; },
    
    task: defineTask.bind(StitchDriver, Task),
    
    file: defineTask.bind(StitchDriver, FileTask),
    
    file_create: defineTask.bind(StitchDriver, FileCreateTask),
    
    directory: function (name) {
        return StitchDriver.file_create(name, function (t) {
            if (!Path.existsSync(t.name)) {
                StitchDriver.mkdir_p(t.name);
            }
        });
    },
    
    //-----------------------------------------------------------------------
    // Shell short-cuts
    //-----------------------------------------------------------------------
    sh: execShellCommand,

    mkdir: function (path, fn) {
        execShellCommand("mkdir " + path, fn);
    },
    
    mkdir_p: function (path, fn) {
        execShellCommand("mkdir -p " + path, fn);
    },
    
    rm: function (path, fn) {
        execShellCommand("rm " + path, fn);
    },
    
    rm_rf: function (path, fn) {
        execShellCommand("rm -rf " + path, fn);
    },
    
    cp: function (from, to, fn) {
        execShellCommand("cp " + from + " " + to, fn);
    },
    
    ln: function (from, to, fn) {
        execShellCommand("ln " + from + " " + to, fn);
    },
    
    ln_s: function (from, to, fn) {
        execShellCommand("ln -s" +  from + " " + to, fn);
    }

});

StitchDriver.init();

//---------------------------------------------------------------------------
// Extend the global scope with StitchDriver
//---------------------------------------------------------------------------
Proteus.extend(global, StitchDriver);
