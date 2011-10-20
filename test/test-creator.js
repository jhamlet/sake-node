
(function (exports) {

var Creator = require('stitch/creator'),
    Test, Test2, Test3,
    instance;

Test = Creator.extend({
    created: function () {
        this.name = "Test";
        console.log("Initing Test instance.");
    },
    otherProp: "def",
    woohoo: function (txt) {
        console.log("woohoo: " + this.name + " says '" + txt + "'");
    }
});

// console.dir(Test);
// instance = Test.create();
// console.dir(instance);

Test2 = Test.extend({
    created: function () {
        Test2.__super__.created.call(this);
        console.log("Initing Test 2 instance");
        this.name = "Test 2";
    }
});

console.log(Test2);
instance = Test2.create();
console.log(instance);
console.log(instance.__proto__);

}(exports));