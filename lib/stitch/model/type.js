
(function (exports) {
    
    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require("../util"),
        Model   = require("../model").Model,
        TypeModel
    ;
    
    exports.Model = TypeModel = Model.derive({
        
        self: {
            
            normalizeArguments: function (args) {
                var name = args[0],
                    mime = args[1],
                    ext = args[2]
                ;
                
                if (!args[2]) {
                    ext = args[1];
                    mime = args[0];
                    name = mime.split("/")[1];
                }
                
                return [name, mime, ext];
            },
            
            initialize: function (type, args) {
                var rec;
                
                args = this.normalizeArguments(args);
                
                if ((rec = this.find({name: args[0], mime: args[1]})[0])) {
                    rec.extension = args[2];
                    return rec;
                }

                return Model.initialize.call(this, type, args);
            },
            
            getByName: function (name) {
                return this.find({name: name})[0];
            },
            
            getByMime: function (mime) {
                return this.find({mime: mime})[0];
            },
            
            getByExtension: function (ext) {
                return this.find(function (type) {
                    return (~type.extensions.indexOf(ext));
                })[0];
            },
            
            get: function (id) {
                return (id instanceof this) ?
                    id :
                    Model.get.call(this, id) || this.getByName(id) ||
                        this.getByMime(id) || this.getByExtension(id)
                ;
            },
            
            fromPath: function (path) {
                var ext = Path.extname(path).slice(1),
                    type = this.getByExtension(ext)
                ;
                
                if (!type) {
                    throw new Error(
                        "No type associated with extension '" + ext + "'"
                    );
                }
                
                return type;
            }
            
        },
        
        init: function () {
            var args = TypeModel.normalizeArguments(arguments);
            
            this.name = args[0];
            this.mime = args[1];
            this.extensions = [];
            this.extension = args[2];
            
            TypeModel.emit("created", this);
        },
        
        get extension () {
            return this.extensions[0];
        },
        
        set extension (ext) {
            var i, len, e;
            
            if (util.isArray(ext)) {
                for (i = 0, len = ext.length; i < len; i++) {
                    e = ext[i];
                    if (!~this.extensions.indexOf(e)) {
                        this.extensions.push(e);
                    }
                }
            }
            else if (!~this.extensions.indexOf(ext)) {
                this.extensions.push(ext);
            }
            
            TypeModel.emit("updated", this);
        }
        
    });

}(exports));