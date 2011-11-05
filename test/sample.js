
var should = require("should"),
    stitch = require('../lib/stitch').Stitch,
    ConfigModel = require("../lib/stitch/model/config").Model,
    // BundleModel = require("../lib/stitch/model/bundle").Model,
    util    = require("../lib/stitch/util"),
    asset_types = stitch.types,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

stitch.configure(function () {
    sourcePaths.push('path-to-source-directory');
    
    desc = "The default configuration.";
    
    bundle('core', function (core) {
        desc = "The core module.";
        
        insert("--core module comment--");

        javascript(function () {
            add('path-to-file.js');
            add('path-to-other-file.js');
        });
        
        stylesheet(function () {
            file("path-to-core.css");
        });
    });
}).
bundle('sub', function () {
    desc = "A submodule description.";
    desc = "that goes on and on";
    
    // include another module's definitions
    include('core');
    
    // JavaScript dependencies
    file('sub-path-to-file.js');
    file(js, 'sub-path-to-other-file.js'); // say what type of asset it is
    
    fetch(js, 'http://uri-to-content-to-include');
    
    // Add comments: these will be prefixed with the '/*!' style so most/some
    // minifiers will leave these comments intact.
    insert('Include a direct comment into\nthe generated output.');
    file('path-to-comment-file.txt');
    
    // CSS dependencies
    file(css, 'sub-path-to-file.scss');
    file(css, 'sub-path-to-other-file.scss');
});

// stitch.file("./other-config.js");

// Test-Suite
module.exports = {
    
    "Default config defined": function () {
        should.exist(stitch.config("default"));
    },
    
    "Modules should be defined in default": function () {
        var cfg = stitch.config(),
            modA = cfg.bundle("core"),
            modB = cfg.bundle("sub")
        ;
        
        should.exist(modA);
        should.exist(modB);
    },
    
    "Descriptions should be correct": function () {
        var cfg = ConfigModel.find({name: "default"})[0],
            modA = cfg.getBundle("core"),
            modB = cfg.getBundle("sub")
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
