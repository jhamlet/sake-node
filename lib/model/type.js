
var Proteus = require("proteus"),
    Path    = require("path"),
    util    = require("../util"),
    Model   = require("../model"),
    TypeModel
;

//---------------------------------------------------------------------------
// PRIVATE
//---------------------------------------------------------------------------
function defineInstanceProperties (obj) {
    Object.defineProperties(obj, {
        
    });
    return obj;
}
//---------------------------------------------------------------------------
// PUBLIC
//---------------------------------------------------------------------------
module.exports = TypeModel = Model.derive({
    
    self: {
        id: "TypeModel",
        
        initialize: function (type, args) {
            var rec;

            if ((rec = this.find({mime: args[0]})[0])) {
                rec.enhance(args[1]);
                return rec;
            }

            return Model.initialize.call(this, type, args);
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
            return (id instanceof this) ? id :
                Model.get.call(this, id) ||
                    this.getByMime(id) ||
                    this.getByExtension(id);
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
    
    init: function (mime, spec) {
        var mimeSplit, name;
        
        if (!spec && mime !== "string") {
            spec = mime;
            mime = null;
        }
        
        if (mime) {
            mimeSplit = mime.split("/");
            name = mimeSplit[1];
        }
        
        defineInstanceProperties(this);
        
        this.name = name || spec.name;
        this.mime = mime;

        this.extension  = spec.extension;
        this.extensions = spec.extensions || [this.extension];
        
        this.lineComment = spec.lineComment || "";
        this.blockComment = spec.blockComment || "";
        
        TypeModel.__super__.init.apply(this, arguments);
    },
    
    enhance: function (spec) {
        this.mime = spec.mime || this.mime;
        
        this.extension    = spec.extension    || this.extension;
        this.lineComment  = spec.lineComment  || this.lineComment;
        this.blockComment = spec.blockComment || this.blockComment;
        
        if (spec.extensions) {
            spec.extensions.forEach(function (e) {
                if (!~this.indexOf(e)) {
                    this.push(e);
                }
            }, this.extensions);
        }

        if (spec.name && spec.name !== this.name) {
            TypeModel.emit("nameChanged", this, this.name, spec.name);
            this.name = spec.name;
        }
        
        TypeModel.emit("updated", this);
    },
    
    formatComment: function (val) {
        var settings = val.match(/\n/) || val.length > 79 ?
                this.blockComment : this.lineComment,
            nIdx;
        
        if (Array.isArray(settings)) {
            nIdx = settings.length - 1;
            return [settings[0], val, settings[nIdx]].join("");
        }
        
        return settings + " " + val;
    }
    
});
