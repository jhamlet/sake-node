(function (exports) {
    
    var util        = require('../util'),
        BaseModel   = require('../model').Model,
        FilterModel
    ;
    
    exports.Model = FilterModel = BaseModel.derive({
        
        self: {
            _PHASES: util.makeEnum("all", "compile", "render")
        },
        
        init: function (name, type, phase, fn) {
            var phases = FilterModel._PHASES;
            
            this.name = name;
            this.type = type || phases.all;
            if (!phases[phase]) {
                throw "Unknown phase '" + phase + "' for filter."
            }
            this.phase = phases[phase];
            this.fn = fn;
            
            FilterModel.__super__.init.apply(this, arguments);
        }
        
    });
    
}(exports));