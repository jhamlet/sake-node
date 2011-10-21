
var Model = require('stitch/model').Model,
    Test,
    instance;

Test = Model.extend({
    foo: ''
});
// console.dir(Test);
// console.dir(Model);

instance = Test.create();
instance = Test.create();
instance = Test.create();
instance = Test.create();
instance = Test.create();
// console.log(JSON.stringify(Test, null, 4));
instance.destroy();
console.dir(instance);
console.log(instance.id);
console.dir(Object.getPrototypeOf(instance));
console.dir(Test);