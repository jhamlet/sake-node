
(function () {
    
    var Task = require("./task"),
        util = require("../../util"),
        AsyncTask
    ;
    
    module.exports = AsyncTask = Task.derive({
        
        init: function (name, deps, action) {
            Task.__super__.init.apply(this, arguments);
            this.async = true;
        },
        
        addAction: function () {
            Task.__super__.addAction.apply(
                this,
                util.slice(arguments).map(function (fn) {
                    return function (t) {
                        t.begin();
                        fn();
                    };
                })
            );
        }
    });
    
}());