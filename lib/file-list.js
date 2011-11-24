
(function () {
    
    var Proteus = require("proteus"),
        Glob    = require("glob"),
        util    = require("./util"),
        FileList
    ;
    //-----------------------------------------------------------------------
    // PRIVATE
    //-----------------------------------------------------------------------
    function addMatching (path) {
        Glob.sync(path).forEach(function (path) {
            if (!this.isExcluded(path)) {
                this.items.push(path);
            }
        }, this);
        return this;
    }
    
    function resolveAdd (path) {
        if (/[*?\[\{]/.test(path)) {
            addMatching.call(this, path);
        }
        else {
            this.items.push(path);
        }
        return this;
    }
    
    function resolveExclude () {
        this.items = this.items.filter(function (path) {
            return this.isExcluded(path);
        });
        return this;
    }
    //-----------------------------------------------------------------------
    // PUBLIC
    //-----------------------------------------------------------------------
    module.exports = FileList = Proteus.Class.derive({
        
        init: function () {
            this.pendingAdd = [];
            this.pending = false;
            this.items = [];

            this.clearExclude();
            
            this.include(util.slice(arguments));
        },
        
        include: function () {
            util.slice(arguments).forEach(function (arg) {
                if (util.isArray(arg)) {
                    this.include.apply(this, arg);
                }
                else if (util.isFunction(arg)) {
                    arg.apply(this, this);
                }
                else {
                    this.pendingAdd.push(arg);
                }
            }, this);
            
            this.pending = true;
            return this;
        },
        
        exclude: function () {
            var excludeProcs    = this.excludeProcs,
                excludePatterns = this.excludePatterns,
                isFn    = util.isFunction,
                isStr   = util.isString
            ;
            
            util.slice(arguments).forEach(function (arg) {

                if (isFn(arg)) {
                    excludeProcs.push(arg);
                    return;
                }
                
                if (isStr(arg)) {
                    arg = new RegExp(arg);
                }
                
                excludePatterns.push(arg);
            });
            
            if (!this.pending) {
                resolveExclude.call(this);
            }

            return this;
        },
        
        clearExclude: function () {
            this.excludePatterns = [];
            this.excludeProcs = [];
            return this;
        },
        
        resolve: function () {
            if (this.pending) {
                this.pending = false;
                this.pendingAdd.forEach(function (path) {
                    resolveAdd.call(this, path);
                }, this);
                this.pendingAdd = [];
                resolveExclude.call(this);
            }
            return this;
        },
        
        isExcluded: function (path) {
            return this.excludePatterns.some(function (pattern) {
                return (pattern instanceof RegExp && pattern.test(path)) ||
                       (pattern.match(/[*?]/) && Glob.fnmatch(
                           pattern, path, Glob.FNM_PATHNAME
                       )) ||
                       path === pattern;
            }) || this.excludeProcs.some(function (fn) { fn(path); });
        }
    });
    
}());