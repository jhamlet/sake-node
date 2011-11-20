
var Proteus = require("proteus"),
    Path    = require("path"),
    util    = require("../util"),
    Model   = require("../model"),
    TypeModel
;

module.exports = TypeModel = Model.derive({
    
    self: {
        id: "TypeModel",
        
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
            
            return {
                name: name,
                mime: mime,
                ext: ext
            };
        },
        
        initialize: function (type, args) {
            var rec;
            
            args = this.normalizeArguments(args);
            
            if ((rec = this.find({name: args.name, mime: args.mime})[0])) {
                rec.extension = args.ext;
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
        
        this.name = args.name;
        this.mime = args.mime;
        this.extensions = [];
        this.extension = args.ext;
        
        TypeModel.__super__.init.apply(this, arguments);
    },
    
    get extension () {
        return this.extensions[0];
    },
    
    set extension (ext) {
        var i = 0, len, e;
        
        ext = util.isArray(ext) ? ext : [ext];
        
        for (len = ext.length; i < len; i++) {
            e = ext[i];
            if (!~this.extensions.indexOf(e)) {
                this.extensions.push(e);
            }
        }
        
        TypeModel.emit("updated", this);
    }
    
});
