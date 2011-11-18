
(function () {
    var Proteus = require("proteus"),
        VM      = require("vm"),
        scopeStack = [],
        StitchScope
    ;

    module.exports = Object.defineProperties((StitchScope = {}), {
        console: {
            get: function () {
                return console;
            }
        },
        require: {
            get: function () {
                return require;
            }
        },
        environment: {
            get: function () {
                return process.env;
            }
        },
        env: {
            get: function () {
                return StitchScope.environment;
            }
        },
        run: {
            value: function (code, filename) {
                var ctx = VM.createContext(scopeStack[scopeStack.length - 1]);

                code = typeof code === "function" ?
                    "(" + code + "());" :
                    code;
                
                VM.runInContext(code, ctx, filename || "scipt.vm");
            }
        },
        runInNewScope: {
            value: function (code, scope, args, filename) {
                var currentScope = scopeStack[scopeStack.length - 1],
                    ctx;
                
                if (!filename && !Array.isArray(args)) {
                    filename = args;
                }
                /**
                 * We have to merge our scope objects together because node's VM
                 * doesn't do prototype lookup on the object used as a context.
                 * (Internally it's probably copying 'own' properties over..)
                 */
                scopeStack.push(Proteus.mergeAll({}, currentScope, scope));

                ctx = VM.createContext(scopeStack[scopeStack.length - 1]);
                this.run(code,filename);

                return scopeStack.pop();
            }
        }
    });

    scopeStack.push(StitchScope);
}());
