
(function (exports) {

var util    = require('stitch/util'),
    Creator = require('stitch/creator'),
    Module
;

util.merge(exports, Creator.extend({
    name: {
        writable: true,
        enumerable: true,
        configurable: false
    },
    
    description: {
        configurable: false,
        writable: true,
        enumerable: true
    },
    
    created: {
        value: function (name, desc) {
            this.name = name;
            this.description = desc || '';
            this.composition = [];
        }
    },
    
    // created: function (name, desc) {
    //     this.name = name;
    //     this.description = desc || '';
    //     this.composition = [];
    // },
    
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
}));

exports.merge(require('stitch/enhance'));

}(exports || window));