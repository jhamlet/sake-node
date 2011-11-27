
var should = require("should"),
    stitch = require("../lib/driver/stitch")
;

module.exports = {
    
    "Loaded": function () {
        var re = /(process|Buffer|require|console)/;
        
        should.exist(stitch);
        stitch.should.be.a("object");
    }
    
};
