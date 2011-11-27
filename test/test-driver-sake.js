
var should  = require("should"),
    Path    = require("path"),
    sake    = require("../lib/driver/sake")
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
        
    },
    
    "Directory creation and deletion": function () {
        var path = "tmp/src/js/plus";
        
        sake.mkdir_p(path);
        
        path.split("/").reduce(function (prev, curr) {
            var currpath = Path.join(prev, curr);
            Path.existsSync(currpath).should.eql(true);
            return currpath;
        }, "");
        
        sake.rm_rf("tmp");
    }
};

