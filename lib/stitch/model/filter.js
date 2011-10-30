(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model.js').Model,
        FilterModel
    ;
    
    exports.Model = FilterModel = BaseModel.derive({
        
        self: {
            _PHASES: util.makeEnum("compile", "render")
        },
        
        init: function (name, type, phase, fn) {
            this.name = name;
            this.type = type || "all";
            if (!FilterModel._PHASES[phase]) {
                throw "Unknown phase '" + phase + "' for filter."
            }
            this.phase = FilterModel._PHASES[phase];
            this.fn = fn;
        }
        
    });
    
}(exports));