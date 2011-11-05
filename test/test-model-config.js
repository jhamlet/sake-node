
var should = require("should"),
    ConfigModel = require("../lib/stitch/model/config").Model,
    BundleModel = require("../lib/stitch/model/bundle").Model
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
        cfgA.id.should.eql(0);
        cfgB.id.should.eql(1);
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
        
        cfgA.getBundle("acme").should.eql(modA);
        cfgA.getBundle("paul").should.eql(modB);
        cfgA.getBundle("joe").should.eql(modC);
        
        cfgA.getBundle("acme").should.not.eql(cfgA.getBundle("paul"));
    },
    
    "Modules in one config should be different than in another": function () {
        var cfgA = ConfigModel.get("foo"),
            cfgB = ConfigModel.get("baz")
        ;
        
        cfgB.createModule("acme");
        cfgB.createModule("paul");
        cfgB.createModule("joe");
        
        cfgA.getBundle("acme").should.not.eql(cfgB.getBundle("acme"));
        cfgA.getBundle("paul").should.not.eql(cfgB.getBundle("paul"));
        cfgA.getBundle("joe").should.not.eql(cfgB.getBundle("joe"));
    }
    
};


