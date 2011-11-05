
var should = require("should"),
    Stitch = require("../lib/stitch").Stitch,
    StitchDriver = require("../lib/stitch/driver/stitch").Driver,
    ConfigModel = require("../lib/stitch/model/config").Model
;

module.exports = {
    "Stitch is loaded and valid": function () {
        Stitch.should.be.ok;
        Stitch.should.be.a("object");
        
        Stitch.should.eql(StitchDriver);
        Stitch.context.should.eql(ConfigModel);
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

