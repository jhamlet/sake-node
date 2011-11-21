
var should = require("should"),
    StringScanner = require("../lib/parser/string-scanner");

module.exports = {
    "Basic Test": function () {
        var scanner = new StringScanner("A test string");
        
        scanner.scan(/\w+/).should.eql("A");
        
        scanner.scan(/\s+/).should.eql(" ");
        
        scanner.scan(/\w+/).should.eql("test");

        scanner.scanUntil(/(string)/).should.eql(" string");
        scanner.getCapture(0).should.eql("string");
    }
}