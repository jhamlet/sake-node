
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
        "-o, --output [path]",
        "Save output to file [path]."
    ).option(
        "-F, --force",
        "If outputing to a file, overwrite any existing file."
    ).option(
        "-N, --no-minify",
        "Set minification flag to false."
    )
;

module.exports = program;
