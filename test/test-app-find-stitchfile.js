
var should = require("should"),
    stitch = require("../lib/stitch/app")
;

module.exports = {
    
    "Find Stitchfile": function () {
        var path = stitch.stitchfileLocation();
        should.exist(path);
        console.log(path);
    }
}