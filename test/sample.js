
var should      = require("should"),
    stitch      = require('../lib/stitch'),
    ConfigModel = require("../lib/stitch/model/config")
;

stitch.run(function (stitch) {

    stitch.type("text/stylesheet", "scss");
    stitch.type("text/stylesheet", "less");

    stitch.type("text/javascript").extension = "jss";
    
    // This file is usually run in the main directory so we have to prefix
    // the directory to get to the file.
    stitch.include("test/other-config.js");
    
    stitch.configure(function (cfg) {

        cfg.desc = "The default configuration.";

        cfg.bundle('core', function (core) {
            core.desc = "The core module.";

            core.insert("--core module comment--");

            core.javascript(function () {
                core.read('path-to-file.js');
                core.read('path-to-other-file.js');
            });

            core.scss(function () {
                core.read("path-to-core.scss");
            });
            
        });

        cfg.bundle('sub', function (sub) {
            sub.desc = "A submodule description.";
            sub.desc = "that goes on and on";

            // include another module's definitions
            sub.include('core');

            // JavaScript dependencies
            sub.read('sub-path-to-file.js');
            sub.read("js", 'sub-path-to-other-file.js'); // say what type of asset it is

            sub.fetch("js", 'http://uri-to-content-to-include');

            // Add comments: these will be prefixed with the '/*!' style so most/some
            // minifiers will leave these comments intact.
            sub.insert('Include a direct comment into\nthe generated output.');
            sub.read('path-to-comment-file.txt');

            // CSS dependencies
            sub.read("css", 'sub-path-to-file.scss');
            sub.read("css", 'sub-path-to-other-file.scss');
        });
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
    }
    
};
