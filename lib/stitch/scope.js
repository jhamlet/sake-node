
(function () {
    var Proteus     = require("proteus"),
        VM          = require("vm"),
        util        = require("./util"),
        scopeStack  = [],
        _empty      = {},
        StitchScope = {}
    ;

    //-----------------------------------------------------------------------
    // PRIVATES
    //-----------------------------------------------------------------------
    /**
     * Merge some objects together
     * 
     * @param receiver {object} the object to merge onto
     * @param rest {objects} additional objects to merge
     * @returns {object} the, now modified, receiver
     */
    function mergeScope (receiver) {
        var len = arguments.length,
            i = 1,
            getProp = Proteus.getPropertyDescriptor,
            defProp = Object.defineProperty,
            key, supplier, spec
        ;
        
        for (; i < len; i++) {
            supplier = arguments[i];
            for (key in supplier) {
                defProp(receiver, key, getProp(supplier, key));
            }
        }
        
        return receiver;
    }
    
    /**
     * Create a new scope object by merging the new scope's properties onto
     * the previous scope's properties.
     * 
     * @param scope {object} the new object to create a scope out of
     * @returns {object} the new scope
     */
    function createScope (scope) {
        var /**
             * We have to merge our scope objects together because node's VM
             * doesn't do prototype lookup on the object used as a context.
             * (Internally it's probably copying 'own' properties over..)
             */
            newScope = mergeScope(
                {},
                StitchScope.currentScope || global,
                scope || _empty
            );

        // Reset some circular pointers to point at the newScope
        newScope.global = newScope.GLOBAL = newScope.root = newScope;
        
        return newScope;
    }
    
    /**
     * Copy all the properties from scope onto the global object
     * 
     * @param scope {object} scope to copy onto the global scope
     */
    function copyToGlobal (scope) {
        var getProp = Object.getOwnPropertyDescriptor,
            defProp = Object.defineProperty
        ;
        
        if (!scope) {
            return;
        }
        
        Object.keys(scope).forEach(function (key) {
            defProp(global, key, getProp(scope, key));
        });
    }
    
    //-----------------------------------------------------------------------
    // PUBLICS
    //-----------------------------------------------------------------------
    module.exports = Object.defineProperties(StitchScope, {
        /**
         * Get the current scope object
         * 
         * @property currentScope
         * @type {object}
         */
        currentScope: {
            get: function () {
                return scopeStack[scopeStack.length - 1];
            }
        },
        
        /**
         * Copy the passed in scope object's properties onto the global scope
         * and then run the function.  After its done running, return the
         * global scope to what it was previously.
         * 
         * @method callInNewGlobal
         * @param fn {function} the function to call
         * @param scope {object} the object to use as the new scope
         * @param rest {mixed} additional params to pass to the function
         * @returns {mixed} the results of the function call
         */
        callInNewGlobal: {
            value: function (fn, scope) {
                var result;
                
                // get a merged object of all defined scope properties
                scopeStack.push(createScope(scope));
                
                // copy our new scope to the global object
                copyToGlobal(this.currentScope);
                
                // Apply the function
                result = fn.apply(this.currentScope, util.slice(arguments, 2));
                
                // Reduce our scope stack
                scopeStack.pop();
                
                // Return our previous scope to the global
                copyToGlobal(this.currentScope);
                
                // return the result of the function call
                return result;
            }
        },
        
        /**
         * Run a string of code in a new virtual machine, setting the passed
         * scope as the global context object.
         * 
         * @method runInNewScope
         * @param code {string|function} code to run
         * @param scope {object} new scope object
         * @param filename {string} optional, filename to set for the vm
         */
        runInNewScope: {
            value: function (code, scope, filename) {
                var getProp = Proteus.getPropertyDescriptor,
                    defProp = Object.defineProperty,
                    scopeProps,
                    currentScope
                ;
                
                // Create a new scope
                scopeStack.push(createScope(scope));

                // Store our in-going prop keys
                scopeProps = util.makeEnum.apply(
                    util,
                    Object.keys(this.currentScope)
                );
                
                // Run VM in current scope
                VM.runInNewContext(
                    typeof code === "function" ? "(" + code + "());" : code,
                    this.currentScope,
                    filename || "scope.vm"
                );
                
                // Reduce our scope stack
                scope = scopeStack.pop();

                // If we have more properties after running, than before,
                // copy the new properties up the scope chain
                currentScope = this.currentScope || global;
                Object.keys(scope).forEach(function (key) {
                    if (!scopeProps[key]) {
                        defProp(currentScope, key, getProp(scope, key));
                    }
                }, this);
            }
        }
    });

}());
