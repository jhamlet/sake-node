
var should  = require("should"),
    CP      = require("child_process"),
    AsyncQueue = require("../lib/async-queue")
;

module.exports = {
    
    "Async actions": function () {
        var results = [],
            queue
        ;
        
        queue = new AsyncQueue(
            function () {
                queue.setAsync();
                CP.exec(
                    "sleep 1; echo \"One\";",
                    function (error, stdout, stderr) {
                        results.push(stdout.replace(/\n$/, ""));
                        CP.exec(
                            "sleep 1; echo \"Two\";",
                            function (error, stdout, stderr) {
                                results.push(stdout.replace(/\n$/, ""));
                                queue.clearAsync();
                            }
                        );
                    }
                );
            },

            function () {
                results.push("Three");
            },

            function () {
                results.push("Four");
            },

            function () {
                queue.setAsync();
                CP.exec(
                    "sleep 1; echo \"Five\";",
                    function (error, stdout, stderr) {
                        results.push(stdout.replace(/\n$/, ""));
                        queue.clearAsync();
                    }
                );
            }
        );
        
        queue.start();
        queue.on("done", function () {
            console.log(results.join(" "));
            results.join(" ").should.eql("One Two Three Four Five");
        });
    },
    
    "Timeouts": function () {
        var queue;
        
        queue = new AsyncQueue(
            function () {
                queue.setAsync(1000);
                CP.exec("sleep 2; echo \"One\"", function () {
                    queue.clearAsync();
                });
            }
        );
        
        queue.start();
        queue.on("timeout", function (q, fn) {
            console.log("timed out");
        });
    }
};
