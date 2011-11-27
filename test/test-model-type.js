
var should    = require("should"),
    TypeModel = require("../lib/types")
;

module.exports = {
    
    "Basic test": function () {
        var type = TypeModel.get("text/javascript");
        
        type.name.should.eql("javascript");
        type.mime.should.eql("text/javascript");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("js");
    },
    
    "Look up by extension": function () {
        var type;
        type = TypeModel.getByExtension("css");
        
        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.contain("css");
    },
    
    "From path": function () {
        var type;
        
        type = TypeModel.fromPath("path-to-file.js");

        type.name.should.eql("javascript");
        type.mime.should.eql("text/javascript");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("js");

        type = TypeModel.fromPath("path-to-file.css");

        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("css");
        
        type = new TypeModel("text/stylesheet", {
            extensions: ["scss"]
        });

        type.should.eql(TypeModel.getByMime("text/stylesheet"));
        
        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("scss");
    }
};
