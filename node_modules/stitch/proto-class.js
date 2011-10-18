
(function (exports) {

var util = require('stitch/util');

exports.create = (function () {
    var _doNotInit = {};
    
    function _include () {
        var len = arguments.length,
            i, obj
        ;

        for (i = 0; i < len; i++) {
            obj = arguments[i];
            util.merge(this, obj);
            if (obj.included) {
                obj.included.call(this);
            }
        }
        return this;
    }
    
    function _mixin () {
        var len = arguments.length,
            i, obj
        ;

        for (i = 0; i < len; i++) {
            obj = arguments[i];
            util.merge(this.prototype, obj);
            if (obj.mixedin) {
                obj.mixedin.call(this);
            }
        }
        return this;
    }
    
    function _extend (statics, props) {
        var prototype = new this(_doNotInit),
            subclass
        ;
        
        if (arguments.length === 1) {
            props = statics;
            statics = null;
        }
        
        subclass = _create(statics, prototype);
        subclass.mixin(props);
        
        subclass.__super__ = this;
        
        return subclass;
    }
    
    function _create (statics, props) {
        var Class = function () {
                var init = this.init;
                if (init && arguments[0] !== _doNotInit) {
                    init.apply(this, arguments);
                }
            }
        ;
        
        if (arguments.length === 1) {
            props = statics;
            statics = null;
        }
        
        Class.constructor = Class;
        
        Class.extend  = _extend;
        Class.mixin   = _mixin;
        Class.include = _include;

        if (statics) {
            Class.include(statics);
        }

        if (props) {
            Class.mixin(props);
        }
        
        return Class;
    }
    
    return _create;
}());

}(exports));