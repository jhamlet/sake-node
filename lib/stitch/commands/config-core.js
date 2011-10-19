
(function () {

var Config = require('stitch/config').Config,
    util = require('stitch/util');

Config.mixin({
    
    set: function (key, value) {
    
    },

    get: function (key) {
    
    },
    
    description: function (txt) {
        if (this.currentDesc === undefined) {
            this.currentDesc = txt;
        }
        else {
            this.currentDesc += "\n" + txt;
        }
        return this;
    },
    
    desc: util.alias("description"),

    filter: function (type, name, fn) {
        
        return this;
    }

});

}());