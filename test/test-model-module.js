
var should = require("should"),
    ModuleModel = require("../lib/stitch/model/module").Model
;

module.exports = {
    "Module Model is Loaded": function () {
        should.exist(ModuleModel);
        ModuleModel.should.be.a("function");
    },
    
    "Record creation": function () {
        var record = new ModuleModel("foo", "describe foo");
        should.exist(record);
        record.name.should.eql("foo");
        record.description.should.eql("describe foo");
    },
    
    "Records can have same name": function () {
        var recA = new ModuleModel("foo", "new foo"),
            recB = new ModuleModel("foo", "also foo")
        ;
        
        should.exist(recA);
        should.exist(recB);
        
        recA.should.not.eql(recB);

        recA = ModuleModel.find({name: "foo"});
        recB = ModuleModel.find({name: "foo"});
        
        recA.should.eql(recB);
        
        recA = ModuleModel.find({name: "foo", description: "new foo"});
        recB = ModuleModel.find({name: "foo", description: "also foo"});
        
        should.exist(recA);
        should.exist(recB);

        recA.should.not.eql(recB);
    }
};
