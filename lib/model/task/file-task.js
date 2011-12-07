
(function () {
    var Path = require("path"),
        FS   = require("fs"),
        Task = require("./task"),
        FileTask
    ;

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
                this.prerequisites.some(function (preq) {
                    return Task.get(preq).timestamp > this.timestamp;
                }, this);
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
