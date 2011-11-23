
(function () {
    var Path = require("path"),
        FS   = require("fs"),
        Task = require("./task"),
        FileTask;

    //------------------------------------------------------------------------
    // Privates
    //------------------------------------------------------------------------

    function isOutOfDate (preqs, ts) {
        return !preqs.every(function (preq) {
            return Task.get(preq).timestamp < ts;
        });
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
                isOutOfDate(this.prerequisites, this.timestamp);
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
