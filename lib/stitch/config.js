
(function (exports) {

var util = require('stitch/util'),
    Proteus = require('stitch/proteus'),
    Module = require('stitch/module').Module,
    Config
;

exports.Config = Config = Proteus.create({
    
    configurations: {},
    
    get: function (name) {
        return this.configurations[name];
    },
    
    has: function (name) {
        return this.configurations.hasOwnProperty(name);
    }
    
}, {
    init: function (name) {
        this.name = name;
        this.sourcePaths = [];
        this.modules = {};
        this.filters = {};
        Config.configurations[name] = this;
    },
    
    compose: function (name) {
        var mod = this.modules[name];
        return mod.compose();
    },
    
    render: function (name, type) {
        return this.compose(name).render(type);
    },
    
    module: function (name, fn) {
        var mod,
            desc
        ;
        
        if (!fn) {
            return this.getModule(name);
        }
        
        desc = this.currentDesc;
        mod = this.currentModule = this.modules[name] ||
            (this.modules[name] = Module.create(name, desc));
        
        // mod = util.createObject(Module, {name: name, description: desc});
        // mod = Module.create(name, desc);
        
        mod.enhance(fn);

        delete this.currentDesc;
        delete this.currentModule;
        
        return this;
    },

    getModule: function (name) {
        var mod = this.modules[name];
        
        if (!mod) {
            throw("Unknown Module '" + name + "'");
        }
        
        return mod;
    },

    getFilter: function (name) {
        name = this.mimeTypes.hasOwnProperty(name) ?
            this.mimeTypes[name] :
            name
        ;
    
        return this.filters[name];
    }
    
});

Config.include(require('stitch/enhance'));

}(exports));