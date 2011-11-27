var Type = require("./model/type");

new Type("text/javascript", "js", {
    blockComment: ["/*!\n", " * ", " */"],
    lineComment: "// "
});

Type.clone("text/javascript", "text/stylesheet", "css");

new Type("text/html", "html", {
    blockComment: ["<-- ", "", " -->"],
    lineComment: ["<!-- ", " -->"]
});

new Type("application/json", "json");

new Type("text/plain", "txt", {
    blockComment: "# ",
    lineComment: "# "
});

Type.clone("text/html", "application/xml", "xml");

module.exports = Type;
