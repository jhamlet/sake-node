
var Proteus      = require("proteus"),
    util         = require("../util"),
    Driver       = require("../driver"),
    Task         = require("../model/task"),
    BundleDriver = require("./bundle"),
    StitchDriver
;

//---------------------------------------------------------------------------
// Publics
//---------------------------------------------------------------------------
module.exports = StitchDriver = Proteus.create(Driver, {

    id: "StitchDriver",

    bundle: function (name, fn) {
        var bndl = Task.get(name) || new Task(name);
        
        if (fn) {
            BundleDriver.run(fn, bndl);
        }
        
        return this;
    }
    
});
