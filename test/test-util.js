
var should  = require("should"),
    util    = require("../lib/util")
;

module.exports = {
    "splice": function () {
        var list = [1, 2, 3, 4, 5];
        
        util.splice(list, 0, list.length);
        
        list.length.should.equal(0);
    }
}