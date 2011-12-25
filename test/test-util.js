
var should  = require("should"),
    util    = require("../lib/util")
;

module.exports = {
    "splice": function () {
        var list = [1, 2, 3, 4, 5];
        
        util.splice(list, 0, list.length);
        list.length.should.equal(0);
        
        list = [1, 2, 3];
        util.splice(list, [4, 5]);
        list.length.should.equal(5);
        list[3].should.equal(4);
        
        list = [1, 2, 5];
        util.splice(list, 2, 0, [3, 4]);
        list.length.should.equal(5);
        list[2].should.equal(3);
        
        list = [1, 2, 5];
        util.splice(list, 2, 0, 3, 4);
        list.length.should.equal(5);
        list[2].should.equal(3);

        list = [1, 2, 5];
        util.splice(list, 2, [3, 4]);
        list.length.should.equal(5);
        list[2].should.equal(3);
    }
}