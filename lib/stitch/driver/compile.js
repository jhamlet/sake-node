
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require('../util'),
        Driver  = require('../driver').Driver,
        O       = Object,
        hasOwnProp  = O.hasOwnProperty,
        BundleModel = require("../model/bundle").Model,
        TypeModel   = require("../model/type").Model,
        FilterModel = require("../model/filter").Model,
        CompileDriver
    ;
    
    exports.Driver = CompileDriver = Proteus.create(Driver, {
        
        require: function (args) {
            this.compileBundle(BundleModel.get(args.id));
        },
        
        file: function (args) {
            this.composition.push({
                path: this.context.config.resolveSourcePath(args.path)
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
                    type = component[key].type !== undefined &&
                        TypeModel.get(component[key].type);
                    
                    if (type === false || type === this.context.type) {
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
    
}(exports));