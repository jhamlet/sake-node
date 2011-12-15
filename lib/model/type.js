
(function () {

    var Proteus = require("proteus"),
        Path    = require("path"),
        util    = require("../util"),
        Model   = require("../model"),
        TypeModel
    ;

    //---------------------------------------------------------------------------
    // PUBLIC
    //---------------------------------------------------------------------------
    module.exports = TypeModel = Model.derive({

        self: {
            id: "TypeModel",

            initialize: function (type, args) {
                var mime = args[0],
                    ext  = args[1],
                    spec = args[2],
                    rec;

                if ((rec = this.find({mime: mime})[0])) {
                    rec.enhance(spec);
                    rec.addAlias(ext);
                    return rec;
                }

                return Model.initialize.call(this, type, args);
            },

            getByMime: function (mime) {
                return this.find({mime: mime})[0];
            },

            getByExtension: function (ext) {
                return this.find(function (type) {
                    return (~type.aliases.indexOf(ext) || type.extension === ext);
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
            },

            clone: function (basis, newmime, newext, spec) {
                var orig = this.get(basis),
                    type = new this(newmime, newext)
                ;

                type.aliases      = orig.aliases.slice();
                type.lineComment  = orig.lineComment;
                type.blockComment = orig.blockComment;

                type.enhance(spec);

                return type;
            }

        },

        init: function (mime, ext, spec) {
            this.name = spec && spec.name || mime.split("/")[1];
            this.mime = mime;
            this.extension = ext;

            this.enhance(spec);

            TypeModel.__super__.init.apply(this, arguments);
        },

        enhance: function (spec) {
            var oldname;
            
            spec = spec || {};

            this.mime = spec.mime || this.mime;

            this.lineComment  = spec.lineComment  || this.lineComment  || "";
            this.blockComment = spec.blockComment || this.blockComment || "";

            this.aliases = this.aliases || [];
            this.addAlias.apply(this, spec.aliases);

            if (spec.name && spec.name !== this.name) {
                TypeModel.emit("beforeNameChange", this);
                this.name = spec.name;
                TypeModel.emit("nameChanged", this);
            }

            TypeModel.emit("updated", this);
        },

        addAlias: function () {
            util.slice(arguments).forEach(function (a) {
                if (a && !~this.indexOf(a)) {
                    this.push(a);
                }
            }, this.aliases);
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
        },
        
        clone: function (newmime, ext, spec) {
            return TypeModel.clone(this.mime, newmime, ext, spec);
        }

    });
    
}());
