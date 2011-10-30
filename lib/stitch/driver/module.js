
(function (exports) {

    var Proteus = require("proteus"),
        util    = require('../util'),
        Driver  = require('../driver.js').Driver
    ;
    
    exports.Driver = Proteus.create(Driver, {
        
        set description (txt) {
            var ctx = this.context;
            
            if (ctx) {
                ctx.description += txt;
            }
            else {
                if (!this._description) {
                    this._description = "";
                } else {
                    this._description += " ";
                }
                
                this._description += txt;
            }
        },
        
        get description () {
            return this.context ? this.context.description : this._description;
        },
        
        require: function (name) {
            this.context.composition.push({
                module: name
            });
            return this;
        },
        
        include: function (path, type) {
            this.context.composition.push({
                path: path, type: type
            });
            return this;
        },
        
        comment: function (txt) {
            this.context.composition.push({
                comment: txt
            });
            return this;
        },
        
        include_comment: function (path) {
            this.context.composition.push({
                comment_file: path
            });
            return this;
        },
        
        fetch: function (uri, type) {
            this.context.composition.push({
                uri: uri, type: type
            });
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