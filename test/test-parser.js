
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
    },
    
    "If/Else": function () {
        var src = "// @if (somevar)\n" +
                  "condition is true content\n" +
                  "// @else\n" +
                  "condition else content\n" +
                  "// @end\n",
            parser,
            found
        ;
        
        parser = new Parser({
            directives: [
                ["ifelse", /\/\/\s*@if\s*/, function () {
                    var cond, ifContent, elseContent;
                    
                    if (!this.scan(/\((\w+)\)\s*/)) {
                        return;
                    }
                    
                    this.mark();
                    cond = this.getCapture(0);
                    
                    if (!this.scanUntil(/\/\/\s*@(else|end)\s*/)) {
                        return;
                    }
                    
                    ifContent = this.getFromMark();
                    
                    if (this.getCapture(0) === "end") {
                        return [cond, ifContent];
                    }
                    
                    this.mark();
                    if (!this.scanUntil(/\/\/\s*@end\s*/)) {
                        return;
                    }
                    
                    elseContent = this.getFromMark();
                    return [cond, ifContent, elseContent];
                }]
            ]
        });
        
        parser.parse(src, {
            ifelse: function (cond, ifContent, elseContent) {
                cond.should.eql("somevar");
                ifContent.should.eql("condition is true content\n");
                elseContent.should.eql("condition else content\n");
                found = true;
            }
        });
        
        found.should.eql(true);
    }
};
