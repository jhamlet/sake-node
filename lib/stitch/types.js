
(function (exports) {
    
    var Proteus = require("stitch/util/proteus").Proteus,
        Obj = Object;
    
    function defProp (obj, name, v) {
        Obj.defineProperty(obj, name, {
            value: v,
            enumerable: true
        })
    };
    
    defProp(exports, "text/javascript", "js");
    defProp(exports, "text/stylesheet", "css");
    defProp(exports, "text/html", "html");
    defProp(exports, "text/plain", "txt");
    defProp(exports, "application/json", "json");
    
}(exports));