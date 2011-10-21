
(function (exports) {
    
    var util    = require('stitch/util'),
        Model   = require('stitch/model').Model
    ;
    
    exports.Model = Model.extend({
        
        init: function (name, desc) {
            this.name = this.name || name;
            this.description = this.description || desc || '';
            this.composition = [];
        }
        
    });
    
}(exports));