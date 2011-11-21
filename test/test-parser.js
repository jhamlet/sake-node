
var Parser  = require("../lib/parser"),
    FS      = require("fs");

module.exports = {
    "Base": function () {
        var test = new Parser({
            directives: {
                "include":  ["include", function (parser) {}],
                "@depends?": ["depend", function (parser) {}],
                "@INCLUDE":  ["include", function (parser) {}]
            }
        });
        
        test.parse(FS.readFileSync("Stitchfile"));
        
        console.log(test);
    }
}