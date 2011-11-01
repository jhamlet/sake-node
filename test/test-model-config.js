
var should = require("should"),
    ConfigModel = require("../lib/stitch/model/config").Model,
    ModuleModel = require("../lib/stitch/model/module").Model
;

module.exports = {
    "Config Model is Loaded": function () {
        ConfigModel.should.be.ok;
        ConfigModel.should.be.a("function");
    },
    
    "Create config": function () {
        var cfg = new ConfigModel("foo");
        should.exist(cfg);
    },
    
    "Retrieve config": function () {
        var cfg = ConfigModel.find({name: "foo"})[0];
        should.exist(cfg);
    },
    
    "Create separate config": function () {
        var cfgA = ConfigModel.get("foo"),
            cfgB = new ConfigModel("baz");
        
        cfgA.should.not.eql(cfgB);
        cfgA.id.should.eql(1);
        cfgB.id.should.eql(2);
    },
    
    "Create modules in config": function () {
        var cfgA = ConfigModel.get("foo"),
            modA = cfgA.createModule("acme"),
            modB = cfgA.createModule("paul"),
            modC = cfgA.createModule("joe")
        ;
        
        should.exist(modA);
        should.exist(modB);
        should.exist(modC);
        
        cfgA.getModule("acme").should.eql(modA);
        cfgA.getModule("paul").should.eql(modB);
        cfgA.getModule("joe").should.eql(modC);
        
        cfgA.getModule("acme").should.not.eql(cfgA.getModule("paul"));
    },
    
    "Modules in one config should be different than in another": function () {
        var cfgA = ConfigModel.get("foo"),
            cfgB = ConfigModel.get("baz")
        ;
        
        cfgB.createModule("acme");
        cfgB.createModule("paul");
        cfgB.createModule("joe");
        
        cfgA.getModule("acme").should.not.eql(cfgB.getModule("acme"));
        cfgA.getModule("paul").should.not.eql(cfgB.getModule("paul"));
        cfgA.getModule("joe").should.not.eql(cfgB.getModule("joe"));
    }
    
};


