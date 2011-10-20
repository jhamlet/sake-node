
(function (exports) {

var util    = require('stitch/util'),
    Creator = require('stitch/creator')
;

util.merge(exports, Creator.extend({

    created: function (name, desc) {
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
}));

exports.include(require('stitch/enhance'));

}(exports));