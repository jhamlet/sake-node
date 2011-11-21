
(function () {
    
    var Proteus = require("proteus"),
        Directive;
    
    module.exports = Directive = Proteus.Class.derive({
        
        init: function (name, token, fn) {
            this.name = name;
            this.startToken = token;
            this.parser = fn;
        }
        
    });
    
}());