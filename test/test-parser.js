
var Parser  = require("../lib/parser"),
    FS      = require("fs"),
    should  = require("should")
;

module.exports = {
    "Basic StringScanner functionality": function () {
        var parser = new Parser();
        
        parser.source = "A simple test.";
        
        parser.scan(/\w+/).should.eql("A");
        parser.scan(/\s+/).should.eql(" ");
        parser.scan(/simple/).should.eql("simple");
        parser.scan(/[\s\w]+/).should.eql(" test");
        
    },
    
    "Simple directive finding": function () {
        var count = 0,
            src = "// @depend some/file/to/depend-on.js\n" +
                  "// @depends some/other/fine.js\n",
            parser = new Parser({
                directives: [
                    ["depend", /@depends?\s+([^\s]+)/]
                ],
                handlers: {
                    depend: function (path) {
                        path.should.eql([
                            "some/file/to/depend-on.js",
                            "some/other/fine.js"
                        ][count]);
                        count++;
                    }
                }
            })
        ;
        
        parser.parse(src);
    },
    
    "Using parsing functions for directives": function () {
        var src = "some.var = stitch.include(\"some-bundle.js\");",
            parser,
            found
        ;
        
        parser = new Parser(src, {
            directives: [
                ["stitchInclude", /stitch\./, function () {
                    var bundleName;
                    
                    this.preDirectiveMatch.should.eql("some.var = ");

                    if (
                        this.scan(/\w+\(/) && this.scan(/["']/) &&
                        (bundleName = this.scan(/[\w\d\.\-]+/)) &&
                        this.scan(/["']/) && this.scan(/\)/)
                    ) {
                        return bundleName;
                    }
                }]
            ]
        });
        
        parser.parse({
            stitchInclude: function (bundle) {
                bundle.should.eql("some-bundle.js");
                found = true;
            }
        });
        
        found.should.eql(true);
    }
};
