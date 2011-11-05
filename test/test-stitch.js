
var should = require("should"),
    Stitch = require("../lib/stitch")
;

module.exports = {
    "Stitch is loaded and valid": function () {
        Stitch.should.be.ok;
        Stitch.should.be.a("object");
    },
    
    "Test drive": function () {
        Stitch.configure(function (core) {
            core.description = "The core module";
            core.sourcePaths.push("path/to/core/stuff");
        });
    }
};

