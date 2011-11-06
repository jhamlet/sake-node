
(function () {
    
    var Path = require("path"),
        FS   = require("fs")
    ;
    
    module.exports = JSON.parse(
        FS.readFileSync(
            Path.join(__dirname, "../../package.json"),
            "utf8"
        )
    );
}());