var Type = require("./model/type");

new Type("text/javascript", "js");
new Type("text/stylesheet", "css");
new Type("text/html", "html");
new Type("text/plain", "txt");
new Type("application/json", "json");
new Type("application/xml", "xml");

module.exports = Type;
