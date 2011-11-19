
(function () {
    var Proteus     = require("proteus"),
        VM          = require("vm"),
        scopeStack  = [],
        _empty      = {},
        StitchScope = {}
    ;

    function createScope (scope) {
        var /**
             * We have to merge our scope objects together because node's VM
             * doesn't do prototype lookup on the object used as a context.
             * (Internally it's probably copying 'own' properties over..)
             */
            newScope = Proteus.mergeAll(
                {},
                scopeStack[scopeStack.length - 1],
                scope || _empty
            );
        
        // Reset some circular pointers to point at the newScope
        newScope.global = newScope.GLOBAL = newScope.root = newScope;
        
        scopeStack.push(newScope);
        return newScope;
    }
    
    module.exports = Object.defineProperties(StitchScope, {
        currentScope: {
            get: function () {
                return scopeStack[scopeStack.length - 1];
            }
        },
        
        callInNewScope: {
            value: function (fn, scope) {
                var // Store our currently defined globals
                    stored = Proteus.mergeAll({}, global),
                    result
                ;
                
                // get a merged object of all defined scope properties
                scope = createScope(scope);
                
                // Copy our scope onto the global object
                Proteus.mergeAll(global, scope);

                // Apply the function
                result = fn.apply(scope, Proteus.slice(arguments, 2));
                
                // Reduce our scope stack
                scopeStack.pop();
                
                // Return our previously defined globals
                Proteus.mergeAll(global, stored);
                
                // return the result of the function call
                return result;
            }
        },
        
        runInNewScope: {
            value: function (code, scope, filename) {
                scope = createScope(scope);
                VM.runInNewContext(code, scope, filename || "scope.vm");
                return scopeStack.pop();
            }
        }
    });

    createScope(global);
    
    // var keys = Object.getOwnPropertyNames(global);
    // console.log(keys);
    // console.log(StitchScope.runInNewScope("var foo = 'foo'; console.log(foo);"));
    
    // var obj = {
    //     foo: function () {
    //         console.log("foo");
    //     }
    // };
    // 
    // StitchScope.callInNewScope(function (arg) {
    //     arg.foo();
    // }, obj, obj);
}());
