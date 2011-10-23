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
                ret
            ;
    
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
    
    function _bindProps (child, parent, props) {
        var key, getter, setter, val;
        
        for (key in props) {
            getter = props.__lookupGetter__(key);
            setter = props.__lookupSetter__(key);
            
            if (getter || setter) {
                if (getter) {
                    child.__defineGetter__(key, getter);
                }
                if (setter) {
                    child.__defineSetter__(key, setter);
                }
            }
            else {
                val = props[key];
                if (util.isFunction(val) && _hasSuper.test(val)) {
                    val = _bindSuper(val, parent[key] || util.noop);
                }
                child[key] = val;
            }
        }
    }
    
    function _extend (mixins) {
        var proto = new this(_doNotInit),
            Proteus
        ;
        
        _bindProps(proto, this, mixins);
        
        return _create(proto);
    }
    
    function _augment (props) {
        _bindProps(this, this.__proteus__, props);
    }
    
    function _create (proto) {
        var Proteus = function Proteus () {
            var initialize = arguments[0] !== _doNotInit,
                init
            ;

            if (initialize && Proteus.initialized) {
                Proteus.initialized(this, arguments);
            }
            
            if (initialize && (init = this.init)) {
                init.apply(this, arguments);
            }
        };
        
        if (proto) {
            Proteus.prototype = proto;
        }
        
        Proteus.constructor = Proteus;
        Proteus.__proteus__ = this;
        Proteus.extend  = _extend;
        Proteus.augment = _augment;
        
        if (this.extended) {
            this.extended(Proteus);
        }
        
        return Proteus;
    }
    
    exports.create = _create;
    
}(exports));