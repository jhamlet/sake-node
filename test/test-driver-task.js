
var should = require("should"),
    sake   = require("../lib/driver/sake")
;

function later (fn, sec) {
    setTimeout(fn, sec * 1000);
}

module.exports = {
    "Synchronous invocation order is correct": function () {
        var results = [],
            fn = function (t) {
                results.push(t.name);
            }
        ;
        
        sake.task("one", fn);
        sake.task("two", ["one"], function (t) {
            fn.call(t, t);
            sake.task("two.5", function (t) {
                fn.call(t, t);
                sake.task("two.5.5", function (t) {
                    fn.call(t, t);
                }).invoke();
            }).invoke();
        });
        sake.task("three", ["two"], function (t) {
            sake.task("three.1", fn);
            sake.task("three.2", ["three.1"], fn);
            sake.task("three.3", ["three.2"], fn);
            sake.task("three.4", ["three.3"], fn);
            sake.task("three.5", ["three.4"], fn);
            sake.Task.invoke("three.5");
        });
        
        sake.Task.invoke("three");
        
        results.join(" ").should.eql("one two two.5 two.5.5 three.1 three.2 three.3 three.4 three.5");
    },
    
    "Asynchronous invocation order is correct": function (beforeExit, assert) {
        var results = [],
            fn = function (t) {
                    t.begin();
                    later(function () {
                        results.push(t.name);
                        t.complete();
                    }, 1);
                }
        ;
        
        sake.task("async1", fn);
        sake.task("async2", ["async1"], function (t) {
            fn.call(t, t);
            sake.task("async2.1", fn);
            sake.task("async2.2", ["async2.1"], fn);
            sake.task("async2.3", ["async2.2"], fn);
            
            sake.Task.invoke("async2.3");
        });
        sake.task("async3", ["async2"], fn);
        
        sake.Task.invoke("async3");
        
        beforeExit(function () {
            results.join(" ").should.eql("async1 async2 async2.1 async2.2 async2.3 async3");
        });
    }
};
