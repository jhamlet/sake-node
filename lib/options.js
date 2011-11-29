
(function () {

    var App = require("./app"),
        spec = {
            "file": {
                string: "-f, --file PATH",
                help: "Specify PATH to Sakefile to run instead of searching for one."
            },

            "bundle": {
                string: "-b, --bundle NAME",
                help: "Stitch bundle NAME to build."
            },

            "type": {
                string: "-t, --type TYPE",
                help: "Stitch asset TYPE to render."
            },

            "outfile": {
                string: "-o, --outfile PATH",
                help: "Save Stitch output to file PATH."
            },

            "force": {
                string: "-F, --force",
                help: "If outputing to a file, overwrite any existing file.",
                flag: true
            },

            "noMinify": {
                string: "-N, --no-minify",
                help: "Set Stitch minification flag to false.",
                flag: true
            },

            "listTasks": {
                string: "-T, --list-tasks",
                help: "List tasks with descriptions",
                flag: true,
                callback: function () {
                    App.runOption = App.listTasks;
                }
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
                   // colors().
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
