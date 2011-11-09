
var should = require("should"),
    Model = require("../lib/stitch/model").derive()
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
        var instance = Model.get(0);
        should.exist(instance);
    },
    
    "Retrieve record by find": function () {
        var instance = new Model();
        instance.name = "foo";
        instance = Model.find({name: "foo"})[0];
        instance.should.be.ok;
        instance.name.should.eql("foo");
    },
    
    "Create and then destroy record": function () {
        var instance = new Model(),
            id = instance.id
        ;
        
        instance.destroy();
        should.not.exist(Model.get(id));
    },
    
    "Find with a function": function () {
        var records, len;
        
        new Model();
        new Model();
        
        records = Model.find(function (rec) {
            return rec.id > 0;
        });
        
        len = records.length;
        i = 0;
        
        len.should.eql(3);
        
        for (; i < len; i++) {
            records[i].id.should.be.above(0);
        }
        
    }
}

