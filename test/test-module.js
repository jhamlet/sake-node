
(function (exports) {
    var Module = require('stitch/module').Module,
        Test,
        instance;
    
    console.dir(Module);
    instance = Module.create("test", "test description");
    console.dir(instance);
    
    Test = Module.extend({
        someprop: "foo"
    });
    
    console.dir(Test);
    console.dir(Test.extend);
    console.dir(Test.merge);
    console.dir(Test.include);
    console.dir(Test.create);
    
}());
