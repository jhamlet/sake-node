
var should = require("should"),
    BundleModel = require("../lib/stitch/model/bundle")
;

module.exports = {
    "Module Model is Loaded": function () {
        should.exist(BundleModel);
        BundleModel.should.be.a("function");
    },
    
    "Record creation": function () {
        var record = new BundleModel("foo", "describe foo");
        should.exist(record);
        record.name.should.eql("foo");
        record.description.should.eql("describe foo");
    },
    
    "Records can have same name": function () {
        var recA = new BundleModel("foo", "new foo"),
            recB = new BundleModel("foo", "also foo")
        ;
        
        should.exist(recA);
        should.exist(recB);
        
        recA.should.not.eql(recB);

        recA = BundleModel.find({name: "foo"})[0];
        recB = BundleModel.find({name: "foo"})[0];
        
        recA.should.eql(recB);
        
        recA = BundleModel.find({name: "foo", description: "new foo"})[0];
        recB = BundleModel.find({name: "foo", description: "also foo"})[0];
        
        should.exist(recA);
        should.exist(recB);

        recA.should.not.eql(recB);
    }
};
