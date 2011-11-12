
var should = require("should"),
    stitch = require("../lib/stitch")
;

module.exports = {
    "Stitch is loaded and valid": function () {
        stitch.should.be.ok;
        stitch.should.be.a("object");
    },
    
    "Test drive": function () {
        stitch.run(function (stitch) {
            stitch.configure(function (core) {
                core.description = "The core module";
                core.source_paths.push("path/to/core/stuff");
            });
        });
    }
};

