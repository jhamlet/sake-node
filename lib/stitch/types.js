
(function () {
    var Type = require("./model/type").Model;

    new Type("text/javascript", "js");
    new Type("text/stylesheet", "css");
    new Type("text/html", "html");
    new Type("text/plain", "txt");
    new Type("application/json", "json");
    
    exports.Model = Type;
}());