
(function () {
    
    var program = require("commander"),
        stitch  = require("./app"),
        TypeModel = require("./types").Model
    ;
    
    function processExtraArguments (args) {
        var len = args.length,
            i = 1,
            arg, key, val
        ;
        
        for (; i < len; i++) {
            arg = args[i];
            console.log(arg);
            if (arg.indexOf("=")) {
                arg = arg.split("=");
                key = arg[0];
                val = arg[1];
                stitch.env[key] = val;
            }
        }
    }
    
    program.
        version(stitch.version).
        option("-c, --config <name>", "Configuration to use", "default").
        option("-N, --no-minify", "Set minification flag to false")
    ;
    
    program.command("list <bundle.type>").action(function () {
        processExtraArguments(arguments);
        console.log("list");
    });
    
    program.command("weave <bundle.type>").
        action(function (bundle) {
            var type = TypeModel.fromPath(bundle).extension;
            processExtraArguments(arguments);
            console.log("render " + type + ": " +
                program.config + "[" + bundle + "]"
            );
        });
    
    program.command("server [port]").action(function (port) {
        processExtraArguments(arguments);
        console.log("startup server" + (port ? " on " + port : ""));
    });
    
    program.command("parse <file>").action(function (file) {
        processExtraArguments(arguments);
        console.log("parse " + file);
    });

    program.parse(process.argv);
    
}());