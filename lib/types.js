var Type = require("./model/type");

new Type("text/javascript", {
    extension: "js",
    blockComment: ["/*!\n", " * ", " */"],
    lineComment: "// "
});

new Type("text/stylesheet", {
    extension: "css",
    blockComment: ["/*!\n", " * ", " */"],
    lineComment: ["/*! ", " */"]
});

new Type("text/html", {
    extension: "html",
    blockComment: ["<-- ", "", " -->"],
    lineComment: ["<!-- ", " -->"]
});

new Type("text/plain", {
    extension: "txt",
    blockComment: "# ",
    lineComment: "# "
});

new Type("application/json", {
    extension: "json"
});

new Type("application/xml", {
    extension: "xml",
    blockComment: ["<-- ", "", " -->"],
    lineComment: ["<!-- ", " -->"]
});

module.exports = Type;
