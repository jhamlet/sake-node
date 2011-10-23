/**
 * Proteus |ˈprōtēəs; ˈprōˌt(y)oōs|
 * 
 * Greek Mythology a minor sea god (son of Oceanus and Tethys) who had the
 * power of prophecy but who would assume different shapes to avoid answering
 * questions.
 * 
 * From the Greek protos "first."
 */
(function (exports) {
    
    var util = require('stitch/util'),
        _hasSuper = /\b_super\b/,
        _doNotInit = {}
    ;

    function _bindSuper (value, superValue) {
        return function () {
            var tmp = this._super,
                ret;
    
            this._super = superValue;

            ret = value.apply(this, arguments);
            
            if (tmp) {
                this._super = tmp;
            } else {
                delete this._super;
            }
            
            return ret;
        };
    }
    
    function _extend (mixins) {
        var Proteus = new this(_doNotInit),
            key, getter, setter, val
        ;
        
        for (key in mixins) {
            getter = mixins.__lookupGetter__(key);
            setter = mixins.__lookupSetter__(key);
            
            if (getter || setter) {
                if (getter) {
                    Proteus.__defineGetter__(key, getter);
                }
                if (setter) {
                    Proteus.__defineSetter__(key, setter);
                }
            }
            else {
                val = mixins[key];
                if (util.isFunction(val) && _hasSuper.test(val)) {
                    val = _bindSuper(val, this.prototype[key] || util.noop);
                }
                Proteus[key] = val;
            }
        }
        
        return _create(Proteus);
    }
    
    function _create (proteus) {
        var Proteus = function Proteus () {
            var init = this.init;

            if (init && arguments[0] !== _doNotInit) {
                init.apply(this, arguments);
            }
        };
        
        if (proteus) {
            Proteus.prototype = proteus;
        }
        
        Proteus.constructor = Proteus;

        Proteus.extend  = _extend;
        
        return Proteus;
    }
    
    
    exports.create = _create;
    
}(exports));