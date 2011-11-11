
var should = require("should"),
    Task   = require("../lib/stitch/task")
;


module.exports = {
    
    "Should exist": function () {
        should.exist(Task);
        Task.should.be.a("function");
    },
    
    "Simple Test": function () {
        var obj = {};
        
        new Task("core", function (t) {
            obj[t.name] = true;
        });
        
        new Task("sub", ["core"], function (t) {
            obj[t.name] = true;
        });
        
        Task.invoke("sub");
        
        obj.core.should.eql(true);
        obj.sub.should.eql(true);
    }
};
