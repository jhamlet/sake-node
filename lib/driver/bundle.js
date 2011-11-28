
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        SakeDriver   = require("./sake"),
        BundleDriver,
        CURRENT_BUNDLE
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
                BundleDriver.run(CURRENT_BUNDLE, fn);
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

    function formatTaskName (mode, name, type) {
        if (!type) {
            type = name;
            name = mode;
            mode = null;
        }
        
        return (mode ? mode + "-" : "") + name + "." + type.extension;
    }
    //------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------
    module.exports = BundleDriver = Proteus.create(Driver, {

        id: "BundleDriver",

        get description () {
            return CURRENT_BUNDLE.description;
        },

        /**
         * Add to the current bundle's description, or store it for the next
         * one to be created.
         * 
         * @property description
         * @type {string}
         */
        set description (txt) {
            var desc = CURRENT_BUNDLE.description;

            CURRENT_BUNDLE.description += desc.length ? " " + txt : txt;
        },

        get desc () {
            return CURRENT_BUNDLE.description;
        },

        set desc (txt) {
            CURRENT_BUNDLE.description = txt;
        },

        /**
         * Include another bundle in this one
         * 
         * @method include
         * @param name {string} bundle name
         * @returns {BundleDriver}
         */
        include: function (name) {
            var bndl = SakeDriver.Task.get(name),
                preamble
            ;

            if (!bndl) {
                throw new Error("Can not find bundle '" + name + "'.");
            }

            CURRENT_BUNDLE.addPrerequisite(bndl.name);

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
            if (!path) {
                path = type;
                type = BundleDriver.__currentType__ || TypeModel.fromPath(path);
            }

            type = TypeModel.get(type);

            SakeDriver.task(
                formatTaskName("trace", CURRENT_BUNDLE.name, type),
                function (t, ctx) {
                    console.log("file: " + path + "\n");
                }
            );
            
            SakeDriver.task(
                formatTaskName("weave", CURRENT_BUNDLE.name, type),
                [(path = Path.join(process.cwd(), path))],
                function (t, ctx) {
                    console.log(FS.readFileSync(path, "utf8"));
                }
            );

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
            
            SakeDriver.task(
                formatTaskName("trace", CURRENT_BUNDLE.name, type),
                function (t, ctx) {
                    console.log("content: " + val + "\n");
                }
            );
            
            SakeDriver.task(
                formatTaskName("weave", CURRENT_BUNDLE.name, type),
                function (t, ctx) {
                    console.log(val);
                }
            );

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
            
            SakeDriver.task(
                formatTaskName("trace", CURRENT_BUNDLE.name, type),
                function (t, ctx) {
                    console.log("exec: " + cmd + "\n");
                }
            );
            
            SakeDriver.task(
                formatTaskName("weave", CURRENT_BUNDLE.name, type),
                function (t, ctx) {
                    console.log(result);
                }
            );
            
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
        },
        
        run: function (name, fn) {
            var tmp, ret;
            
            if (arguments.length < 2 && typeof name === "string") {
                return SakeDriver.Task.get(name);
            }
            
            if (CURRENT_BUNDLE) {
                tmp = CURRENT_BUNDLE;
            }
            
            CURRENT_BUNDLE = SakeDriver.task(name, function (t, ctx) {
                var type = ctx.type,
                    mode = ctx.mode
                ;
                SakeDriver.task(
                    formatTaskName(mode, t.name, type)
                ).invoke(ctx);
            });

            ret = Driver.run.apply(this, util.slice(arguments, 1));
            
            if (tmp) {
                CURRENT_BUNDLE = tmp;
            }
            else {
                CURRENT_BUNDLE = null;
            }
            
            return ret;
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
