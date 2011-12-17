
(function () {

    var Proteus      = require("proteus"),
        Path         = require("path"),
        FS           = require("fs"),
        util         = require("../util"),
        TypeModel    = require("../model/type"),
        Driver       = require("./driver"),
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

    //-----------------------------------------------------------------------
    // Internal tasks
    //-----------------------------------------------------------------------
    function getTypedTaskName (bundle, type) {
        return bundle.name + "." + type.extension;
    }
    
    function getModeTaskName (mode, bundle, type) {
        return mode + "-" + getTypedTaskName(bundle, type);
    }
    
    function getTypedTask (bundle, type) {
        var taskname = getTypedTaskName(bundle, type);
        
        return sake.Task.lookup(taskname) ||
            sake.task(taskname, function (t, ctx) {
                var taskname = getTypedTaskName(ctx.mode, ctx.bundle, ctx.type);
                sake.task(taskname).invoke(ctx);
            });
    }
    
    function getCurrentTypedTask (type) {
        return getTypedTask(CURRENT_BUNDLE, type);
    }
    
    function getModeTask (mode, bundle, type) {
        var taskname = getModeTaskName(mode, bundle, type),
            modetask = sake.task(taskname);
            
        getTypedTask(bundle, type).addPrerequisite(modetask.name);
        
        return modetask;
    }
    //-----------------------------------------------------------------------
    // TRACE
    //-----------------------------------------------------------------------
    function getTraceTask (bundle, type) {
        return getModeTask("trace", bundle, type);
    }
    
    function getCurrentTraceTask (type) {
        return getTraceTask(CURRENT_BUNDLE, type);
    }
    //-----------------------------------------------------------------------
    // TEMPORARY FILE BUILDER TASKS
    //-----------------------------------------------------------------------
    function getTempPath (filename) {
        return Path.join(sake.options.stitchTempDirectory, filename);
    }
    /**
     * Determine the temporary file path for the bundle and type
     * 
     * @param bundle {Task}
     * @param type {TypeModel}
     * @returns {string}
     */
    function getStitchTempPath (bundle, type) {
        return getTempPath(getTypedTaskName(bundle, type));
    }
    /**
     * Return the FileTask to save the temporary file associated with the
     * bundle and type
     * 
     * @param bundle {Task}
     * @param type {TypeModel}
     * @returns {Task}
     */
    function getStitchTempTask (bundle, type) {
        var tmpPath = getStitchTempPath(bundle, type),
            dirname = Path.dirname(tmpPath),
            task
        ;

        if (!(task = sake.Task.lookup(tmpPath))) {
            sake.directory(dirname);
            task = sake.file(tmpPath, [dirname], function (t, ctx) {
                sake.log("[writing tmp file for " + t.name + "]");
                sake.write(t.name, sake.cat(t.prerequisites.slice(1)));
            });
        }
        
        // sake.log(task.name + " => " + task.actions);
        
        return task;
    }
    
    //-----------------------------------------------------------------------
    // STITCH TASK
    //-----------------------------------------------------------------------
    function getStitchTask (bundle, type) {
        var taskname = getModeTaskName("stitch", bundle, type),
            temptask = getStitchTempTask(bundle, type),
            task
        ;
        
        task = sake.Task.lookup(taskname) ||
            sake.task(taskname, [temptask.name], function (t, ctx) {
                ctx.write(sake.read(t.prerequisites[0]));
            });
        
        return task;
    }

    function getCurrentStitchTempTask (type) {
        return getStitchTempTask(CURRENT_BUNDLE, type);
    }

    //-----------------------------------------------------------------------
    // MISC CONTENT TASKS
    //-----------------------------------------------------------------------
    function getContentFilepath (bundle, type) {
        var tmpDir = sake.options.stitchTempDirectory,
            filename
        ;
        
        if (!bundle.contentCount) {
            bundle.contentCount = 0;
        }
        
        bundle.contentCount++;
        
        filename = bundle.name + "-content-" + bundle.contentCount +
            "." + type.extension;
        
        return Path.join(tmpDir, filename);
    }
    
    function getContentTask (bundle, type, val) {
        var filepath = getContentFilepath(bundle, type),
            dirpath, task
        ;
        
        dirpath  = Path.dirname(filepath);
        
        sake.directory(dirpath);
        task = sake.file(filepath, [dirpath], function (t) {
            sake.write(t.name, val + "\n");
        });
        
        return task;
    }
    
    function getCurrentContentTask (type, val) {
        return getContentTask(CURRENT_BUNDLE, type, val);
    }

    //-----------------------------------------------------------------------
    // Add Prerequisites
    //-----------------------------------------------------------------------
    function addStitchFilePrerequisite (type, filepath) {
        var stitchTask = getStitchTask(CURRENT_BUNDLE, type),
            tempTask = sake.Task.lookup(stitchTask.prerequisites[0])
        ;
        
        sake.log("[adding prereq " + filepath + " to " + tempTask.name + "]");
        tempTask.addPrerequisite(filepath);
    }
    
    function addStitchContentPrerequisite (type, val) {
        var bundle      = CURRENT_BUNDLE,
            stitchTask  = getStitchTask(bundle, type),
            tempTask    = sake.Task.lookup(stitchTask.prerequisites[0]),
            contentTask = getContentTask(bundle, type, val)
        ;
        
        tempTask.addPrerequisite(contentTask.name);
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

        get task () {
            return CURRENT_BUNDLE;
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
            var tmpTask;
            
            if (!path) {
                path = type;
                type = bundler.__currentType__ || TypeModel.fromPath(path);
            }

            type = TypeModel.get(type);
            
            getCurrentTraceTask(type).addAction(function (t, ctx) {
                ctx.write("file: " + path + "\n");
            });
            
            addStitchFilePrerequisite(type, path);
            
            return bundler;
        },

        file: util.aliasMethod("read", bundler),
        add:  util.aliasMethod("read", bundler),
        load: util.aliasMethod("read", bundler),

        insert: function (type, val) {
            var tmptask;
            
            if (!val) {
                val = type;
                type = bundler.__currentType__;
            }
            
            type = TypeModel.get(type);
            
            getCurrentTraceTask(type).addAction(function (t, ctx) {
                ctx.write("content: " + val + "\n");
            });
            
            addStitchContentPrerequisite(type, val);
            
            return bundler;
        },
        
        content: util.aliasMethod("insert", bundler),

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
            var filepath;
            
            if (!cmd) {
                cmd = type;
                type = bundler.__currentType__;
            }

            type = TypeModel.get(type);
            
            getCurrentTraceTask(type).addAction(function (t, ctx) {
                ctx.write("exec: " + cmd + "\n");
            });
            
            sake.file(
                (filepath = getContentFilepath(CURRENT_BUNDLE, type)),
                function (t) {
                    t.begin();
                    sake.log("[exec " + t.name + "]");
                    sake.sh(cmd, function (result) {
                        sake.write(t.name, result + "\n");
                        t.complete();
                    });
                }
            );
            
            sake.Task.lookup(
                getStitchTask(CURRENT_BUNDLE, type).prerequisites[0]
            ).addPrerequisite(filepath);
            
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
            
            task = sake.Task.lookup(name);
            // If asking for a task that doesn't exist we want to be able
            // to return the null value.
            if (arguments.length < 2 && typeof name === "string") {
                return task;
            }
            
            // Define the task if it doesn't exist yet.
            if (!task) {
                /**
                 * A bundle's task is to call the specific [bundle].[type]
                 * task with a context that is specific to that bundle.  When
                 * that task completes we add the results of the bundle
                 * context to the main one.
                 */
                task = sake.task(name, function (t, ctx) {
                    var bundleCtx = new (require("../context")),
                        mode   = ctx.mode,
                        type   = ctx.type,
                        taskname = getModeTaskName(mode, task, type),
                        subtask
                    ;
                    
                    sake.log("[" + t.name + " calling " + taskname + "]");
                    subtask = sake.Task.lookup(taskname);
                    
                    // sake.log(subtask.prerequisites);
                    
                    subtask.on("complete", function () {
                        sake.log("[" + taskname + " complete]");
                        // sake.log(bundleCtx.source + "]");
                        ctx.write(bundleCtx.source);
                    });
                    
                    subtask.invoke(bundleCtx);
                });
            }
            
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
