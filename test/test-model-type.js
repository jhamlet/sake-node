
var should = require("should"),
    TypeModel = require("../lib/stitch/model/type")
;

module.exports = {
    
    "Basic test": function () {
        var type = new TypeModel("javascript", "text/javascript", "js");

        type.name.should.eql("javascript");
        type.mime.should.eql("text/javascript");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("js");
        
        type.destroy();
    },
    
    "Mime only test": function () {
        var type = new TypeModel("text/javascript", "js");
        
        type.name.should.eql("javascript");
        type.mime.should.eql("text/javascript");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("js");
    },
    
    "Look up by extension": function () {
        var type;
        
        new TypeModel("text/stylesheet", "css");
        
        type = TypeModel.getByExtension("css");
        should.exist(type);
        
        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.contain("css");
    },
    
    "From path": function () {
        var type;
        
        type = TypeModel.fromPath("path-to-file.js");

        should.exist(type);
        type.name.should.eql("javascript");
        type.mime.should.eql("text/javascript");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("js");

        type = TypeModel.fromPath("path-to-file.css");

        should.exist(type);
        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("css");
        
        new TypeModel("stylesheet", "text/stylesheet", "scss");

        type = TypeModel.fromPath("path-to-file.scss");

        type.should.eql(TypeModel.getByMime("text/stylesheet"));
        
        should.exist(type);
        type.name.should.eql("stylesheet");
        type.mime.should.eql("text/stylesheet");
        type.extensions.should.be.an.instanceof(Array);
        type.extensions.should.contain("scss");
    }
};
