
var util    = require('stitch/util'),
    Proteus = require('stitch/util/proteus'),
    Class1, Class2, Class3,
    instance
;

console.dir(Proteus);
Class1 = Proteus.createClass({
    init: function (arg) {
        console.log("Class 1: " + arg);
    }
}).extend({
    initializing: function (obj, args) {
        console.log("Class 1 initializing instance");
    },
    
    included: function (proteus) {
        console.log("Class 1 included");
    },
    
    extended: function (proteus) {
        console.log("Class 1 enhancing");
    }
});

console.dir(Class1);
instance = new Class1("Hello World");
console.dir(instance);

Class2 = Class1.derive({
    init: function (arg) {
        console.log("Class 2: " + arg);
        Class2.__super__.init.call(this, arg);
    }
}).extend({
    initializing: function (obj, args) {
        console.log("Class 2 initializing instance");
        Class1.initializing.call(this, obj, args);
    }
});

// Class2.extend(Class1);
// Class2.include(Class1);

console.dir(Class2);
instance = new Class2("Hello World");
console.dir(instance);

Class3 = Proteus.createClass();
console.dir(Class3);