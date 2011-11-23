
(function () {

    var App = require("./app"),
        spec = {
            "file": {
                string: "-f, --file FILE",
                help: "Path to Sakefile to run"
            },

            "config": {
                string: "-c, --config NAME",
                help: "Stitch Configuration to use"
            },

            "bundle": {
                string: "-b, --bundle",
                help: "Stitch bundle to build"
            },

            "type": {
                string: "-t, --type",
                help: "Stitch asset type to render"
            },

            "outfile": {
                string: "-o, --outfile",
                help: "Save output to a file."
            },

            "force": {
                string: "-F, --force",
                help: "If outputing to a file, overwrite any existing file.",
                flag: true
            },

            "noMinify": {
                string: "-N, --no-minify",
                help: "Set minification flag to false.",
                flag: true
            },

            "listBundles": {
                string: "-B, --list-bundles",
                help: "List bundle names, and descriptions if defined",
                flag: true
            },

            "listTasks": {
                string: "-T, --list-tasks",
                help: "List tasks with descriptions",
                flag: true
            },

            "version": {
                string: "-V, --version",
                help: "Print the version of sake",
                flag: true,
                callback: function () {
                    return "version " + App.version;
                }
            },

            "help": {
                string: "-h, --help",
                help: "Print this help information",
                flag: true
            },
        },
        OPTIONS
    ;
    
    /**
     * Turn extra command-line arguments of "key=value" into environment
     * variables.
     * 
     * @function processEnvArgs
     * @param args {array[string]} the extra arguments given on the
     *      command-line
     * @returns {array} array of non-environment arguments
     */
    function processEnvArgs (args) {
        var env = process.env,
            remainder = []
        ;
        
        args.forEach(function (arg) {
            var key, val;
            
            if (~arg.indexOf("=")) {
                arg = arg.split("=");
                key = arg[0];
                val = arg[1];
                try {
                    env[key] = JSON.parse(val);
                }
                catch (e) {
                    env[key] = val;
                }
            }
            else {
                remainder.push(arg);
            }
        });
        
        return remainder;
    }
    
    function parseOptions () {
        var key, last;
        
        if (OPTIONS) {
            return OPTIONS;
        }
        
        OPTIONS = require("nomnom").
                   script("sake").
                   colors().
                   options(spec);
                   
        // OPTIONS.command("server").
        //         option("port", {
        //             string: "-p, --port PORT",
        //             default: 5718,
        //             help: "Run on the given port"
        //         }).
        //         callback(App.runServer.bind(App));
        
        OPTIONS = OPTIONS.parse();
        
        OPTIONS._ = processEnvArgs(OPTIONS._);
        
        // Reset positional arguments
        OPTIONS._.forEach(function (arg, idx) {
            last = idx;
            OPTIONS[idx] = arg;
        });
        
        // and remove others
        for (key in OPTIONS) {
            if (key.match(/^\d+$/) && parseInt(key, 10) > last) {
                delete OPTIONS[key];
            }
        }
        
        return OPTIONS;
    }
    
    module.exports = parseOptions;
}());
