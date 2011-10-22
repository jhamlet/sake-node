
var Proteus = require('stitch/util/class'),
    SubClass, SubSubClass, OtherClass,
    instance
;

SubClass = Proteus.create({
    id: "SubClass",

    inherited: function (Class) {
        console.log(Class.id + " is inheriting from " + this.id);
    },
    
    extended: function (Class) {
        // console.dir(this);
        // console.dir(Class);
        console.log(this.id + " is extending: " + Class.id);
    },
    
    included: function (Class) {
        console.log(Class.id + "is including: " + this.id);
    }

}, {
    foo: function foo () {
        return "foo";
    },
    
    bar: function bar () {
        return "bar";
    }
});

OtherClass = Proteus.create({id: "OtherClass"}, {});
console.dir(OtherClass);
console.dir(SubClass);
OtherClass.extend(SubClass);

// SubSubClass = SubClass.create({
//     id: "SubSubClass"
// }, {
//     init: function () {
//         this.id = "A";
//     },
//     
//     foo: function foo () {
//         // console.dir(this.__proto__.__proto__);
//         return "SubFoo " + this.id + ": " + this._super();
//     },
//     
//     bar: function bar () {
//         return this._super();
//     }
// });

// instance = new SubClass();
// console.dir(SubClass);
// console.dir(instance);

// console.dir(SubClass.prototype);

// console.dir(SubSubClass);
// instance = new SubSubClass();
// console.log(instance.foo());
