
var should = require("should"),
    stitch = require("../lib/app")
;

module.exports = {
    
    "Find Stitchfile": function () {
        var path = stitch.stitchfileLocation();
        should.exist(path);
    }
}