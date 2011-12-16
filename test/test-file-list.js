
var should   = require("should"),
    FS       = require("fs"),
    FileList = require("../lib/file-list"),
    Task     = require("../lib/model/task"),
    FileTask = require("../lib/model/task/file-task")
;

module.exports = {
    "Exists": function () {
    
        var fl = new FileList();
        
        should.exist(fl);
        fl.should.be.instanceof(FileList);
    },
    
    "Include Glob": function () {
        var fl = new FileList();
        
        fl.include("test/test-*");
        
        fl.items.should.contain("test/test-file-list.js");
    },
    
    "Exclude Glob": function () {
        var fl = new FileList();
        
        fl.include("test/*.js");
        fl.exclude("test/test-*");
        
        fl.items.should.not.contain("test/test-stitch.js");
    },
    
    "Exclude RegExp": function () {
        var fl = new FileList();
        
        fl.include("test/*.js");
        fl.exclude(/test\/(?!test).*\.js$/);
        
        fl.items.should.not.contain("test/other-config.js");
        fl.items.should.not.contain("test/sample.js");
    },
    
    "Trap non-existant files": function () {
        var fl = new FileList("test/*");
        fl.include("test/test-fake-name");
        fl.existing().items.should.not.contain("test/test-fake-name");
        fl.notExisting().items.should.contain("test/test-fake-name");
    },
    
    "FileList expands into task dependencies": function () {
        var fl = new FileList("test/test-*"),
            task;
        
        fl.exclude(/model/, /app/, /driver/, /tasks/);
        
        task = new FileTask("test.txt", fl, function (t) {
            var preqs = t.prerequisites;
            
            preqs.should.not.contain("test/test-driver-sake.js");
            preqs.should.not.contain("test/test-driver-task.js");
            preqs.should.not.contain("test/test-model.js");
            preqs.should.not.contain("test/test-tasks.js");
            
        });
        
        task.invoke();
    },
    
    "Filtering FileList returns a cloned FileList": function () {
        var origFl = new FileList("lib/**/*").exclude("lib/driver/*");
        
        origFl.grep(/model\//).should.not.equal(origFl);
    },
    
    "Chaining FileList methods together": function () {
        var origFl = new FileList("**/*"),
            newList;
        
        origFl.exclude(/^(?!lib)/);
        
        newList = origFl.extension(".js").grep(/^lib\/(?!driver)/).items;
        newList.forEach(function (f) {
            f.should.match(/^lib/);
        });
    },
    
    "Clone a FileList": function () {
        var origFl = new FileList().include("**/*"),
            cloneFl
        ;
        
        cloneFl = origFl.extension(".js").exclude(/^(?!lib)/);
        
        cloneFl.forEach(function (f) {
            f.should.match(/^lib/);
            f.should.match(/\.js$/);
        });
    }
};
