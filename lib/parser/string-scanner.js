
(function () {
    
    var Proteus       = require("proteus"),
        StringScanner = require("strscan").StringScanner,
        NewStringScanner
    ;
    
    module.exports = NewStringScanner = Proteus.Class.derive({

        self: {

            initialize: function (obj, args) {
                // Call StringScanner's constructor function to initialize
                StringScanner.call(obj, args[0]);
            }
            
        },
        
        get pos () {
            return this.head;
        },

        set pos (idx) {
            this.head = idx;
        },

        get prevPos () {
            return this.last;
        }
        
    });

    // Include StringScanner
    NewStringScanner.include(StringScanner);

}());