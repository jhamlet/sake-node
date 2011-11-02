
var should = require("should"),
    stitch = require('stitch').Stitch,
    ConfigModel = require("../lib/stitch/model/config").Model,
    util    = require("../lib/stitch/util"),
    asset_types = stitch.types,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

stitch.configure(function () {
    this.sourcePaths.push('path-to-source-directory');
    
    this.desc = "The default configuration.";
    
    this.module('core', function (core) {
        this.desc = "The core module.";
        
        core.comment("--core module comment--");

        core.include('path-to-file.js');
        core.include('path-to-other-file.js');
        
        core.include("path-to-core.css");
    });
}).
module('sub', function () {
    this.desc = "A submodule description.";
    this.desc = "that goes on and on";
    
    // require another module's definitions
    this.require('core');
    
    // JavaScript dependencies
    this.include('sub-path-to-file.js');
    this.include('sub-path-to-other-file.js', js); // say what type of asset it is
    
    this.fetch('http://uri-to-content-to-include', js);
    
    // Add comments: these will be prefixed with the '/*!' style so most/some
    // minifiers will leave these comments intact.
    this.comment('Include a direct comment into\nthe generated output.');
    this.include_comment('path-to-comment-file');
    
    // CSS dependencies
    this.include('sub-path-to-file.scss', css);
    this.include('sub-path-to-other-file.scss', css);
});

// stitch.include("./other-config.js");

// Test-Suite
module.exports = {
    
    "Default config defined": function () {
        should.exist(stitch.config("default"));
    },
    
    "Modules should be defined in default": function () {
        var cfg = stitch.config(),
            modA = cfg.module("core"),
            modB = cfg.module("sub")
        ;
        
        should.exist(modA);
        should.exist(modB);
    },
    
    "Descriptions should be correct": function () {
        var cfg = ConfigModel.find({name: "default"})[0],
            modA = cfg.getModule("core"),
            modB = cfg.getModule("sub")
        ;
        
        cfg.description.should.eql("The default configuration.");
        modA.description.should.eql("The core module.");
        modB.description.should.eql("A submodule description. that goes on and on");
    },
    
    "Default config sourcePaths is correct": function () {
        var cfg = ConfigModel.find({name: "default"})[0],
            sourcePaths = cfg.sourcePaths
        ;
        
        sourcePaths.should.contain("path-to-source-directory");
    }
    
};
