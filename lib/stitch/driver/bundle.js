
var Proteus     = require("proteus"),
    FS          = require("fs"),
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
        
        task(ctx.name, [bndl.name]);
        
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
        var ctx = BundleDriver.context,
            cfg, dep;
        
        if (!path) {
            path = type;
            type = BundleDriver.__currentType__ || TypeModel.fromPath(path);
        }
        
        type = TypeModel.get(type);
        cfg  = ConfigModel.get(ctx.configuration);
        // Extend the current bundle's task with a new file dependency, and the
        // action to read the file
        dep  = file(path);
        task(ctx.name, dep, function (t, ctx) {
            if (ctx.type !== type) {
                return;
            }
            
            switch (ctx.command) {
                case "trace":
                    // console.log("read: " + cfg.resolvePath(path));
                    ctx.composition.push("file: " + cfg.resolvePath(path));
                    break;
                case "weave":
                    ctx.stream += FS.readFileSync(
                        cfg.resolvePath(path),
                        "utf8"
                    );
                    break;
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
        
        task(BundleDriver.context.name, function (t, ctx) {
            if (ctx.type !== type) {
                return;
            }
            
            switch (ctx.command) {
                case "trace":
                    ctx.composition.push("content: " + val);
                    break;
                case "weave":
                    ctx.stream += val;
                    break;
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
        
        task(BundleDriver.context.name, function (t, ctx) {
            if (ctx.type !== type) {
                return;
            }
            
            switch (ctx.command) {
                case "trace":
                    ctx.composition.push("exec: " + cmd + " " + args.join(" "));
                    break;
                case "weave":
                    sh(cmd, args, function (result) {
                        ctx.stream += result;
                    });
                    break;
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
        BundleDriver.exec(type, "curl", [url]);
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
