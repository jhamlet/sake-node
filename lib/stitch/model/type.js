
(function (exports) {
    
    var Proteus = require("proteus"),
        Model   = require("../model")
        TypeModel
    ;
    
    exports.Model = TypeModel = Model.derive({
        
        self: {
            
            getByMimeType: function (mime) {
                return this.find({mimeType: mime})[0];
            }
            
        },
        
        init: function (ext, mime) {
            this.extension = ext;
            this.mimeType = mime;
        },
        
        get name () {
            return this.extension;
        },
        
        get ext () {
            return this.extension;
        }
    });
    
}(exports));