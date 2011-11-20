
(function () {
    var Path = require("path"),
        FS   = require("fs"),
        Task = require("../task"),
        FileTask;

    //------------------------------------------------------------------------
    // Privates
    //------------------------------------------------------------------------

    function isOutOfDate (ts) {
        var preqs = this.prerequisites,
            i = preqs.length;
        
        while (i--) {
            if (Task.get(preqs[i]).timestamp > ts) {
                return true;
            }
        }
        
        return false;
    }

    //------------------------------------------------------------------------
    // Publics
    //------------------------------------------------------------------------

    module.exports = FileTask = Task.derive({
        /**
         * @property isNeeded
         * @type {boolean}
         * @override Task#isNeeded
         */
        get isNeeded () {
            return !Path.existsSync(this.name) ||
                isOutOfDate.call(this, this.timestamp);
        },

        /**
         * @property timestamp
         * @type {integer}
         * @override Task#timestamp
         */
        get timestamp () {
            if (Path.existsSync(this.name)) {
                return (new Date(FS.statSync(this.name).mtime)).getTime();
            }
            else {
                return Date.now();
            }
        }
    });
    
}());
