
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        Task         = require("../model/task"),
        FileTask     = require("../model/task/file-task"),
        SakeDriver   = require("./sake"),
        BundleDriver
    ;

    //------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**
     * The following are some utility methods to create new methods on the
     * BundleDriver when TypeModel is updated with new types.
     */
    function bindType (type) {
        return function (fn) {
            if (typeof fn === "function") {
                // If called within an outer "type" function
                BundleDriver.__currentType__ = type;
                BundleDriver.run(fn);
                delete BundleDriver.__currentType__;
            }
            else {
                // Called directly, assume it's a file of type
                BundleDriver.read(type, fn);
            }
        };
    }

    function updateBindings (type) {
        var name = type.name,
            fn = bindType(type);

        // Set an identifier on the function so we can determine if we should
        // remove it if the original name changes
        fn.__typeName__ = name;
        BundleDriver[name] = BundleDriver[type.extension] = fn;

        type.aliases.forEach(function (ext) {
            if (!this[ext]) {
                this[ext] = fn;
            }
        }, BundleDriver);

    }

    function removeBindings (type) {
        var name = type.name;
        delete BundleDriver[name];
        delete BundleDriver[type.extension];
        type.aliases.forEach(function (m) {
            var fn = this[m];
            if (fn && fn.__typeName__ === name) {
                delete this[m];
            }
        }, BundleDriver);
        updateBindings(type);
    }

    //------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------
    module.exports = BundleDriver = Proteus.create(Driver, {

        id: "BundleDriver",

        get description () {
            return BundleDriver.context.description;
        },

        /**
         * Add to the current bundle's description, or store it for the next
         * one to be created.
         * 
         * @property description
         * @type {string}
         */
        set description (txt) {
            var ctx  = BundleDriver.context,
                desc = ctx.description;

            ctx.description += desc.length ? " " + txt : txt;
        },

        get desc () {
            return BundleDriver.context.description;
        },

        set desc (txt) {
            BundleDriver.description = txt;
        },

        /**
         * Include another bundle in this one
         * 
         * @method include
         * @param name {string} bundle name
         * @returns {BundleDriver}
         */
        include: function (name) {
            var ctx = BundleDriver.context,
                bndl = Task.get(name),
                preamble
            ;

            if (!bndl) {
                throw new Error("Can not find bundle '" + name + "'.");
            }

            SakeDriver.task(ctx.name, bndl.name);

            return BundleDriver;
        },

        require: util.aliasMethod("include", BundleDriver),

        /**
         * Read an asset file.
         * 
         * @method read
         * @param type {string} optional, asset type. If not passed, will try
         *      determine from the path argument.
         * @param path {string} path to the file to read
         * @returns {BundleDriver}
         */
        read: function (type, path) {
            var ctx = BundleDriver.context,
                cfg, dep;

            if (!path) {
                path = type;
                type = BundleDriver.__currentType__ || TypeModel.fromPath(path);
            }

            type = TypeModel.get(type);
            // Extend the current bundle's task with a new file dependency,
            // and the action to read the file
            path = Path.join(process.cwd(), path);
            dep  = SakeDriver.file(path);
            SakeDriver.task(ctx.name, path, function (t, ctx) {
                if (ctx.type !== type) {
                    return;
                }

                switch (ctx.command) {
                    case "trace":
                        ctx.stream.write("file: " + path + "\n");
                        break;
                    case "weave":
                        ctx.stream.write(FS.readFileSync(path, "utf8"));
                        break;
                }
            });

            return BundleDriver;
        },

        add:  util.aliasMethod("read", BundleDriver),
        load: util.aliasMethod("read", BundleDriver),

        insert: function (type, val) {
            if (!val) {
                val = type;
                type = BundleDriver.__currentType__;
            }

            type = TypeModel.get(type);

            SakeDriver.task(BundleDriver.context.name, function (t, ctx) {
                if (ctx.type !== type) {
                    return;
                }

                switch (ctx.command) {
                    case "trace":
                        ctx.stream.write("content: " + val + "\n");
                        break;
                    case "weave":
                        ctx.stream.write(val);
                        break;
                }
            });

            return BundleDriver;
        },

        /**
         * Insert a comment
         * 
         * @method comment
         * @param type {object|string} a TypeModel or type string "text/
         *      javascript", "javascript", "js", etc..
         * @param val {string} the comment
         * @returns {object} BundleDriver
         */
        comment: function (type, val) {
            if (!val) {
                val = type;
                type = BundleDriver.__currentType__;
            }

            type = TypeModel.get(type);

            BundleDriver.insert(type, type.formatComment(val));

            return BundleDriver;
        },

        /**
         * Execute a shell command to use as an asset.
         * 
         * @method exec
         * @param type {string} asset type returned by command
         * @param cmd {string} command to execute
         * @returns {BundleDriver}
         */
        exec: function (type, cmd) {
            if (!cmd) {
                cmd = type;
                type = BundleDriver.__currentType__;
            }

            type = TypeModel.get(type);

            SakeDriver.task(BundleDriver.context.name, function (t, ctx) {
                if (ctx.type !== type) {
                    return;
                }

                switch (ctx.command) {
                    case "trace":
                        ctx.stream.write("exec: " + cmd + "\n");
                        break;
                    case "weave":
                        SakeDriver.sh(cmd, function (result) {
                            ctx.stream.write(result);
                        });
                        break;
                }
            });

            return BundleDriver;
        },

        /**
         * Include an external resource. The 'type' parameter is not optional.
         * 
         * @method fetch
         * @param type {string} optional, type of asset returned
         * @param url {string} url to fetch from
         * @returns {BundleDriver}
         */
        fetch: function (type, url) {
            if (!url) {
                url = type;
                type = BundleDriver.__currentType__;
            }

            BundleDriver.exec(TypeModel.get(type), "curl -s " + url);
        }

    });

    /**
     * Listen to TypeModel's events to know when to extend BundleDriver with
     * type-like helper methods ("javascript", "js", "stylesheet", "css", etc...)
     */
    // TypeModel.on("created", updateBindings);
    TypeModel.on("updated", updateBindings);
    TypeModel.on("beforeNameChange", removeBindings);

    require("../types");
    
}());
