
var should = require("should"),
    Stitch = require("../lib/stitch")
;

module.exports = {
    "Stitch is loaded and valid": function () {
        Stitch.should.be.ok;
        Stitch.should.be.a("object");
    },
    
    "Types should be correct": function () {
        var types = Stitch.types;
        
        should.exist(types);
        
        types["text/javascript"].should.eql("js");
        types["text/stylesheet"].should.eql("css");
        types["text/plain"].should.eql("txt");
        types["text/html"].should.eql("html");
        types["application/json"].should.eql("json");
    },
    
    "Test drive": function () {
        Stitch.configure(function (core) {
            core.description = "The core module";
            core.sourcePaths.push("path/to/core/stuff");
        });
    }
};

