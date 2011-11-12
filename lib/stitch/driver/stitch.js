
var Proteus     = require("proteus"),
    Path        = require('path'),
    util        = require('../util'),
    ConfigModel = require("../model/config"),
    TypeModel   = require("../model/type"),
    Driver      = require('../driver'),
    ConfigDriver = require('./config'),
    BundleDriver = require("./bundle"),
    Task         = require("../task"),
    FileTask     = require("../task/file-task"),
    FileCreateTask = require("../task/file-create-task"),
    exec         = require("child_process").exec,
    StitchDriver
;

module.exports = StitchDriver = Proteus.create(Driver, {

    get stitch () { return StitchDriver; },
    
    set stitch (v) {},
    
    get options () { return StitchDriver.context.options; },
    
    set options (v) {},
    
    get environment () { return StitchDriver.context.environment; },
    
    set environment (v) {},
    
    get env () { return StitchDriver.context.environment; },
    
    set env (v) {},
    
    define_type: function (name, mime, ext) {
        return new TypeModel(name, mime, ext);
    },
    
    type: function (name) {
        return TypeModel.get(name);
    },
    
    /**
     * Include one, or more, stitch configuration files
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
    
    //------------------------------------------------------------------------
    // Task aliases
    //------------------------------------------------------------------------
    invoke: function () {
        Task.invoke.apply(Task, arguments);
    },
    
    task: function (name, deps, fn) {
        return new Task(name, deps, fn);
    },
    
    file: function (name, deps, fn) {
        return new FileTask(name, deps, fn);
    },
    
    file_create: function (name, deps, fn) {
        return new FileCreateTask(name, deps, fn);
    },
    
    directory: function (name, deps, fn) {
        return StitchDriver.file_create(name, function (t) {
            if (!Path.existsSync(t.name)) {
                StitchDriver.mkdir_p(t.name);
            }
        });
    },
    
    sh: function (cmd, fn) {
        Task.setAsync();
        exec(cmd, function (error, txt, errTxt) {
            if (!error && fn) {
                fn(txt);
            }
            if (errTxt) {
                process.stderr.write(errTxt, "utf8");
            }
            Task.clearAsync();
        });
    },
    
    mkdir: function (path, fn) {
        StitchDriver.sh("mkdir " + path, fn);
    },
    
    mkdir_p: function (path, fn) {
        StitchDriver.sh("mkdir -p " + path, fn);
    },
    
    rm: function (path, fn) {
        StitchDriver.sh("rm " + path, fn);
    },
    
    rm_rf: function (path, fn) {
        StitchDriver.sh("rm -rf " + path, fn);
    },
    
    cp: function (from, to, fn) {
        StitchDriver.sh("cp " + from + " " + to, fn);
    },
    
    ln: function (from, to, fn) {
        StitchDriver.sh("ln " + from + " " + to, fn);
    },
    
    ln_s: function (from, to, fn) {
        StitchDriver.sh("ln -s " + from + " " + to, fn);
    }

});

StitchDriver.init();
