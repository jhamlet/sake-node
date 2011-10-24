
var should = require("should"),
    ConfigModel = require("stitch/model/config").Model,
    stitch = require('stitch').Stitch,
    util    = require("stitch/util"),
    asset_types = stitch.types,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

stitch.configure(function () {
    this.sourcePaths.push('path-to-source-directory');
    
    this.filter(js, 'minify', util.noop);
    
    this.desc = "The core module.";
    
    this.module('core', function (core) {
        core.comment("--core module comment--");
        core.include('path-to-file.js');
        core.include('path-to-other-file.js');
    });
}).
setDesc("A submodule description.").
setDesc("that goes on and on").
module('sub', function () {
    // require another module's definitions
    this.require('core').
         include('abc').
         include('def');
    
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
}).
filter(js, 'minify', function () {
    
}).
filter(css, util.noop);

// Test-Suite
module.exports = {
    
    "Default config defined": function () {
        stitch.config("default").should.exist;
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
        var cfg = ConfigModel.find({name: "default"}),
            modA = cfg.getModule("core"),
            modB = cfg.getModule("sub")
        ;
        
        modA.description.should.eql("The core module.");
        modB.description.should.eql("A submodule description. that goes on and on");
    },
    
    "Default config sourcePaths is correct": function () {
        var cfg = ConfigModel.find({name: "default"}),
            sourcePaths = cfg.sourcePaths
        ;
        
        sourcePaths.should.contain("path-to-source-directory");
    },
    
    "Inspecting stuff": function () {
        console.log(ConfigModel.find({name: "default"}).getModule("sub").composition);
    }
};
