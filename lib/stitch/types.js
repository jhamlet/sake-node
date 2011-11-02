
(function (exports) {
    var Path = require("path");
    
    type = {
        mimeType: "text/javascript",
        extension: "js",
        
    }
    require("proteus").extend(exports, {

        "text/javascript": "js",
        
        "text/stylesheet": "css",
        
        "text/html": "html",
        
        "text/plain": "txt",
        
        "application/json": "json",
        
        fromPath: function (path) {
            var ext = Path.extname(path).slice(1);
            
            if (!ext) {
                throw("Can not determine asset type from '" + path + "'");
            }
            
            return ext;
        }
    });
    
}(exports));