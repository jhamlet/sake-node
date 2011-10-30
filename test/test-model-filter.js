
var should = require("should"),
    FilterModel = require("../lib/stitch/model/filter").Model
;

module.exports = {
    "Module Filter Model is Loaded": function () {
        should.exist(FilterModel);
        FilterModel.should.be.a("function");
    },
    
    "Record creation": function () {
        var filter = new FilterModel("foo", "js", "render");
        
        should.exist(filter);
        filter.name.should.eql("foo");
        filter.type.should.eql("js");
        filter.phase.should.eql("render");
        
    },
    
    "Records can have same name": function () {
        // var jsmin = new FilterModel("minify", "js", "render"),
        //     jsmin2 = new FilterModel("minify", "js", "render"),
        //     cssmin = new FilterModel("minify", "css", "render");
        // 
        // jsmin.should.eql(jsmin2);
        // jsmin.should.not.eql(cssmin);
    }
};
