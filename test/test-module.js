
(function (exports) {
    var Module = require('stitch/module'),
        instance;
    
    console.dir(Module);
    instance = Module.create("test", "test description");
    console.dir(instance);
}());