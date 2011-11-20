
var should = require("should"),
    ConfigModel = require("../lib/model/config")
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
            modA = cfgA.bundle("acme"),
            modB = cfgA.bundle("paul"),
            modC = cfgA.bundle("joe")
        ;
        
        should.exist(modA);
        should.exist(modB);
        should.exist(modC);
        
        cfgA.bundle("acme").should.eql(modA);
        cfgA.bundle("paul").should.eql(modB);
        cfgA.bundle("joe").should.eql(modC);
        
        cfgA.bundle("acme").should.not.eql(cfgA.bundle("paul"));
    }
};


