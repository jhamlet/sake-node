
var should      = require("should"),
    stitch      = require('../lib/stitch'),
    ConfigModel = require("../lib/stitch/model/config").Model
;

stitch.run(function (stitch) {

    stitch.define_type("text/stylesheet", "scss");
    stitch.define_type("text/stylesheet", "less");
    
    stitch.type("text/javascript").extensions.push("jss");
    
    stitch.include("test/other-config.js");
    // this.define_filter("minify", "text/javascript", "render", function (ctx) {
    //     
    // });
    
    stitch.configure(function (cfg) {
        cfg.sourcePaths.push('path-to-source-directory');

        cfg.desc = "The default configuration.";

        cfg.bundle('core', function (core) {
            core.desc = "The core module.";

            core.insert("--core module comment--");

            core.javascript(function () {
                core.add('path-to-file.js');
                core.add('path-to-other-file.js');
            });

            core.scss(function () {
                core.file("path-to-core.scss");
            });
            
            // core.filter("replace-tokens");
            // core.filter("js", "replace-tokens", "render");
            // core.filter("replace-tokens", "compile");
        });
    }).
    bundle('sub', function () {
        this.desc = "A submodule description.";
        this.desc = "that goes on and on";

        // include another module's definitions
        this.include('core');

        // JavaScript dependencies
        this.file('sub-path-to-file.js');
        this.file("js", 'sub-path-to-other-file.js'); // say what type of asset it is

        this.fetch("js", 'http://uri-to-content-to-include');

        // Add comments: these will be prefixed with the '/*!' style so most/some
        // minifiers will leave these comments intact.
        this.insert('Include a direct comment into\nthe generated output.');
        this.file('path-to-comment-file.txt');

        // CSS dependencies
        this.file("css", 'sub-path-to-file.scss');
        this.file("css", 'sub-path-to-other-file.scss');
    });
});

// stitch.file("./other-config.js");

// Test-Suite
module.exports = {
    
    "Default config defined": function () {
        should.exist(ConfigModel.get("default"));
    },
    
    "Modules should be defined in default": function () {
        var cfg = ConfigModel.get("default"),
            modA = cfg.bundle("core"),
            modB = cfg.bundle("sub")
        ;
        
        should.exist(modA);
        should.exist(modB);
    },
    
    "Descriptions should be correct": function () {
        var cfg = ConfigModel.find({name: "default"})[0],
            modA = cfg.bundle("core"),
            modB = cfg.bundle("sub")
        ;
        
        cfg.description.should.eql("The default configuration.");
        modA.description.should.eql("The core module.");
        modB.description.should.eql("A submodule description. that goes on and on");
        
        console.log(modA.composition);
        console.log("---");
        console.log(modB.composition);
    },
    
    "Default config sourcePaths is correct": function () {
        var cfg = ConfigModel.find({name: "default"})[0],
            sourcePaths = cfg.sourcePaths
        ;
        
        sourcePaths.should.contain("path-to-source-directory");
    }
    
};
