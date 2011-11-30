
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("../driver"),
        sake         = require("./sake"),
        bundler,
        CURRENT_BUNDLE
    ;

    //------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**
     * The following are some utility methods to create new methods on the
     * bundler when TypeModel is updated with new types.
     */
    function bindType (type) {
        return function (fn) {
            if (typeof fn === "function") {
                // If called within an outer "type" function
                bundler.__currentType__ = type;
                bundler.run(CURRENT_BUNDLE, fn);
                delete bundler.__currentType__;
            }
            else {
                // Called directly, assume it's a file of type
                bundler.read(type, fn);
            }
        };
    }

    function updateBindings (type) {
        var name = type.name,
            fn = bindType(type);

        // Set an identifier on the function so we can determine if we should
        // remove it if the original name changes
        fn.__typeName__ = name;
        bundler[name] = bundler[type.extension] = fn;

        type.aliases.forEach(function (ext) {
            if (!this[ext]) {
                this[ext] = fn;
            }
        }, bundler);

    }

    function removeBindings (type) {
        var name = type.name;
        delete bundler[name];
        delete bundler[type.extension];
        type.aliases.forEach(function (m) {
            var fn = this[m];
            if (fn && fn.__typeName__ === name) {
                delete this[m];
            }
        }, bundler);
        updateBindings(type);
    }

    function bundleTaskName (mode, bundle, type) {
        return (mode ? mode + "-" : "") + bundle.name + "." + type.extension;
    }
    
    function composeBundle (
        type,
        traceDeps, traceFn,
        weaveDeps, weaveFn
    ) {
        var traceName = bundleTaskName("trace", CURRENT_BUNDLE, type),
            weaveName = bundleTaskName("weave", CURRENT_BUNDLE, type)
        ;
        
        sake.task(traceName, traceDeps, traceFn);
        sake.task(weaveName, weaveDeps, weaveFn);

        sake.task("trace-" + type.extension, [traceName]);
        sake.task("weave-" + type.extension, [weaveName]);
    }
    //------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------
    module.exports = bundler = Proteus.create(Driver, {

        id: "bundler",

        /**
         * Add to the current bundle's description, or store it for the next
         * one to be created.
         * 
         * @property description
         * @type {string}
         */
        get description () {
            return CURRENT_BUNDLE.description;
        },

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
         * @returns {bundler}
         */
        include: function (name) {
            var bndl = sake.Task.get(name),
                preamble
            ;

            if (!bndl) {
                throw new Error("Can not find bundle '" + name + "'.");
            }

            CURRENT_BUNDLE.addPrerequisite(bndl.name);

            return bundler;
        },

        require: util.aliasMethod("include", bundler),

        /**
         * Read an asset file.
         * 
         * @method read
         * @param type {string} optional, asset type. If not passed, will try
         *      determine from the path argument.
         * @param path {string} path to the file to read
         * @returns {bundler}
         */
        read: function (type, path) {
            if (!path) {
                path = type;
                type = bundler.__currentType__ || TypeModel.fromPath(path);
            }

            type = TypeModel.get(type);

            composeBundle(type,
                // trace
                null,
                function (t, ctx) {
                    ctx.write("file: " + path + "\n");
                },
                // weave
                [(path = Path.join(process.cwd(), path))],
                function (t, ctx) {
                    ctx.write(FS.readFileSync(path, "utf8") + "\n");
                }
            );
            
            return bundler;
        },

        add:  util.aliasMethod("read", bundler),
        load: util.aliasMethod("read", bundler),

        insert: function (type, val) {
            if (!val) {
                val = type;
                type = bundler.__currentType__;
            }
            
            type = TypeModel.get(type);
            
            composeBundle(type,
                // trace
                null,
                function (t, ctx) {
                    ctx.write("content: " + val + "\n");
                },
                // weave
                null,
                function (t, ctx) {
                    ctx.write(val + "\n");
                }
            );

            return bundler;
        },

        /**
         * Insert a comment
         * 
         * @method comment
         * @param type {object|string} a TypeModel or type string "text/
         *      javascript", "javascript", "js", etc..
         * @param val {string} the comment
         * @returns {object} bundler
         */
        comment: function (type, val) {
            if (!val) {
                val = type;
                type = bundler.__currentType__;
            }

            type = TypeModel.get(type);

            bundler.insert(type, type.formatComment(val));

            return bundler;
        },

        /**
         * Execute a shell command to use as an asset.
         * 
         * @method exec
         * @param type {string} asset type returned by command
         * @param cmd {string} command to execute
         * @returns {bundler}
         */
        exec: function (type, cmd) {
            if (!cmd) {
                cmd = type;
                type = bundler.__currentType__;
            }

            type = TypeModel.get(type);
            
            composeBundle(type,
                // trace
                null,
                function (t, ctx) {
                    ctx.write("exec: " + cmd + "\n");
                },
                // weave
                null,
                function (t, ctx) {
                    sake.sh(cmd, function (result) {
                        // process.stderr.write(cmd + ":\n" + result);
                        ctx.write(result + "\n");
                    });
                }
            );
            
            return bundler;
        },

        /**
         * Include an external resource. The 'type' parameter is not optional.
         * 
         * @method fetch
         * @param type {string} optional, type of asset returned
         * @param url {string} url to fetch from
         * @returns {bundler}
         */
        fetch: function (type, url) {
            if (!url) {
                url = type;
                type = bundler.__currentType__;
            }

            bundler.exec(TypeModel.get(type), "curl -s " + url);
        },
        
        run: function (name, fn) {
            var task, tmp, ret;
            
            task = sake.Task.get(name);
            // If asking for a task that doesn't exist we want to be able
            // to return the null value.
            if (arguments.length < 2 && typeof name === "string") {
                return task;
            }
            
            // Define the task if it doesn't exist yet.
            task = task || sake.task(name);
            
            if (CURRENT_BUNDLE) {
                tmp = CURRENT_BUNDLE;
            }
            
            CURRENT_BUNDLE = task;
            
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
     * Listen to TypeModel's events to know when to extend bundler with
     * type-like helper methods ("javascript", "js", "stylesheet", "css", etc...)
     */
    // TypeModel.on("created", updateBindings);
    TypeModel.on("updated", updateBindings);
    TypeModel.on("beforeNameChange", removeBindings);

    require("../types");
    
}());
