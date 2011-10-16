var stitch = require('stitch'),
    noop = function () {},
    asset_types = stitch.mimeTypes,
    js   = asset_types['text/javascript'],
    css  = asset_types['text/stylesheet'],
    json = asset_types['application/json'],
    html = asset_types['text/html']
;

stitch.configure(function () {
    this.set('sourceDirectory', 'path-to-source-directory');
    
    this.filter(js, 'minify', noop);
});

// Define some modules
stitch.module('core', function () {
    
    this.include('path-to-file.js');
    this.include('path-to-other-file.js');
    
});

stitch.module('sub', function () {
    
    // require another module's definitions
    this.require('core-module');
    
    // JavaScript dependencies
    this.include('sub-path-to-file.js');
    this.include('sub-path-to-other-file.js', js); // say what type of asset it is
    
    this.fetch('http://uri-to-content-to-include', js);
    
    // Add comments: these will be prefixed with the '/*!' style so most/some
    // minifiers will leave this comments intact.
    this.comment('Include a direct comment into the generated output.');
    this.include_comment('path-to-comment-file');
    
    // CSS dependencies
    this.include('sub-path-to-file.scss', css);
    this.include('sub-path-to-other-file.scss', css);
});

// define a global filter
stitch.filter(js, 'minify', function () {
    
});

// define a filter to be used on a type of asset
stitch.filter(css, noop);

// include signature
//      path
//      path, assetType

// filter signature:
//      assetType, filterName, filterFn -> define a filter
//      assetType, filterFn -> set a filter for an asset

console.log(stitch.module('sub').compose(js).render());
