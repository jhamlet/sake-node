
var Model = require('stitch/model').Model,
    Test,
    instance;

Test = Model.derive({
    foo: ''
});

console.dir(Test);
// console.dir(Model);

instance = new Test();

// console.log(JSON.stringify(Test, null, 4));
// instance.destroy();
console.dir(instance);
// console.log(instance.id);
// console.dir(Object.getPrototypeOf(instance));
// console.dir(Test);