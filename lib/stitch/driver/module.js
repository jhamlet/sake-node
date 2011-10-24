
(function (exports) {

    var util    = require('stitch/util'),
        Proteus = require('stitch/util/proteus'),
        Driver  = require('stitch/driver').Driver
    ;
    
    util.merge(exports, Proteus.createObject(Driver, {
        
        set description (txt) {
            this.context.description += txt;
        },
        
        require: function (name) {
            return this;
        },
        
        include: function (path, type) {
            return this;
        },
        
        comment: function (txt) {
            return this;
        },
        
        include_comment: function (path) {
            return this;
        },
        
        fetch: function (uri, type) {
            return this;
        },
        
        filter: function (name, type, fn) {
            return this;
        }
        
    }));
                
}(exports));