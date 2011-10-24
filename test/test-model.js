
var should = require("should"),
    Model = require("stitch/model").Model.derive()
;

module.exports = {
    "Model is loaded and valid": function () {
        Model.should.be.ok;
        Model.should.be.a("function");
    },
    
    "New record": function () {
        var instance = new Model();
        instance.should.be.ok;
        instance.should.respondTo("destroy");
    },
    
    "Retrieve record by id": function () {
        var instance = Model.get(1);
        should.exist(instance);
    },
    
    "Retrieve record by find": function () {
        var instance = new Model();
        instance.name = "foo";
        instance = Model.find({name: "foo"});
        instance.should.be.ok;
        instance.name.should.eql("foo");
    },
    
    "Create and then destroy record": function () {
        var instance = new Model(),
            id = instance.id
        ;
        
        instance.destroy();
        should.not.exist(Model.get(id));
    }
}

