
var Proteus     = require("proteus"),
    util        = require('../util'),
    ConfigModel = require("../model/config"),
    TypeModel   = require("../model/type"),
    Driver      = require('../driver'),
    BundleDriver,
    Types, mime, type
;

/**
 * The following are some utility methods to create new methods on the
 * BundleDriver when TypeModel is updated with new types.
 */
function bindType (type) {
    return function (fn) {
        BundleDriver.__currentType__ = type;
        BundleDriver.run(fn);
        delete BundleDriver.__currentType__;
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
     * @method require
     * @param name {string} bundle name
     * @returns {BundleDriver}
     */
    require: function (name) {
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
            require: {
                id: bndl.id
            }
        });
        
        return BundleDriver;
    },
    
    /**
     * Include an asset file.
     * 
     * @method include
     * @param type {string} optional, asset type. If not passed, will try
     *      determine from the path argument.
     * @param path {string} path to the file to include
     * @returns {BundleDriver}
     */
    include: function (type, path) {
        if (!path) {
            path = type;
            type = BundleDriver.__currentType__ || TypeModel.fromPath(path);
        }
        
        type = TypeModel.get(type);
        
        BundleDriver.context.composition.push({
            file: {
                path: path,
                type: type.id,
                config: BundleDriver.context.configuration
            }
        });

        return BundleDriver;
    },
    
    add: util.aliasMethod("include", BundleDriver),
    inc: util.aliasMethod("include", BundleDriver),
    
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
    
    task: function (type, name, phase) {
        if (!TypeModel.has(type)) {
            throw new Error("Unknown type '" + type + "' for task '" + name + "'.");
        }
        
        phase = phase || "all";
        BundleDriver.context.composition.push({
            task: {
                name: name,
                phase: phase
            }
        });
        return BundleDriver;
    },
    
    compile_task: function (type, name) {
        if (!name) {
            name = type;
            type = BundleDriver.__currentType__;
        }
        
        BundleDriver.task(type, name, "compile");
    },
    
    render_task: function (type, name) {
        if (!name) {
            name = type;
            type = BundleDriver.__currentType__;
        }
        
        BundleDriver.task(type, name, "render");
    }
    
});

BundleDriver.init();

/**
 * Listen to TypeModel's events to know when to extend BundleDriver with
 * type-like helper methods ("javascript", "js", "stylesheet", "css", etc...)
 */
TypeModel.on("created", updateBindings);
TypeModel.on("updated", updateBindings);

require("../types");
