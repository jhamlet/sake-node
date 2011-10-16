
var stitch = {
    
    define: function () {
        
    },
    
    filter: function () {
        
    },
    
    get: function () {
        return {
            compose: function () {
                return {
                    render: function () {
                        return 'rendered stuff...';
                    }
                };
            }
        };
    },
    
    filters: {
        
    },
    
    mimeTypes: {
        'text/javascript':  'js',
        'text/stylesheet':  'css',
        'text/html':        'html',
        'text/plain':       'text',
        'application/json': 'json'
    }
};

// Export for Node.js
if (exports && typeof exports === 'object') {
    exports.stitch = stitch;
}