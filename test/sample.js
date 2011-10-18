
var stitch = require('stitch'),
    noop = function () {},
    asset_types = stitch.mimeTypes,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

// console.dir(require('stitch/config'));
// console.dir(stitch.configure());

stitch.configure(function () {
    this.sourcePaths.push('path-to-source-directory');
    
    this.filter(js, 'minify', noop);
    
    this.desc("The core module.");
    
    this.module('core', function (core) {
        core.comment("--core module comment--");
        core.include('path-to-file.js');
        core.include('path-to-other-file.js');
    });
}).
desc("A submodule description.").
desc("that goes on and on").
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

// define a global filter
filter(js, 'minify', function () {
    
}).

// define a filter to be used on a type of asset
filter(css, noop);

// include signature
//      path
//      path, assetType

// filter signature:
//      assetType, filterName, filterFn -> define a filter
//      assetType, filterFn -> set a filter for an asset

// console.log(stitch.compose('sub', js).render());

// stitch.module('subsub', function () {
//     this.include('some-path-file.js');
// });

// console.dir(stitch);

console.dir(stitch.config().module('core'));
