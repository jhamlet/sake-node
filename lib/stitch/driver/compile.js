
var Proteus = require("proteus"),
    Path    = require("path"),
    util    = require('../util'),
    Driver  = require('../driver'),
    O       = Object,
    hasOwnProp  = O.hasOwnProperty,
    ConfigModel = require("../model/config"),
    BundleModel = require("../model/bundle"),
    TypeModel   = require("../model/type"),
    CompileDriver
;

module.exports = CompileDriver = Proteus.create(Driver, {
    
    require: function (args) {
        this.compileBundle(BundleModel.get(args.id));
    },
    
    include: function (args) {
        var cfg = ConfigModel.get(args.config);
        
        this.composition.push({
            path: cfg.resolveSourcePath(args.path)
        });
    },
    
    insert: function (args) {
        this.composition.push({ value: args.value });
    },
    
    fetch: function (args) {
        this.composition.push({ url: args.url });
    },
    
    exec: function (args) {
        this.composition.push({
            command: args.command,
            arguments: args.arguments
        });
    },
    
    compileBundle: function (bndl) {
        var list = bndl.composition,
            len = list.length,
            i = 0
        ;
        
        for (; i < len; i++) {
            this.compileComponent(list[i]);
        }
    },
    
    compileComponent: function (component) {
        var hasOwn = hasOwnProp,
            type, key
        ;
        
        for (key in component) {
            if (hasOwn.call(component, key) &&
                util.isFunction(this[key])
            ) {
                type = component[key].type;
                if (type === undefined || type === this.context.type.id) {
                    this[key].call(this, component[key]);
                }
            }
        }
    },
    
    run: function (ctx) {
        this.composition = [];
        this.context = ctx;
        
        this.compileBundle(ctx.bundle);
        
        return this.composition;
    }
});

CompileDriver.init();
