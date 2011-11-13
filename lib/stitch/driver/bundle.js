
var Proteus     = require("proteus"),
    util        = require("../util"),
    ConfigModel = require("../model/config"),
    TypeModel   = require("../model/type"),
    Driver      = require("../driver"),
    Task        = require("../task"),
    BundleDriver,
    Types, mime, type
;

/**
 * The following are some utility methods to create new methods on the
 * BundleDriver when TypeModel is updated with new types.
 */
function bindType (type) {
    return function (fn) {
        if (typeof fn === "function") {
            BundleDriver.__currentType__ = type;
            BundleDriver.run(fn);
            delete BundleDriver.__currentType__;
        }
        else {
            BundleDriver.read(type, fn);
        }
    };
}

function updateBindings (type) {
    var methods = [type.name].concat(type.extensions),
        len = methods.length,
        i = 0,
        name
    ;
    
    for (; i < len; i++) {
        name = methods[i];
        if (!BundleDriver[name]) {
            BundleDriver[name] = bindType(type);
        }
    }
}

/**
 * 
 */
module.exports = BundleDriver = Proteus.create(Driver, {
    
    id: "BundleDriver",
    
    get description () {
        return BundleDriver.context.description;
    },
    
    /**
     * Add to the current bundle's description, or store it for the next
     * one to be created.
     * @property description
     * @type {string}
     */
    set description (txt) {
        var ctx  = BundleDriver.context,
            desc = ctx.description;
        
        ctx.description += desc.length ? " " + txt : txt;
    },
    
    get desc () {
        return BundleDriver.context.description;
    },
    
    set desc (txt) {
        BundleDriver.description = txt;
    },
    
    /**
     * Include another bundle in this one
     * 
     * @method include
     * @param name {string} bundle name
     * @returns {BundleDriver}
     */
    include: function (name) {
        var ctx = BundleDriver.context,
            bndl = ConfigModel.get(ctx.configuration).bundle(name, true)
        ;
        
        if (!bndl) {
            throw new Error(
                "No bundle '" + name + "' exists in configuration '" +
                BundleDriver.configuration.name + "'."
            );
        }
        
        ctx.composition.push({
            include: {
                id: bndl.id
            }
        });
        
        return BundleDriver;
    },
    
    /**
     * Read an asset file.
     * 
     * @method read
     * @param type {string} optional, asset type. If not passed, will try
     *      determine from the path argument.
     * @param path {string} path to the file to read
     * @returns {BundleDriver}
     */
    read: function (type, path) {
        if (!path) {
            path = type;
            type = BundleDriver.__currentType__ || TypeModel.fromPath(path);
        }
        
        type = TypeModel.get(type);
        
        BundleDriver.context.composition.push({
            read: {
                path: path,
                type: type.id,
                config: BundleDriver.context.configuration
            }
        });

        return BundleDriver;
    },
    
    add: util.aliasMethod("read", BundleDriver),
    inc: util.aliasMethod("read", BundleDriver),
    
    insert: function (type, val) {
        if (!val) {
            val = type;
            type = BundleDriver.__currentType__ || "text/plain";
        }
        
        type = TypeModel.get(type);
        
        BundleDriver.context.composition.push({
            insert: {
                value: val,
                type: type.id
            }
        });
        
        return BundleDriver;
    },
    
    /**
     * Include an external resource. The 'type' parameter is not optional.
     * 
     * @method fetch
     * @param type {string} optional, type of asset returned
     * @param url {string} url to fetch from
     * @returns {BundleDriver}
     */
    fetch: function (type, url) {
        if (!url) {
            url = type;
            // need to error here if not defined
            type = BundleDriver.__currentType__;
        }
        
        type = TypeModel.get(type);
        
        BundleDriver.context.composition.push({
            fetch: {
                url: url,
                type: type.id
            }
        });
        
        return BundleDriver;
    },
    
    
    /**
     * Execute a shell command to use as an asset.
     * 
     * @method exec
     * @param type {string} asset type returned by command
     * @param cmd {string} command to execute
     * @param args {array} array of arguments to pass to the command
     * @returns {BundleDriver}
     */
    exec: function (type, cmd, args) {
        type = TypeModel.get(type);
        BundleDriver.context.composition.push({
            exec: {
                command: cmd,
                type: type.id,
                arguments: args
            }
        });
        return BundleDriver;
    },
    
    /**
     * 
     * @method on
     * @param phase {string} all | render | compile
     * @param type {string} an available type
     * @param name {string|function} name of a task to run, or a function to 
     *      execute
     * @returns {object} BundleDriver
     */
    on: function (phase, type, name) {
        var t, typeId, task;
        
        if (type !== "all" && !(t = TypeModel.has(type))) {
            throw new Error("Unknown type '" + type + "' for task '" + name + "'.");
        }
        
        typeId = t ? t.id : type;
        phase = phase || "all";
        
        if (typeof name === "string" && !(task = Task.get(name))) {
            throw new Error("Unknown task '" + name + "'.");
        }
        else if (typeof name === "function") {
            task = new Task(phase + "-" + type, name);
        }
        else if (!task) {
            throw new TypeError("Name argument for 'on' is not a function or a string.");
        }
        
        BundleDriver.context.composition.push({
            task: {
                type: typeId,
                id: task.id,
                phase: phase
            }
        });
        return BundleDriver;
    },
    
    on_compile: function (type, name) {
        if (!name) {
            name = type;
            type = BundleDriver.__currentType__;
        }
        
        BundleDriver.on("compile", type, name);
    },
    
    on_render: function (type, name) {
        if (!name) {
            name = type;
            type = BundleDriver.__currentType__;
        }

        BundleDriver.on("render", type, name);
    },
    
    //-----------------------------------------------------------------------
    // Globals to undefine when in BundleDriver scope
    //-----------------------------------------------------------------------
    bundle:         undefined,
    type:           undefined,
    define_type:    undefined
});

BundleDriver.init();

/**
 * Listen to TypeModel's events to know when to extend BundleDriver with
 * type-like helper methods ("javascript", "js", "stylesheet", "css", etc...)
 */
TypeModel.on("created", updateBindings);
TypeModel.on("updated", updateBindings);

require("../types");
