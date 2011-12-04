
var should  = require("should"),
    Model   = require("../lib/model"),
    Task    = require("../lib/model/task"),
    FileTask = require("../lib/model/task/file-task"),
    FileCreateTask = require("../lib/model/task/file-create-task")
;


module.exports = {
    
    "Should exist": function () {
        should.exist(Task);
        Task.should.be.a("function");
    },
    
    "Simple Test": function (beforeExit, assert) {
        var obj = {};
        
        new Task("core", function (t) {
            obj[t.name] = true;
        });
        
        new Task("sub", ["core"], function (t) {
            obj[t.name] = true;
        });
        
        Task.get("core").isNeeded.should.eql(true);
        Task.get("sub").isNeeded.should.eql(true);

        Task.invoke("sub");
        
        beforeExit(function () {
            obj.core.should.eql(true);
            obj.sub.should.eql(true);

            Task.get("sub").alreadyRun.should.eql(true);
            Task.get("core").alreadyRun.should.eql(true);
        });
    },
    
    "Instance of Task": function () {
        var task = new Task("base"),
            task2 = new FileTask("some/file/path"),
            task3 = new FileCreateTask("some/path")
        ;
        
        task.should.be.an.instanceof(Model);
        task.should.be.an.instanceof(Task);
        task2.should.be.an.instanceof(Task);
        task3.should.be.an.instanceof(Task);
    }
};
