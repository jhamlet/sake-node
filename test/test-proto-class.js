
(function (exports) {

var ProtoClass = require('stitch/proto-class'),
    Test, Test2, Test3,
    instance;

Test = ProtoClass.create({
    init: function () {
        this.name = "Test";
        console.log("Initing Test instance.");
    },
    otherProp: "def",
    woohoo: function (txt) {
        console.log("woohoo: " + this.name + " says '" + txt + "'");
    }
});

// console.dir(Test);
// console.dir(Test.prototype);
// 
// instance = new Test();
// console.dir(instance);
// console.dir(instance.__proto__);

Test2 = Test.extend({
    init: function () {
        Test2.__super__.init.call(this);
        console.log("Initing Test2 instance.");
        this.name = "Test 2";
    },
    woohoo: function () {
        console.log("Calling Test2#woohoo");
        Test2.__super__.woohoo.apply(this, arguments);
    }
});

// console.dir(Test2);
// console.dir(Test2.prototype);
// 
// instance = new Test2();
// console.dir(instance);
// console.dir(instance.__proto__);
// console.log(instance.otherProp);

Test3 = Test2.extend({
    init: function () {
        Test3.__super__.init.call(this);
        console.log("Initing Test3 instance.");
        this.name = "Test 3";
        this.woohoo("hello");
    },
    
    woohoo: function () {
        console.log("Calling Test3#woohoo");
        Test3.__super__.woohoo.call(this, "hello");
    }
});

// console.dir(Test3);
// console.dir(Test3.prototype);

instance = new Test3();
// console.dir(instance);
// console.dir(instance.__proto__);
// console.log(instance.otherProp);

}(exports));