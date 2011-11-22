
var Parser  = require("../lib/parser"),
    FS      = require("fs");

module.exports = {
    "Base": function () {
        var test = new Parser({
                directives: [
                    ["include", /@include\s+([^\s]+)/],
                    ["depend", /@depends?\s+([^\s]+)/],
                    ["conditionalDepend", /@depends?/, function () {
                        var cond, path;
                    
                        if ((cond = this.scan(/\s+(\w+)/)) &&
                            (path = this.scan(/\s+([^\s]+)/))
                        ) {
                            return [cond, path];
                        }
                    }],
                    ["include", /@INCLUDE=([^@]+)@/ ]
                ]
            }),
            file = "/Users/jhamlet/Sources/netflix/10FootUI/Apps/HTML/TV/trunk/src/plus.html"
        ;
        
        file = "Stitchfile";
        
        test.parse(FS.readFileSync(file), {
            include: function (path) {
                console.log("Include: " + path);
            },
            depend: function (path) {
                console.log("Depend: " + path);
            },
            conditionalDepend: function (cond, path) {
                console.log("ConditionalDepend: " + cond + ", " + path);
            }
        });
        
        console.log(test);
    }
}