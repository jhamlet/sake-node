
var should = require("should"),
    ConfigModel = require("stitch/model/config").Model
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
        var cfg = ConfigModel.find({name: "foo"});
        should.exist(cfg);
    },
    
    "Create separate config": function () {
        var cfgA = ConfigModel.get(1),
            cfgB = new ConfigModel("baz");
        
        cfgA.should.not.eql(cfgB);
        cfgA.id.should.eql(1);
        cfgB.id.should.eql(2);
    },
    
    "Create modules in config": function () {
        var cfgA = ConfigModel.get(1),
            modA = new cfgA.ModuleModel("acme"),
            modB = new cfgA.ModuleModel("paul"),
            modC = new cfgA.ModuleModel("joe")
        ;
        
        cfgA.ModuleModel.find({name: "acme"}).should.eql(modA);
        cfgA.ModuleModel.find({name: "paul"}).should.eql(modB);
        cfgA.ModuleModel.find({name: "joe"}).should.eql(modC);
    },
    
    "Modules in one config should be different than in another": function () {
        var cfgA = ConfigModel.get(1),
            cfgB = ConfigModel.get(2)
        ;
        
        new cfgB.ModuleModel("acme");
        new cfgB.ModuleModel("paul");
        new cfgB.ModuleModel("joe");
        
        cfgA.getModule("acme").should.not.eql(cfgB.getModule("acme"));
        cfgA.getModule("paul").should.not.eql(cfgB.getModule("paul"));
        cfgA.getModule("joe").should.not.eql(cfgB.getModule("joe"));
    }
    
}

