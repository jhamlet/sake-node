var util    = require('../util'),
    Model   = require('../model'),
    FilterModel
;

module.exports = FilterModel = Model.derive({
    
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
