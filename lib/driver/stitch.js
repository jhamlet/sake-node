
(function () {

    var Proteus      = require("proteus"),
        util         = require("../util"),
        Driver       = require("../driver"),
        Task         = require("../model/task"),
        BundleDriver = require("./bundle"),
        StitchDriver
    ;

    //---------------------------------------------------------------------------
    // PUBLIC
    //---------------------------------------------------------------------------
    module.exports = StitchDriver = Proteus.create(Driver, {

        id: "StitchDriver",

        bundle: BundleDriver.run.bind(BundleDriver),

        get context () {
            
        },
        
        set context (ctx) {}

    });

}());
