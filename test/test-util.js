
(function (exports) {

var util = require('stitch/util'),
    test
;

test = util.createObject(Object.prototype, {
    init: function (arg) {
        console.log("Initing: " + arg);
    },
    
    name: "Test"
}, "init", 55);

test.name += " More";

console.assert(test.name === "Test More");
console.dir(test);

test = util.createObject(null, {
    init: {
        value: function (arg) {
            console.log("Initing two: " + arg);
        }
    },
    
    name: {
        value: "Test"
    },
    
    third: {
        value: "Third"
    }
    
}, "init", 87);

test.name += " More";

console.assert(test.name === 'Test');
console.dir(test);

}(exports));