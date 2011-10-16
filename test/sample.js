
// Global needs
var stitch = require('../lib/stitch').stitch,
    asset_types = stitch.mimeTypes,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

// Define some modules
stitch.define('core-module', function (mod) {
    
    mod.include('path-to-file.js');
    mod.include('path-to-other-file.js');
    
});

stitch.define('sub-module', function (mod) {
    
    // require another module's definitions
    mod.require('core-module');
    
    // JavaScript dependencies
    mod.include('sub-path-to-file.js');
    mod.include('sub-path-to-other-file.js', js); // say what type of asset it is
    
    mod.fetch('http://uri-to-content-to-include', js);
    
    mod.comment('Include a direct comment into the generated output.');
    mod.include_comment('path-to-comment-file');
    
    // CSS dependencies
    mod.include('sub-path-to-file.scss', css);
    mod.include('sub-path-to-other-file.scss', css);
});

// define a global filter
stitch.filter(js, 'minifyJs', function (output) {
    
});

// define a filter to be used on a type of asset
stitch.filter(css, stitch.filters.minifyCss);

// include signature
//      path
//      path, assetType

// filter signature:
//      assetType, filterName, filterFn -> define a filter
//      assetType, filterFn -> set a filter for an asset

console.log(stitch.get('core-module').compose(js).render());