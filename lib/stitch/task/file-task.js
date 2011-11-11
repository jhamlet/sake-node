
(function () {
    var Path = require("path"),
        FS   = require("fs"),
        Task = require("../task"),
        FileTask;

    //------------------------------------------------------------------------
    // Privates
    //------------------------------------------------------------------------

    function isOutOfDate (ts) {
        return this.prerequisites.some(function (p) {
            var t = Task.get(p);
            if (t && t.timestamp > ts) {
                return true;
            }
        });
    }

    //------------------------------------------------------------------------
    // Publics
    //------------------------------------------------------------------------

    module.exports = FileTask = Task.derive({
        get isNeeded () {
            return !Path.existsSync(this.name) ||
                isOutOfDate.call(this, this.timestamp);
        },

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
