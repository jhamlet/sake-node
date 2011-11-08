
var program = require("commander");

program.option(
        "-f, --file <path>",
        "Path to Stitchfile."
    ).option(
        "-c, --config <name>",
        "Configuration to use."
    ).
    option(
        "-b, --bundle <name>",
        "Bundle to build."
    ).option(
        "-t, --type <name>",
        "Asset type to generate."
    ).option(
        "-o, --outfile [path]", {toString: function () {
            var pad = Array(program.largestOptionLength() + 3).join(' ');
            return "Save output to file [path]. [path] is optional, if not\n" +
                pad + "provided a file will be generated in the local directory\n" +
                pad + "in the format of\n" +
                pad + "<config.name>-<bundle.name>-<date.getTime()>.<type.extension>";
        }}
    ).option(
        "-F, --force",
        "If outputing to a file, overwrite any existing file."
    ).option(
        "-N, --no-minify",
        "Set minification flag to false."
    )
;

module.exports = program;
