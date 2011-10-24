
(function (exports) {

    var util    = require('stitch/util'),
        Proteus = require('stitch/util/proteus').Proteus,
        Driver  = require('stitch/driver').Driver
    ;
    
    exports.Driver = Proteus.createObject(Driver, {
        
        set description (txt) {
            var ctx = this.context;
            
            if (ctx) {
                ctx.description += txt;
            }
            else {
                if (!this._description) {
                    this._description = "";
                }
                
                this._description += txt;
            }
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
        },
        
        contextChanged: function (newCtx, oldCtx) {
            if (this._description) {
                newCtx.description = this._description;
                delete this._description;
            }
        }
        
    });
                
}(exports));