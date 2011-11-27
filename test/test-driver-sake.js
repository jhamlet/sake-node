
var should = require("should"),
    sake = require("../lib/driver/sake")
;

module.exports = {
    "Sake is loaded and valid": function () {
        sake.should.be.a("object");
    },
    
    "FileList": function () {
        var fl = new sake.FileList("examples/**/*.js");
        
        fl.items.should.contain("examples/01_simple/src/js/core.js");
        fl.items.should.contain("examples/01_simple/src/js/sub-module.js");
        
        fl.items.should.not.contain("examples/01_simple/src/js/core.css");
        fl.items.should.not.contain("examples/01_simple/src/js/sub-module.css");
        
    }
};

