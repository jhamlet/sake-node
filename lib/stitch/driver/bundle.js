
var Proteus     = require("proteus"),
    Path        = require("path"),
    FS          = require("fs"),
    util        = require("../util"),
    ConfigModel = require("../model/config"),
    TypeModel   = require("../model/type"),
    Driver      = require("../driver"),
    Task        = require("../task"),
    BundleDriver,
    Types, mime, type
;

//---------------------------------------------------------------------------
// PRIVATES
//---------------------------------------------------------------------------
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

//---------------------------------------------------------------------------
// PUBLICS
//---------------------------------------------------------------------------
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
            bndl = ConfigModel.get(ctx.configuration).bundle(name, true),
            preamble
        ;
        
        if (!bndl) {
            throw new Error(
                "No bundle '" + name + "' exists in configuration '" +
                BundleDriver.configuration.name + "'."
            );
        }
        
        task(ctx.name, bndl.name);
        
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
        // Extend the current bundle's task with a new file dependency, and the
        // action to read the file
        path = Path.join(process.cwd(), path);
        dep  = file(path);
        task(ctx.name, path, function (t, ctx) {
            if (ctx.type !== type) {
                return;
            }
            
            switch (ctx.command) {
                case "trace":
                    ctx.stream.write("file: " + path + "\n");
                    break;
                case "weave":
                    ctx.stream.write(FS.readFileSync(path, "utf8"));
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
                    ctx.stream.write("content: " + val + "\n");
                    break;
                case "weave":
                    ctx.stream.write(val);
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
     * @returns {BundleDriver}
     */
    exec: function (type, cmd) {
        type = TypeModel.get(type);
        
        task(BundleDriver.context.name, function (t, ctx) {
            if (ctx.type !== type) {
                return;
            }
            
            switch (ctx.command) {
                case "trace":
                    ctx.stream.write("exec: " + cmd + "\n");
                    break;
                case "weave":
                    sh(cmd, function (result) {
                        ctx.stream.write(result);
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
        BundleDriver.exec(type, "curl -s " + url);
    },

    //-----------------------------------------------------------------------
    // Globals to undefine when in BundleDriver scope
    //-----------------------------------------------------------------------
    bundle:         undefined,
    type:           undefined,
    define_type:    undefined
});

/**
 * Listen to TypeModel's events to know when to extend BundleDriver with
 * type-like helper methods ("javascript", "js", "stylesheet", "css", etc...)
 */
TypeModel.on("created", updateBindings);
TypeModel.on("updated", updateBindings);

require("../types");
