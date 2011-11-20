var Type = require("./model/type");

// new Type("text/comment", "txt");
new Type("text/javascript", "js");      // javascript | js
new Type("text/stylesheet", "css");     // stylesheet | css
new Type("text/html", "html");          // html
new Type("text/plain", "txt");          // plain | txt
new Type("application/json", "json");   // json
new Type("application/xml", "xml");     // xml

module.exports = Type;
