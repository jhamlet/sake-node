
var Parser  = require("../lib/parser"),
    FS      = require("fs");

module.exports = {
    "Base": function () {
        var test = new Parser({
            directives: [
                ["include", /include/, function () {
                    console.log(this.preDirectiveMatch);
                    return true;
                }],
                ["depend", /@/, function () { return true; } ],
                ["include", /@/, function () { return true; } ]
            ]
        });
        
        test.parse(FS.readFileSync("Stitchfile"), {
            include: function () {
                console.log(arguments);
            }
        });
        
        console.log(test);
    }
}