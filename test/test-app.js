
var should = require("should"),
    stitch = require("../lib/app")
;

module.exports = {
    "Stitch is loaded and valid": function () {
        stitch.should.be.a("object");
    },
    
    "Test drive": function () {
        stitch.run(function (stitch) {
        });
    }
};

