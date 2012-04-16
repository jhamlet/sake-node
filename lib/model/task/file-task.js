
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
        get exists () {
            return Path.existsSync(this.name);
        },
        /**
         * @property isNeeded
         * @type {boolean}
         * @override Task#isNeeded
         */
        get isNeeded () {
            var outOfDate = this.prerequisites.some(function (preq) {
                    var t = Task.get(preq);
                    return t && t.timestamp > this.timestamp;
                }, this)
            ;
            
            // console.log(
            //     "[" + this.name + " exists: " + exists + ", outOfDate: " + outOfDate +"]"
            // );
            
            return !this.exists || outOfDate;
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
