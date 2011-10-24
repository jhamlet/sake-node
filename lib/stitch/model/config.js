
(function (exports) {
    
    var util    = require('stitch/util'),
        Model   = require('stitch/model').Model
    ;
    
    exports.Model = Model.extend({
        
        init: function (name) {
            this.name = this.name || name;
            this.description = this.description || desc || '';
            this.composition = [];
        }
        
    }).augment({
        __singleton__: true
    });
    
}(exports));