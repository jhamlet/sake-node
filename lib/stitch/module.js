
(function (exports) {

var util    = require('stitch/util'),
    Proteus = require('stitch/proteus'),
    Module
;

exports.Module = Module = Proteus.create({

    init: function (name, desc) {
        this.name = name;
        this.description = desc || '';
        this.composition = [];
    },
    
    /**
     * 
     * @method compose
     * @returns {object} the Module instance
     */
    compose: function () {
        this.composed = true;
        return this;
    },
    
    render: function (type) {
        if (!this.composed) {
            this.compose();
        }
        return "Render some output...\n" + this.composition.join("\n");
    }
});

Module.include(require('stitch/enhance'));

}(exports));