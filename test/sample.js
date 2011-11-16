
var should      = require("should"),
    stitch      = require('../lib/stitch'),
    ConfigModel = require("../lib/stitch/model/config")
;

stitch.run(function (stitch) {

    type("text/stylesheet", "scss");
    type("text/stylesheet", "less");

    type("text/javascript").extension = "jss";
    
    // This file is usually run in the main directory so we have to prefix
    // the directory to get to the file.
    // include("test/other-config.js");
    
    configure(function (cfg) {

        desc = "The default configuration.";

        bundle('core', function (core) {
            desc = "The core module.";

            insert("--core module comment--");

            javascript(function () {
                read('path-to-file.js');
                read('path-to-other-file.js');
            });

            scss(function () {
                read("path-to-core.scss");
            });
            
        });

        bundle('sub', function () {
            desc = "A submodule description.";
            desc = "that goes on and on";

            // include another module's definitions
            include('core');

            // JavaScript dependencies
            read('sub-path-to-file.js');
            read("js", 'sub-path-to-other-file.js'); // say what type of asset it is

            fetch("js", 'http://uri-to-content-to-include');

            // Add comments: these will be prefixed with the '/*!' style so most/some
            // minifiers will leave these comments intact.
            insert('Include a direct comment into\nthe generated output.');
            read('path-to-comment-file.txt');

            // CSS dependencies
            read("css", 'sub-path-to-file.scss');
            read("css", 'sub-path-to-other-file.scss');
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
