
var should = require("should"),
    util = require("../lib/stitch/util"),
    iFace
;

global.foo = function () {
    return "foo";
}

global.baz = function () {
    return "baz";
}

global.fiz = function () {
    return "fiz";
}

global._buz = "buz";
global.__defineGetter__("buz", function () { return this._buz; });
global.__defineSetter__("buz", function (v) { this._buz = v; })

module.exports = {
    "Swap out the global interface": function () {
        var tmp;
        
        iFace = {
            foo: function () {
                return "fool";
            },
            baz: function () {
                return "bazl";
            },
            fiz: function () {
                return "fizl";
            },
            encodeURIComponent: function () {
                return "eURIC";
            }
        };
        
        tmp = util.swapInterface(global, iFace);
        
        foo().should.eql("fool");
        baz().should.eql("bazl");
        fiz().should.eql("fizl");
        encodeURIComponent().should.eql("eURIC");
        
        util.swapInterface(global, tmp);

        foo().should.eql("foo");
        baz().should.eql("baz");
        fiz().should.eql("fiz");
        encodeURIComponent("+ =?").should.eql("%2B%20%3D%3F");
    },
    
    "Works with getters and setters": function () {
        var tmp;
        
        iFace = {
            get buz () {
                return "buzl";
            },
            set buz (v) {
                this._buz = "buzlplyx";
            }
        };
        
        tmp = util.swapInterface(global, iFace);
        
        buz.should.eql("buzl");
        buz = "buz";
        
        util.swapInterface(global, tmp);
        
        buz.should.eql("buzlplyx");
        
    }
}