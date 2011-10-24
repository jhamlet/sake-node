
var should = require("should"),
    ModuleModel = require("stitch/model/module").Model,
    ModuleMdlA = ModuleModel.derive(),
    ModuleMdlB = ModuleModel.derive()
;

module.exports = {
    "Module Model is Loaded": function () {
        should.exist(ModuleModel);
        ModuleModel.should.be.a("function");
    },
    
    "ModuleModel A should not equal ModuleModel B": function () {
        ModuleMdlA.should.not.eql(ModuleMdlB);
    },
    
    "Record creation": function () {
        var record = new ModuleMdlA("foo", "describe foo");
        should.exist(record);
        record.name.should.eql("foo");
        record.description.should.eql("describe foo");
    },
    
    "ModuleModel B should have different records": function () {
        var recordA = ModuleMdlA.find({name: "foo"}),
            recordB = new ModuleMdlB("foo", "describe foo")
        ;
        
        should.exist(recordA);
        should.exist(recordB);
        
        recordA.should.not.eql(recordB);
    }
};
