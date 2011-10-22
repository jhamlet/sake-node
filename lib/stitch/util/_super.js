
(function (exports) {
    
    exports._super = function _super () {
        var // The number of arguments given,
            // helps in determining if a getter or a setter
            arglen = arguments.length,
            // The function that called _super
            caller,
            // The current prototype scope
            scope,
            // name of the _super property
            name,
            // useful in looping over our properties
            props, i, len, prop,
            // the super function and its reutrn value
            ownFn, fn, ret
        ;

        scope = this.__superScope__ || this;

        name = this.__superProperty__ || 
                (caller = arguments.callee.caller).name ||
                caller.__name__
        ;

        // Figure out the method that called _super
        // See if the function is named, or we've been down this route before
        // and applied our own label to the function (since we can not modify
        // the 'name' property of a function)
        //
        // if not, we have to loop over our properties and find the one that
        // matches our caller -- We could do this in our 'create' function,
        // basically pre-compute an objects function names, but the cost would
        // be for every object and property, even if they do not call _super
        //
        // You prevent this lookup process by 'naming' your functions, i.e:
        //      some.prototype = {
        //            propname: function propname (...) {...},
        //      }
        //

        if (!name) {
            // console.warn("WARNING: Name your functions to avoid this warning.");
            props = Object.getOwnPropertyNames(scope);
            len = props.length;
            for (i = 0; i < len; i++) {
                prop = Object.getOwnPropertyDescriptor(scope, props[i]);
                if ((   ((ownFn = prop.get) && !arglen) ||
                        ((ownFn = prop.set) && arglen) ||
                        typeof (ownFn = prop.value) === "function") &&
                    ownFn === caller
                ) {
                    // Set a variable on the originating function so it is faster
                    // to get the property name next time _super is called
                    name = ownFn.__name__ = props[i];
                    break;
                }
            }
        }

        if (!this.__superProperty__) {
            this.__superProperty__ = name;
        }

        // We're done with this scope, clear out our temporary variable
        delete scope.__superScope__;

        // Ooopsss... You said call _super, but you really didn't mean to
        if (!(scope = Object.getPrototypeOf(scope))) {
            // We've dropped off the prototype chain
            throw new Error("No super '" + name + "' property found.");
        }

        // Set our new position in the scope chain
        scope.__superScope__ = scope;

        if ((prop = Object.getOwnPropertyDescriptor(scope, name))) {
            switch (typeof prop.value) {
                case "function":
                    fn = prop.value;
                    break;
                case "undefined": // Getter/Setter
                    fn = prop[arglen ? 'set' : 'get'];
                    break;
                default: // plain property
                    ret = prop.value;
            }

            // execute the function in the context of original caller, or this,
            // and hang on to the results for a moment.
            if (fn) {
                ret = fn.apply(this, arguments);
            }

            // clean up
            delete scope.__superScope__;
            delete this.__superProperty__;

            return ret;
        }

        // keep looking...
        return this._super();
    };
    
}(exports));