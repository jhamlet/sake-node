
var should = require("should"),
    stitch = require("../lib/driver/stitch")
;

module.exports = {
    
    "Loaded": function () {
        var re = /(process|Buffer|require|console)/;
        
        should.exist(stitch);
        stitch.should.be.a("object");
        
        // console.log(Object.getOwnPropertyNames(stitch).filter(function (name) {
        //     return !re.test(name);
        // }));
    },
    
    "FileList": function () {
        var fl = new stitch.FileList("examples/**/*.js");
        
        fl.items.should.contain("examples/01_simple/src/js/core.js");
        fl.items.should.contain("examples/01_simple/src/js/sub-module.js");
        
        fl.items.should.not.contain("examples/01_simple/src/js/core.css");
        fl.items.should.not.contain("examples/01_simple/src/js/sub-module.css");
        
    }
};
