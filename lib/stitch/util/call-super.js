(function (exports) {
    
    /**
     * Short-cut some properties to this scope.
     * We'll short-cut them again in the function below, but the first look-up
     * will be slightly faster this way.
     */
    var object        = Object,
        hasOwnFn      = object.prototype.hasOwnProperty,
        getProtoOf    = object.getPrototypeOf,
        getPropDesc   = object.getOwnPropertyDescriptor,
        superProperty = "__superProperty__",
        superScope    = "__superScope__",
        superChildFunction = "__superChildFunction__"
    ;
    
    function getOwnFunction (pDesc, caller, arglen) {
        var ownFn;
        if (
            (typeof (ownFn = pDesc.value) === "function" ||
                arglen && (ownFn = pDesc.set) ||
                !arglen && (ownFn = pDesc.get)) &&
            ownFn === caller
        ) {
            return ownFn;
        }
    }
    
    exports.callSuper = function callSuper () {
        var hasOwn      = hasOwnFn,
            Obj         = object,
            getProto    = getProtoOf,
            getOwnDesc  = getPropDesc,
            getOwnFn    = getOwnFunction,
            childFn     = superChildFunction,
            arglen      = arguments.length,
            caller      = callSuper.caller,
            superProp   = superProperty,
            superScope  = superScope,
            scope       = this,
            reentrant   = hasOwn.call(scope, superProp),
            name, props, i, p, pDesc, ownFn, fn, ret
        ;
        
        // See if we can get our function name here
        if (reentrant) {
            ownFn = this[childFn];
            name = ownFn.name || ownFn.__name__;
        } else {
            name = caller.name || caller.__name__;
        }
        /**
         * If we are in the middle of a callSuper cycle, advance to the
         * current prototype scope
         */
        while (reentrant && !hasOwn.call(scope, superScope)) {
            scope = getProto.call(Obj, scope);
        }
        /**
         * If don't have a name at this point we have to advance through the
         * prototype chain iterating over each objects own properties until
         * we find one that matches our caller. We'll tag the final function
         * ourselves, so we wont have to do this again
         */
        if (!name) {
            do {
                props = Obj.getOwnPropertyNames(Obj, scope);
                i = props.length;
                while (--i) {
                    p = props[i];
                    pDesc = getOwnDesc.call(Obj, scope, p);
                    if (pDesc && (ownFn = getOwnFn(pDesc, caller, arglen))) {
                        name = ownFn.__name__ = p;
                        break;
                    }
                }
            } while (!name && (scope = getProto.call(Obj, scope)));
        }
        /**
         * Otherwise, we have to advance to the prototype scope where our
         * caller function was called from.
         */
        else if (!ownFn) {
            do {
                if ((pDesc = getOwnDesc.call(Obj, scope, name))) {
                    console.log(scope);
                    ownFn = getOwnFn(pDesc, caller, arglen);
                    break;
                }
            } while ((scope = getProto.call(Obj, scope)));
        }
        /**
         * Ok, we should have our own function and be at the right level of
         * the prototype chain by now...
         * ...lets find the super property...
         */
        if (!reentrant) {
            // mark our current territory
            this[superProp] = name;
            this[childFn] = ownFn;
        }
        // We're moving on, so let's delete our scope marker, if any
        delete scope[superScope];
        // Onward...
        while ((scope = getProto.call(Obj, scope))) {
            if ((pDesc = getPropDesc.call(Obj, scope, name))) {
                switch (typeof pDesc.value) {
                    case "function":
                        fn = pDesc.value;
                        break;
                    case "undefined":
                        fn = pDesc[arglen ? "set" : "get"];
                        break;
                    default:
                        ret = pDesc.value;
                }
                scope[superScope] = true;
                // execute the function in the context of original caller, or 
                // this, and hang on to the results for a moment.
                if (fn) {
                    ret = fn.apply(this, arguments);
                }
                // clean-up our markers
                delete scope[superScope];
                delete this[superProp];
                delete this[childFn];
                // return
                return ret;
            }
        }
        // Ooopsss... You said call super, but you really didn't mean to
        throw new Error("No super '" + name + "' property found.");
    };
    
}(exports));