
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
    
    "Returned items is not internal items": function () {
        var fl = new FileList(),
            ret;
    
        fl.include("test/*.js");
        
        ret = fl.sort(function (a, b) {
            return a < b;
        });
    
        ret.should.not.eql(fl.__items__);
    },
    
    // "Automatically exclude directories": function () {
    //     var fl = new FileList("../**/*");
    //     
    //     fl.items.forEach(function (path) {
    //         FS.statSync(path).isDirectory().should.eql(false);
    //     });
    // },
    
    "Trap non-existant files": function () {
        var fl = new FileList("test/*");
        fl.include("test/test-fake-name");
        fl.items.should.not.contain("test/test-fake-name/");
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
    }
};
