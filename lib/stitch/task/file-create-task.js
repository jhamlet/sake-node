
(function () {
    
    var Path    = require("path"),
        Task    = require("../task"),
        FileCreateTask;
    
    /**
     * A FileCreationTask is a file task that when used as a dependency will
     * be needed if and only if the file has not been created.  Once created,
     * it is not re-triggered if any of its dependencies are newer, nor does
     * it trigger any rebuilds of tasks that depend on it whenever it is
     * updated.
     */
    module.exports = FileCreateTask = Task.derive({
        get isNeeded () {
            return !Path.existsSync(this.name);
        },
        /**
         * A FileCreateTask timestamp is always now
         */
        get timestamp () {
            return Date.now();
        }
    });
    
}());