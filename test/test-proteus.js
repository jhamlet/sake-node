
var Proteus = require('stitch/proteus'),
    Class1, Class2, Class3,
    instance
;

// Class1 = Proteus.create();
// console.dir(Class1);

Class1 = Proteus.create({
    id: "Class 1",
    
    init: function () {
        console.log("Initing " + this.id);
    },
    
    foo: function () {
        console.log("Foo");
    },
    
    get baz () {
        return this._baz || 0;
    },
    
    set baz (v) {
        this._baz = v;
    }
});

console.log(">>> Class 1 Structure");
console.dir(Class1);
console.log(">>> Class 1 proteus");
console.dir(Class1.proteus);
console.log(">>> Class 1 prototype");
console.dir(Object.getPrototypeOf(Class1));

instance = Class1.create();
console.log(">>> instance of Class 1 Structure");
console.dir(instance);
console.log(">>> prototype of instance of Class 1 Structure");
console.dir(Object.getPrototypeOf(instance));

Class2 = Class1.extend({
    id: "Class 2",
    
    init: function () {
        console.log("Initing Class 2");
    }
});

console.log(">>> Class 2 Structure");
console.dir(Class2);
console.dir(Class2.proteus);

instance = Class2.create();
console.log(">>> instance of Class 2 Structure");
console.dir(instance);
console.log(">>> prototype of instance of Class 2 Structure");
console.dir(Object.getPrototypeOf(instance));

instance.foo();
console.log(instance.baz);
instance.baz = 5;
console.log(instance.baz);
