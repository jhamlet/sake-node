
(function (exports) {

var stitch      = require('stitch'),
    util        = require('stitch/util'),
    Class       = require('stitch/class').Class,
    Creator     = require('stitch/creator'),
    Module
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

exports.apply(require('stitch/enhance'));

// exports.Module = Module = Class.create({
//     init: function (name, desc) {
//         this.name = name;
//         this.description = desc;
//         this.composition = [];
//     },
//     
//     /**
//      * 
//      * @method compose
//      * @returns {object} the Module instance
//      */
//     compose: function () {
//         this.composed = true;
//         return this;
//     },
//     
//     render: function (type) {
//         if (!this.composed) {
//             this.compose();
//         }
//         return "Render some output...\n" + this.composition.join("\n");
//     }
// });

// Module.mixin(require('stitch/enhance'));

}(exports || window));